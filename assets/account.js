import { $, cleanEmail, config, loadSupportContact, setBusy, setStatus, showOnly, supabase } from './common.js';

const views = ['loadingView', 'loginView', 'createView', 'forgotView', 'accountView', 'confirmedView'];
const show = (id) => showOnly(views, id);

function renderBadges(entitlement) {
  const holder = $('accountBadges');
  holder.replaceChildren();
  const signed = document.createElement('span');
  signed.className = 'pill good';
  signed.textContent = 'Email account ready';
  holder.append(signed);

  const access = document.createElement('span');
  const canPlay = entitlement?.can_play === true;
  access.className = `pill ${canPlay ? 'good' : 'warn'}`;
  access.textContent = canPlay ? 'Viewing access active' : 'Awaiting activation';
  holder.append(access);
}

async function getEntitlement() {
  const { data, error } = await supabase.rpc('get_my_entitlement');
  if (error) return null;
  return Array.isArray(data) ? data[0] ?? null : data;
}

async function renderSupport() {
  const contact = await loadSupportContact();
  const box = $('supportBox');
  const label = contact.label || 'Activation';
  const value = contact.value || config.supportFallback;
  box.replaceChildren();
  const small = document.createElement('div');
  small.className = 'account-label';
  small.textContent = label;
  const content = contact.uri ? document.createElement('a') : document.createElement('div');
  content.className = 'account-email';
  content.textContent = value;
  if (contact.uri) {
    content.href = contact.uri;
    content.rel = 'noopener noreferrer';
  }
  box.append(small, content);
  box.classList.remove('hide');
}

async function renderAccount(user) {
  $('accountEmail').textContent = user.email || 'Signed in';
  show('accountView');
  setStatus('activationMessage', 'Checking activation status…');
  const entitlement = await getEntitlement();
  renderBadges(entitlement);
  if (entitlement?.can_play === true) {
    const end = entitlement.ends_at ? new Date(entitlement.ends_at) : null;
    const suffix = end && !Number.isNaN(end.getTime()) ? ` Access is active until ${end.toLocaleDateString()}.` : ' Access is active.';
    setStatus('activationMessage', `Your account is activated.${suffix}`, 'good');
  } else {
    setStatus('activationMessage', 'Your FTV account exists, but viewing access has not been activated yet. Contact FTV and share the email shown above.', 'warn');
    await renderSupport();
  }
}

async function boot() {
  const params = new URLSearchParams(location.search);
  const confirmed = params.get('confirmed') === '1';
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    await renderAccount(user);
    return;
  }
  if (confirmed) {
    show('confirmedView');
    return;
  }
  show('loginView');
}

$('signInButton').onclick = async () => {
  const email = cleanEmail($('loginEmail').value);
  const password = $('loginPassword').value;
  if (!email || password.length < 8) return setStatus('loginStatus', 'Enter your email and password.', 'error');
  setBusy($('signInButton'), true, 'Signing in…', 'Sign in');
  setStatus('loginStatus', '');
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  setBusy($('signInButton'), false, 'Signing in…', 'Sign in');
  if (error || !data.user) return setStatus('loginStatus', error?.message || 'Sign-in failed.', 'error');
  await renderAccount(data.user);
};

$('showCreateButton').onclick = () => show('createView');
$('backToLoginButton').onclick = () => show('loginView');
$('forgotButton').onclick = () => {
  $('forgotEmail').value = $('loginEmail').value;
  show('forgotView');
};
$('forgotBackButton').onclick = () => show('loginView');
$('confirmedContinueButton').onclick = () => show('loginView');

$('createButton').onclick = async () => {
  const name = String($('displayName').value || '').trim();
  const email = cleanEmail($('createEmail').value);
  const password = $('createPassword').value;
  if (name.length < 2 || !email || password.length < 8) {
    return setStatus('createStatus', 'Use a display name, valid email, and password of at least 8 characters.', 'error');
  }
  setBusy($('createButton'), true, 'Creating account…', 'Create account');
  setStatus('createStatus', '');
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
  if (data.session && data.user) return renderAccount(data.user);
  setStatus('createStatus', 'Account created. Check your email to confirm it, then return here to sign in.', 'good');
};

$('sendResetButton').onclick = async () => {
  const email = cleanEmail($('forgotEmail').value);
  if (!email) return setStatus('forgotStatus', 'Enter your account email.', 'error');
  setBusy($('sendResetButton'), true, 'Sending…', 'Send reset link');
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${config.baseUrl}/reset/` });
  setBusy($('sendResetButton'), false, 'Sending…', 'Send reset link');
  if (error) return setStatus('forgotStatus', error.message, 'error');
  setStatus('forgotStatus', 'If that email belongs to an FTV account, a reset link has been sent.', 'good');
};

$('refreshStatusButton').onclick = async () => {
  setBusy($('refreshStatusButton'), true, 'Refreshing…', 'Refresh activation status');
  const { data: { user } } = await supabase.auth.getUser();
  if (user) await renderAccount(user);
  setBusy($('refreshStatusButton'), false, 'Refreshing…', 'Refresh activation status');
};

$('signOutButton').onclick = async () => {
  await supabase.auth.signOut({ scope: 'local' });
  $('supportBox').classList.add('hide');
  show('loginView');
};

supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_OUT') show('loginView');
  if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session?.user) renderAccount(session.user).catch(() => {});
});

boot().catch(() => {
  show('loginView');
  setStatus('loginStatus', 'Could not load your FTV account. Try again.', 'error');
});
