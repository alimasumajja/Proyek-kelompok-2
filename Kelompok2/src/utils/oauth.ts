/** Harus sama dengan scheme app.json dan Redirect URLs pada Supabase Auth. */
export const NATIVE_OAUTH_REDIRECT = 'kelompok2://auth/callback';

export function isNativeOAuthCallback(url: string): boolean {
  return url.split(/[?#]/, 1)[0] === NATIVE_OAUTH_REDIRECT;
}

/** Jangan mencetak URL callback: fragment dapat berisi token sesi. */
export function parseOAuthCallback(url: string): Record<string, string> {
  if (!isNativeOAuthCallback(url)) {
    throw new Error('Alamat callback login tidak valid. Silakan masuk kembali.');
  }
  const parsed = new URL(url);
  const params = Object.fromEntries(new URLSearchParams(parsed.search));
  for (const [key, value] of new URLSearchParams(parsed.hash.slice(1))) {
    params[key] = value;
  }
  if (params.error || params.error_code || params.error_description) {
    throw Object.assign(new Error(params.error_description || params.error), {
      code: params.error_code || params.error,
    });
  }
  if (!params.code && !(params.access_token && params.refresh_token)) {
    throw new Error('Callback tidak berisi sesi login. Silakan masuk dengan Google kembali.');
  }
  return params;
}
