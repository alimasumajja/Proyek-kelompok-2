/** Kode internal aplikasi; pesan server tidak pernah ditampilkan langsung ke pengguna. */
export class AuthFlowError extends Error {
  constructor(public readonly code: string) {
    super(code);
    this.name = 'AuthFlowError';
  }
}

export interface AuthFeedback {
  title: string;
  message: string;
  cancelled?: boolean;
}

export function getAuthFeedback(error: unknown): AuthFeedback {
  const detail = error && typeof error === 'object'
    ? error as { code?: string; message?: string; name?: string }
    : {};
  const code = detail.code;
  // Callback provider lama kadang hanya menyertakan error_description.
  const legacyBanned = (!code || code === 'access_denied') &&
    /user (is )?banned/i.test(detail.message ?? '');

  if (code === 'user_banned' || legacyBanned) {
    return {
      title: 'Akun belum dapat digunakan',
      message: 'Akun ini tidak memiliki akses aktif ke NotarisAI. Gunakan akun kantor yang terdaftar atau hubungi Notaris untuk memeriksa akses Anda.',
    };
  }
  switch (code) {
    case 'profile_not_registered':
    case 'signup_disabled':
      return { title: 'Akun belum terdaftar', message: 'Gunakan email yang sudah didaftarkan oleh Notaris. Jika belum memiliki akses, hubungi Notaris kantor Anda.' };
    case 'profile_email_mismatch':
      return { title: 'Gunakan email kantor yang terdaftar', message: 'Email akun ini berbeda dari data staf saat ini. Pilih akun Google yang sesuai atau hubungi Notaris untuk memeriksa email Anda.' };
    case 'profile_inactive':
      return { title: 'Akses akun dinonaktifkan', message: 'Hubungi Notaris kantor Anda untuk memeriksa dan mengaktifkan kembali akses akun ini.' };
    case 'invalid_credentials':
      return { title: 'Email atau kata sandi tidak sesuai', message: 'Periksa kembali email dan kata sandi Anda, lalu coba masuk lagi.' };
    case 'email_not_confirmed':
      return { title: 'Email belum diverifikasi', message: 'Hubungi Notaris untuk memeriksa status verifikasi akun Anda.' };
    case 'over_request_rate_limit':
      return { title: 'Terlalu banyak percobaan', message: 'Tunggu beberapa menit sebelum mencoba masuk lagi.' };
    case 'oauth_cancelled':
      return { title: 'Login belum dilanjutkan', message: 'Anda belum memberikan izin masuk dengan Google. Kembali ke halaman masuk untuk mencoba lagi.', cancelled: true };
    case 'access_denied':
      return { title: 'Login Google belum diizinkan', message: 'Coba masuk lagi dengan akun kantor yang terdaftar dan lanjutkan izin masuk dari Google. Jika tetap ditolak, hubungi Notaris.' };
    case 'flow_state_expired':
    case 'flow_state_not_found':
    case 'bad_oauth_state':
    case 'callback_invalid':
      return { title: 'Sesi login perlu diulang', message: 'Kembali ke halaman masuk dan pilih akun Google Anda lagi.' };
    case 'expo_go_unsupported':
      return { title: 'Buka aplikasi NotarisAI', message: 'Login Google tersedia di APK NotarisAI. Jika memakai Expo Go, gunakan email dan kata sandi.' };
    case 'request_timeout':
      return { title: 'Koneksi belum berhasil', message: 'Periksa koneksi internet Anda, lalu coba masuk lagi.' };
    default:
      if (detail.name === 'AuthRetryableFetchError' || /network request failed|failed to fetch/i.test(detail.message ?? '')) {
        return { title: 'Koneksi belum berhasil', message: 'Periksa koneksi internet Anda, lalu coba masuk lagi.' };
      }
      return { title: 'Belum bisa masuk', message: 'Proses masuk belum berhasil. Silakan coba lagi. Jika tetap terjadi, hubungi Notaris kantor Anda.' };
  }
}
