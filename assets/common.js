import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.111.0';
import { FTV_CONFIG } from '../config.js';

export const config = FTV_CONFIG;
export const supabase = createClient(config.supabaseUrl, config.supabasePublishableKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  }
});

export const $ = (id) => document.getElementById(id);
export const cleanEmail = (value) => String(value || '').trim().toLowerCase();

export function setStatus(id, message = '', type = '') {
  const el = $(id);
  if (!el) return;
  el.textContent = message;
  el.className = `status ${type}`.trim();
}

export function setBusy(button, busy, labelWhenBusy, labelWhenIdle) {
  if (!button) return;
  button.disabled = busy;
  if (busy && labelWhenBusy) button.textContent = labelWhenBusy;
  if (!busy && labelWhenIdle) button.textContent = labelWhenIdle;
}

export function showOnly(ids, activeId) {
  ids.forEach((id) => $(id)?.classList.toggle('hide', id !== activeId));
}

export async function loadSupportContact() {
  try {
    const { data } = await supabase
      .from('app_settings')
      .select('subscription_contact_label,subscription_contact_value,subscription_contact_uri')
      .eq('id', 1)
      .maybeSingle();
    const label = String(data?.subscription_contact_label || '').trim();
    const value = String(data?.subscription_contact_value || '').trim();
    const uri = String(data?.subscription_contact_uri || '').trim();
    return { label, value, uri };
  } catch {
    return { label: '', value: '', uri: '' };
  }
}

export function safeRedirect(url) {
  if (!url || typeof url !== 'string') return false;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return false;
    location.replace(parsed.toString());
    return true;
  } catch {
    return false;
  }
}
