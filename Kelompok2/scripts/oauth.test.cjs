const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');
const ts = require('typescript');

const source = fs.readFileSync(path.join(__dirname, '../src/utils/oauth.ts'), 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const sandbox = { exports: {}, URL, URLSearchParams };
vm.runInNewContext(compiled, sandbox);
const { parseOAuthCallback, isNativeOAuthCallback, NATIVE_OAUTH_REDIRECT } = sandbox.exports;

test('callback cocok dengan scheme aplikasi dan bukan alamat Metro', () => {
  const config = require('../app.json');
  assert.equal(NATIVE_OAUTH_REDIRECT, `${config.expo.scheme}://auth/callback`);
  assert.equal(isNativeOAuthCallback('exp://192.168.1.10:8081/--/auth/callback'), false);
});

test('membaca kode PKCE dari query callback', () => {
  assert.equal(parseOAuthCallback(`${NATIVE_OAUTH_REDIRECT}?code=one-time-code`).code, 'one-time-code');
});

test('membaca pasangan token implicit dari fragment', () => {
  const params = parseOAuthCallback(`${NATIVE_OAUTH_REDIRECT}#access_token=fake-access&refresh_token=fake-refresh`);
  assert.equal(params.access_token, 'fake-access');
  assert.equal(params.refresh_token, 'fake-refresh');
});

test('menolak callback kosong dan token yang tidak lengkap', () => {
  assert.throws(() => parseOAuthCallback(NATIVE_OAUTH_REDIRECT), /tidak berisi sesi/);
  assert.throws(() => parseOAuthCallback(`${NATIVE_OAUTH_REDIRECT}#access_token=fake-access`), /tidak berisi sesi/);
});

test('menolak origin/path lain, termasuk alamat yang hanya memiliki prefix sama', () => {
  for (const url of ['https://example.com/auth/callback?code=fake', 'kelompok2://auth/callback-other?code=fake', 'kelompok2://evil/callback?code=fake']) {
    assert.throws(() => parseOAuthCallback(url), /tidak valid/);
  }
});

test('galat provider diprioritaskan dan pesan URL didekodekan', () => {
  assert.throws(() => parseOAuthCallback(`${NATIVE_OAUTH_REDIRECT}?code=fake&error=access_denied&error_description=Akses+ditolak`), /Akses ditolak/);
});

const feedbackSource = fs.readFileSync(path.join(__dirname, '../src/utils/auth-errors.ts'), 'utf8');
const feedbackSandbox = { exports: {} };
vm.runInNewContext(ts.transpileModule(feedbackSource, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText, feedbackSandbox);
const { getAuthFeedback, AuthFlowError } = feedbackSandbox.exports;

test('callback user_banned mempertahankan kode dan menampilkan petunjuk akses kantor', () => {
  let callbackError;
  try {
    parseOAuthCallback(`${NATIVE_OAUTH_REDIRECT}#error=access_denied&error_code=user_banned&error_description=User+is+banned`);
  } catch (error) { callbackError = error; }
  assert.equal(callbackError.code, 'user_banned');
  const result = getAuthFeedback(callbackError);
  assert.match(result.message, /Notaris/);
  assert.equal(result.cancelled, undefined);
  assert.doesNotMatch(result.message, /banned/i);
});

test('callback lama tanpa error_code tetap menerjemahkan User is banned', () => {
  const result = getAuthFeedback({ code: 'access_denied', message: 'User is banned' });
  assert.match(result.message, /akses aktif/);
  assert.equal(result.cancelled, undefined);
});

test('penolakan profil dibedakan dari pembatalan dan gangguan koneksi', () => {
  assert.match(getAuthFeedback(new AuthFlowError('profile_not_registered')).title, /belum terdaftar/);
  assert.match(getAuthFeedback(new AuthFlowError('profile_inactive')).title, /dinonaktifkan/);
  assert.equal(getAuthFeedback(new AuthFlowError('oauth_cancelled')).cancelled, true);
  assert.equal(getAuthFeedback({ code: 'access_denied' }).cancelled, undefined);
  assert.match(getAuthFeedback({ name: 'AuthRetryableFetchError' }).message, /koneksi internet/);
  assert.match(getAuthFeedback({ code: 'invalid_credentials' }).message, /kata sandi/);
});

test('pesan server tak dikenal tidak bocor ke UI dan kode lebih diutamakan', () => {
  const result = getAuthFeedback({ code: 'unexpected_failure', message: 'Internal database detail token=secret' });
  assert.doesNotMatch(result.message, /secret|database|token/);
  assert.equal(result.cancelled, undefined);
  assert.match(getAuthFeedback({ code: 'over_request_rate_limit', message: 'User is banned' }).title, /Terlalu banyak/);
});
