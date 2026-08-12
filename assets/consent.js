import { $, cleanEmail, config, safeRedirect, setBusy, setStatus, showOnly, supabase } from './common.js';

const views = ['loadingView', 'loginView', 'createView', 'consentView', 'expiredView'];
const show = (id) => showOnly(views, id);
const authorizationId = new URLSearchParams(location.search).get('authorization_id');

async function renderConsent(user) {
  if (!authorizationId) return show('expiredView');
  const { data, error } = await supabase.auth.oauth.getAuthorizationDetails(authorizationId);
  if (error || !data) return show('expiredView');
  if (!('authorization_id' in data) && data.redirect_url) {
    if (!safeRedirect(data.redirect_url)) show('expiredView');
    return;
  }
  $('accountEmail').textContent = user.email || 'Signed in';
  $('scopes').replaceChildren();
  String(data.scope || 'email profile').split(' ').filter(Boolean).forEach((scope) => {
    const pill = document.createElement('span');
    pill.className = 'pill';
    pill.textContent = scope === 'email' ? 'Account email' : scope === 'profile' ? 'Profile' : scope === 'openid' ? 'Secure sign-in' : `Permission: ${scope}`;
    $('scopes').append(pill);
  });
  show('consentView');
}

async function boot() {
  if (!authorizationId) return show('expiredView');
  const { data: { user } } = await supabase.auth.getUser();
  if (user) return renderConsent(user);
  show('loginView');
}

$('signInButton').onclick = async () => {
  const email = cleanEmail($('email').value);
  const password = $('password').value;
  if (!email || password.length < 8) return setStatus('loginStatus', 'Enter your email and password.', 'error');
  setBusy($('signInButton'), true, 'Signing in…', 'Sign in');
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  setBusy($('signInButton'), false, 'Signing in…', 'Sign in');
  if (error || !data.user) return setStatus('loginStatus', error?.message || 'Sign-in failed.', 'error');
  await renderConsent(data.user);
};

$('showCreateButton').onclick = () => show('createView');
$('showLoginButton').onclick = () => show('loginView');

$('createButton').onclick = async () => {
  const name = String($('name').value || '').trim();
  const email = cleanEmail($('newEmail').value);
  const password = $('newPassword').value;
  if (name.length < 2 || !email || password.length < 8) {
    return setStatus('createStatus', 'Use a display name, valid email, and password of at least 8 characters.', 'error');
  }
  setBusy($('createButton'), true, 'Creating account…', 'Create account');
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { display_name: name, full_name: name },
      emailRedirectTo: `${config.baseUrl}/?confirmed=1`
    }
  });
  setBusy($('createButton'), false, 'Creating account…', 'Create account');
  if (error) return setStatus('createStatus', error.message, 'error');
  if (data.session && data.user) return renderConsent(data.user);
  setStatus('createStatus', 'Account created. Check your email to confirm it, then return to the TV and scan a fresh QR code.', 'good');
};

$('forgotButton').onclick = async () => {
  const email = cleanEmail($('email').value);
  if (!email) return setStatus('loginStatus', 'Enter your email first, then choose Forgot password.', 'error');
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${config.baseUrl}/reset/` });
  if (error) return setStatus('loginStatus', error.message, 'error');
  setStatus('loginStatus', 'Password reset email sent. After resetting it, return to the TV and scan a fresh QR code.', 'good');
};

$('approveButton').onclick = async () => {
  if (!authorizationId) return show('expiredView');
  setBusy($('approveButton'), true, 'Connecting television…', 'Continue to TV');
  setStatus('consentStatus', '');
  const { data, error } = await supabase.auth.oauth.approveAuthorization(authorizationId);
  if (error || !data?.redirect_url) {
    setBusy($('approveButton'), false, 'Connecting television…', 'Continue to TV');
    return setStatus('consentStatus', error?.message || 'Could not approve this television.', 'error');
  }
  if (!safeRedirect(data.redirect_url)) {
    setBusy($('approveButton'), false, 'Connecting television…', 'Continue to TV');
    setStatus('consentStatus', 'The authorization callback is invalid.', 'error');
  }
};

$('denyButton').onclick = async () => {
  if (!authorizationId) return show('expiredView');
  setBusy($('denyButton'), true, 'Cancelling…', 'Cancel request');
  const { data, error } = await supabase.auth.oauth.denyAuthorization(authorizationId);
  if (error || !data?.redirect_url) {
    setBusy($('denyButton'), false, 'Cancelling…', 'Cancel request');
    return setStatus('consentStatus', error?.message || 'Could not cancel this request.', 'error');
  }
  safeRedirect(data.redirect_url);
};

$('switchButton').onclick = async () => {
  await supabase.auth.signOut({ scope: 'local' });
  show('loginView');
};

boot().catch(() => show('expiredView'));
