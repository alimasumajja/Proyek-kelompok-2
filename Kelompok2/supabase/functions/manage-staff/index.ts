import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const PREF_KEYS = ['deadlineNear', 'newIssue', 'noUpdate'] as const;

function parsePrefs(value: unknown): Record<(typeof PREF_KEYS)[number], boolean> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const input = value as Record<string, unknown>;
  const keys = Object.keys(input);
  if (
    keys.length !== PREF_KEYS.length ||
    !PREF_KEYS.every((key) => Object.hasOwn(input, key) && typeof input[key] === 'boolean')
  ) return null;

  return {
    deadlineNear: input.deadlineNear as boolean,
    newIssue: input.newIssue as boolean,
    noUpdate: input.noUpdate as boolean,
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Metode tidak diizinkan' }, 405);

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !serviceRoleKey) {
    console.error('Konfigurasi Supabase server tidak lengkap');
    return json({ error: 'Konfigurasi server belum lengkap' }, 500);
  }

  const authorization = req.headers.get('Authorization') ?? '';
  const token = authorization.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) return json({ error: 'Tidak terautentikasi' }, 401);

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: authData, error: authError } = await admin.auth.getUser(token);
  if (authError || !authData.user) return json({ error: 'Sesi tidak valid' }, 401);

  const callerId = authData.user.id;
  const { data: caller, error: callerError } = await admin
    .from('profiles')
    .select('id, role, is_active')
    .eq('id', callerId)
    .maybeSingle();

  if (callerError) {
    console.error('Gagal memeriksa profil pemanggil:', callerError.message);
    return json({ error: 'Gagal memeriksa hak akses' }, 500);
  }
  if (!caller || caller.is_active !== true) {
    return json({ error: 'Akun tidak aktif atau profil tidak ditemukan' }, 403);
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Isi permintaan bukan JSON yang valid' }, 400);
  }
  if (!body || typeof body !== 'object' || typeof body.action !== 'string') {
    return json({ error: 'Aksi tidak valid' }, 400);
  }

  // Preferensi hanya dapat diubah oleh pengguna yang sedang login.
  if (body.action === 'save-notification-prefs') {
    const prefs = parsePrefs(body.notificationPrefs);
    if (!prefs) return json({ error: 'Format preferensi notifikasi tidak valid' }, 400);

    const { data, error } = await admin
      .from('profiles')
      .update({ notification_prefs: prefs })
      .eq('id', callerId)
      .select('id')
      .maybeSingle();

    if (error || !data) {
      console.error('Gagal menyimpan preferensi:', error?.message ?? 'profil tidak ditemukan');
      return json({ error: 'Gagal menyimpan preferensi notifikasi' }, 500);
    }
    return json({ ok: true });
  }

  // Pengelolaan staf hanya dapat dilakukan Notaris aktif.
  if (String(caller.role ?? '').toLowerCase() !== 'notaris') {
    return json({ error: 'Hanya Notaris yang dapat mengelola staf' }, 403);
  }

  const staffId = typeof body.staffId === 'string' ? body.staffId : '';
  if (!UUID_PATTERN.test(staffId)) return json({ error: 'ID staf tidak valid' }, 400);
  if (staffId === callerId) {
    return json({ error: 'Notaris tidak dapat mengubah akunnya sendiri melalui menu staf' }, 400);
  }

  const { data: target, error: targetError } = await admin
    .from('profiles')
    .select('id, role')
    .eq('id', staffId)
    .maybeSingle();

  if (targetError) {
    console.error('Gagal memeriksa staf tujuan:', targetError.message);
    return json({ error: 'Gagal memeriksa data staf' }, 500);
  }
  if (!target || String(target.role ?? '').toLowerCase() !== 'staff') {
    return json({ error: 'Staf tidak ditemukan' }, 404);
  }

  if (body.action === 'update') {
    const fullName = typeof body.fullName === 'string' ? body.fullName.trim() : '';
    if (!fullName || fullName.length > 120) {
      return json({ error: 'Nama staf wajib diisi dan maksimal 120 karakter' }, 400);
    }

    // Pembaruan atomik: update profil + audit log via RPC manage_staff_profile
    const { error: rpcError } = await admin.rpc('manage_staff_profile', {
      p_actor_id: callerId,
      p_target_id: staffId,
      p_action: 'update',
      p_full_name: fullName,
      p_is_active: null,
    });

    if (rpcError) {
      console.error('Gagal memperbarui nama staf:', rpcError.message);
      return json({ error: rpcError.message || 'Gagal memperbarui data staf' }, 400);
    }

    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    if (email) {
      if (!EMAIL_PATTERN.test(email)) {
        return json({ error: 'Format email tidak valid' }, 400);
      }
      const { data: existingUser } = await admin
        .from('profiles')
        .select('id')
        .eq('email', email)
        .neq('id', staffId)
        .maybeSingle();

      if (existingUser) {
        return json({ error: 'Email sudah digunakan oleh akun lain' }, 400);
      }

      // Update auth.users email
      const { error: authUpdateErr } = await admin.auth.admin.updateUserById(staffId, {
        email,
        email_confirm: true,
      });
      if (authUpdateErr) {
        console.error('Gagal memperbarui email di auth.users:', authUpdateErr.message);
        return json({ error: authUpdateErr.message || 'Gagal memperbarui email autentikasi' }, 400);
      }

      // Update profiles email
      const { error: profUpdateErr } = await admin
        .from('profiles')
        .update({ email })
        .eq('id', staffId);
      if (profUpdateErr) {
        console.error('Gagal memperbarui email di profiles:', profUpdateErr.message);
        return json({ error: 'Gagal memperbarui email profil' }, 500);
      }

      // Bersihkan identitas auth pihak ketiga lama agar tidak bisa dipakai login lagi
      await admin.rpc('cleanup_old_staff_identities', {
        p_user_id: staffId,
        p_new_email: email,
      });
    }

    return json({ ok: true });
  }

  if (body.action === 'set-active') {
    if (typeof body.isActive !== 'boolean') {
      return json({ error: 'Status aktif harus berupa boolean' }, 400);
    }

    // Pembaruan atomik: update status + audit log via RPC manage_staff_profile
    const { error: rpcError } = await admin.rpc('manage_staff_profile', {
      p_actor_id: callerId,
      p_target_id: staffId,
      p_action: 'set-active',
      p_full_name: null,
      p_is_active: body.isActive,
    });

    if (rpcError) {
      console.error('Gagal mengubah status staf:', rpcError.message);
      return json({ error: rpcError.message || 'Gagal mengubah status staf' }, 400);
    }
    return json({ ok: true });
  }

  return json({ error: 'Aksi tidak dikenal' }, 400);
});
