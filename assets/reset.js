import { $, setBusy, setStatus, showOnly, supabase } from './common.js';
const views = ['loadingView', 'resetView', 'invalidView'];
const show = (id) => showOnly(views, id);

async function boot() {
  const { data: { session } } = await supabase.auth.getSession();
  if (session) return show('resetView');
  let resolved = false;
  const { data: listener } = supabase.auth.onAuthStateChange((event, newSession) => {
    if (resolved) return;
    if ((event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') && newSession) {
      resolved = true;
      show('resetView');
    }
  });
  setTimeout(() => {
    if (!resolved) {
      listener.subscription.unsubscribe();
      show('invalidView');
    }
  }, 2500);
}

$('updateButton').onclick = async () => {
  const first = $('newPassword').value;
  const second = $('confirmPassword').value;
  if (first.length < 8) return setStatus('resetStatus', 'Use a password of at least 8 characters.', 'error');
  if (first !== second) return setStatus('resetStatus', 'The two passwords do not match.', 'error');
  setBusy($('updateButton'), true, 'Updating…', 'Update password');
  const { error } = await supabase.auth.updateUser({ password: first });
  setBusy($('updateButton'), false, 'Updating…', 'Update password');
  if (error) return setStatus('resetStatus', error.message, 'error');
  setStatus('resetStatus', 'Password updated. You can now return to FTV and sign in.', 'good');
  setTimeout(() => location.replace('../'), 1200);
};

boot().catch(() => show('invalidView'));
