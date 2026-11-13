// Simpan sebagai: supabase/functions/create-staff/index.ts
// Deploy:         supabase functions deploy create-staff
//
// Membuat akun staf (Supabase Auth) + baris profilnya. Hanya boleh dipanggil Notaris aktif.
// Login aplikasi memakai EMAIL, jadi tidak ada username. Prasyarat: kolom `profiles.email`
// (dibuat oleh supabase/profiles-rls.sql).
import { createClient } from 'npm:@supabase/supabase-js@2';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  });

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[0-9+\-\s()]{6,20}$/;
const MIN_PASSWORD = 8;

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'Metode tidak diizinkan' }, 405);

  // Service role hanya ada di server (disuntikkan Supabase), tidak pernah dikirim ke aplikasi.
  const admin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );

  // 1. Pastikan pemanggil adalah Notaris aktif.
  const jwt = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '');
  if (!jwt) return json({ error: 'Tidak terautentikasi' }, 401);

  const { data: auth, error: authErr } = await admin.auth.getUser(jwt);
  if (authErr || !auth.user) return json({ error: 'Tidak terautentikasi' }, 401);

  const { data: me, error: meErr } = await admin
    .from('profiles')
    .select('role, is_active')
    .eq('id', auth.user.id)
    .maybeSingle();
  if (meErr) {
    console.error('cek peran gagal:', meErr.message);
    return json({ error: 'Gagal memeriksa hak akses' }, 500);
  }
  const role = String(me?.role ?? '').toLowerCase();
  if (role !== 'notaris' || !me?.is_active) {
    return json({ error: 'Hanya Notaris yang dapat menambah staf' }, 403);
  }

  // 2. Validasi input.
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Isi permintaan bukan JSON yang valid' }, 400);
  }

  const name = String(body.name ?? '').trim();
  const email = String(body.email ?? '').trim().toLowerCase();
  const phone = String(body.phone ?? '').trim();
  const password = String(body.password ?? '');

  if (!name) return json({ error: 'Nama staf wajib diisi' }, 400);
  if (!EMAIL_PATTERN.test(email)) return json({ error: 'Format email tidak valid' }, 400);
  if (phone && !PHONE_PATTERN.test(phone)) return json({ error: 'Format nomor telepon tidak valid' }, 400);
  if (password.length < MIN_PASSWORD) {
    return json({ error: `Kata sandi minimal ${MIN_PASSWORD} karakter` }, 400);
  }

  const username = String(body.username ?? '').trim().toLowerCase();

  // 3. Buat akun login, lalu profilnya. Gagal di profil -> batalkan akun login.
  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: name, username },
  });
  if (createErr || !created.user) {
    const taken = /already|registered|exists/i.test(createErr?.message ?? '');
    return json(
      { error: taken ? 'Email sudah terdaftar' : (createErr?.message ?? 'Gagal membuat akun') },
      taken ? 409 : 400
    );
  }

  // upsert: aman bila trigger `handle_new_user` (opsional di profiles-rls.sql) sudah membuat barisnya.
  let { error: profErr } = await admin.from('profiles').upsert(
    {
      id: created.user.id,
      full_name: name,
      role: 'staff',
      phone: phone || null,
      is_active: true,
      email,
      username: username || email.split('@')[0],
    },
    { onConflict: 'id' }
  );

  // Jika kolom username belum ada di database, coba upsert tanpa username
  if (profErr && /username/i.test(profErr.message)) {
    const fallback = await admin.from('profiles').upsert(
      {
        id: created.user.id,
        full_name: name,
        role: 'staff',
        phone: phone || null,
        is_active: true,
        email,
      },
      { onConflict: 'id' }
    );
    profErr = fallback.error;
  }

  if (profErr) {
    console.error('simpan profil gagal:', profErr.message);
    await admin.auth.admin.deleteUser(created.user.id);
    return json({ error: 'Gagal menyimpan profil staf: ' + profErr.message }, 400);
  }

  // 4. Catat audit trail secara resmi melalui RPC record_staff_created
  const { error: auditErr } = await admin.rpc('record_staff_created', {
    p_actor_id: auth.user.id,
    p_target_id: created.user.id,
  });
  if (auditErr) {
    console.warn('Peringatan: Gagal mencatat audit staff_created:', auditErr.message);
  }

  return json({ ok: true, id: created.user.id });
});