/* Where to Go V4.2: real Supabase Auth integration (after configuration).
   Google, Facebook, Apple, email/password; no mock sessions or fake success.
   User activity is saved only after personalization opt-in. */
const settings=window.WTG_CONFIG||{};
const gate=document.getElementById('auth-gate');
const error=document.getElementById('auth-error');
const note=document.getElementById('auth-config-note');
const demo=document.getElementById('auth-demo');
let client=null;
let currentUser=null;
let currentProfile=null;
let demoMode=false;
let busy=false;
function showMessage(message){error.textContent=message;error.hidden=!message;}
function closeGate(){gate.hidden=true;document.body.classList.add('wtg-auth-done');}
function openGate(){gate.hidden=false;document.body.classList.remove('wtg-auth-done');}
async function loadProfile(){
  if(!client||!currentUser)return;
  try{
    const {data,error:e}=await client.from('profiles').select('personalization_opt_in').eq('id',currentUser.id).maybeSingle();
    if(e)throw e;
    currentProfile=data||null;
    if(!data){const {error:insError}=await client.from('profiles').insert({id:currentUser.id,personalization_opt_in:document.getElementById('auth-consent').checked});if(insError)throw insError;
      currentProfile={personalization_opt_in:document.getElementById('auth-consent').checked};}
    document.getElementById('auth-consent').checked=!!currentProfile?.personalization_opt_in;
    window.dispatchEvent(new CustomEvent('wtg-personalization-changed',{detail:{enabled:!!currentProfile?.personalization_opt_in}}));
    await importLocalFavorites();
    const listed=await client.from('favorites').select('place_id').eq('user_id',currentUser.id).limit(500);
    if(!listed.error&&Array.isArray(listed.data)){
      window.dispatchEvent(new CustomEvent('wtg-cloud-favorites',{
        detail:{placeIds:listed.data.map(row=>row.place_id).filter(id=>typeof id==='string')}
      }));
    }
  }catch(e){console.warn('No se pudo cargar el perfil:',e?.message)}
}
async function importLocalFavorites(){
  if(!client||!currentUser)return;
  try{const keys=JSON.parse(localStorage.getItem('wtg_favorites')||'[]');
    if(Array.isArray(keys)&&keys.length){const payload=keys.slice(0,150).filter(s=>typeof s==='string').map(place_id=>({user_id:currentUser.id,place_id}));
      if(payload.length)await client.from('favorites').upsert(payload,{onConflict:'user_id,place_id'});}}
  catch(e){console.warn('Favoritos sin sincronizar:',e?.message)}
}
async function loginEmail(create){
  if(!client){showMessage('El registro real necesita una conexión de Supabase. Puedes probar la demo sin guardar una cuenta.');return;}
  if(busy)return;
  const email=document.getElementById('auth-email').value.trim();const password=document.getElementById('auth-password').value;
  if(!email||password.length<6){showMessage('Escribe un correo válido y una contraseña de al menos 6 caracteres.');return;}
  busy=true;showMessage('');
  try{
    const res=create?await client.auth.signUp({email,password,options:{emailRedirectTo:location.origin+location.pathname}}):await client.auth.signInWithPassword({email,password});
    if(res.error)throw res.error;
    if(create&&!res.data.session)showMessage('Cuenta creada. Revisa tu correo para confirmar la dirección y después inicia sesión.');
  }catch(e){showMessage(e?.message||'No se pudo acceder. Comprueba la configuración y vuelve a intentarlo.');}
  finally{busy=false;}
}
async function social(provider){
  if(!client){showMessage('El acceso con '+provider+' estará disponible al configurar Supabase y el proveedor. En esta versión puedes explorar la demo.');return;}
  if(busy)return;busy=true;showMessage('');
  try{
    const {error:e}=await client.auth.signInWithOAuth({provider,options:{redirectTo:location.origin+location.pathname}});
    if(e)throw e;
  }catch(e){showMessage(e?.message||'El proveedor no está configurado o ha rechazado el acceso.');busy=false;}
}
async function setPersonalization(value){
  if(!client||!currentUser)return;
  const {error:e}=await client.from('profiles').upsert({id:currentUser.id,personalization_opt_in:!!value},{onConflict:'id'});
  if(e){showMessage('No se pudo guardar el consentimiento.');return;}
  currentProfile={personalization_opt_in:!!value};
  window.dispatchEvent(new CustomEvent('wtg-personalization-changed',{detail:{enabled:!!value}}));
}
function handleUser(user){
  currentUser=user||null;
  const avatar=document.getElementById('top-business');if(avatar)avatar.textContent=user?(user.email||'WT').slice(0,2).toUpperCase():'WT';
  window.WTG_PROFILE?.setSession?.(currentUser,client);
  if(user){demoMode=false;closeGate();loadProfile();}
  else if(!demoMode && settings.requireLogin!==false)openGate();
}
window.WTG_auth={
  get user(){return currentUser;},
  get demo(){return demoMode;},
  get available(){return !!client;},
  // The browser receives only the public-key client; RLS protects user data.
  get database(){return client;},
  get consented(){return currentProfile?!!currentProfile.personalization_opt_in:null;},
  setPersonalization,
  async syncFavorite(place_id,added){
    if(!client||!currentUser||typeof place_id!=='string'||place_id.length>250)return;
    try{
      const request=added?client.from('favorites').upsert({user_id:currentUser.id,place_id},{onConflict:'user_id,place_id'}):
        client.from('favorites').delete().eq('user_id',currentUser.id).eq('place_id',place_id);
      const {error:e}=await request;
      if(e)console.warn('Favorito guardado en este dispositivo; la nube no está disponible.');
    }catch{console.warn('No se pudo sincronizar el favorito.')}
  },
  async recordView(place_id,category){
    if(!client||!currentUser||!currentProfile?.personalization_opt_in)return;
    if(typeof place_id!=='string'||place_id.length>250)return;
    try{await client.from('activity_events').insert({user_id:currentUser.id,event_type:'view',place_id,category:String(category||'atracciones').slice(0,80)});}
    catch{/* Analytics must never block discovery. */}
  },
  showLogin(){demoMode=false;openGate();},
  async signOut(){
    if(client){await client.auth.signOut();currentUser=null;}
    demoMode=false;window.WTG_PROFILE?.setSession?.(null,null);openGate();
  }
};
document.querySelectorAll('[data-social]').forEach(button=>button.addEventListener('click',()=>social(button.dataset.social)));
document.getElementById('auth-email-form').addEventListener('submit',e=>{e.preventDefault();loginEmail(false)});
document.getElementById('auth-create').addEventListener('click',()=>loginEmail(true));
const emailReveal=document.getElementById('auth-email-reveal');
emailReveal?.addEventListener('click',()=>{
  const panel=document.getElementById('auth-email-fold');
  if(!panel)return;
  panel.hidden=!panel.hidden;
  emailReveal.setAttribute('aria-expanded',String(!panel.hidden));
  if(!panel.hidden)document.getElementById('auth-email')?.focus({preventScroll:true});
});
demo.addEventListener('click',()=>{if(settings.allowDemo===false)return;demoMode=true;window.WTG_PROFILE?.setSession?.(null,null);showMessage('');closeGate()});
document.getElementById('auth-consent').addEventListener('change',e=>setPersonalization(e.target.checked));
const account=document.getElementById('wtg-account'),legal=document.getElementById('wtg-legal');
const accountMsg=document.getElementById('wtg-account-message');
function accountMessage(value){accountMsg.textContent=value;}
function openAccount(){if(window.WTG_PROFILE?.open){window.WTG_PROFILE.open();return;}if(!currentUser){demoMode=false;openGate();return;}document.getElementById('wtg-account-email').textContent=currentUser.email||'Usuario';document.getElementById('wtg-account-status').textContent=currentUser.email_confirmed_at?'Correo confirmado ✓':'Correo pendiente de confirmación';accountMessage('');account.hidden=false;document.getElementById('wtg-account-close').focus();}
document.getElementById('top-business').addEventListener('click',e=>{e.stopImmediatePropagation();openAccount()},true);
document.getElementById('wtg-account-close').addEventListener('click',()=>account.hidden=true);
document.getElementById('wtg-legal-close').addEventListener('click',()=>legal.hidden=true);
document.getElementById('wtg-account-privacy').addEventListener('click',()=>{account.hidden=true;legal.hidden=false});
document.getElementById('wtg-account-favorites').addEventListener('click',()=>{account.hidden=true;document.querySelector('[data-view="favoritos"].mobile-tab')?.click()||document.querySelector('[data-view="favoritos"].nav-btn')?.click()});
document.getElementById('wtg-account-login')?.addEventListener('click',()=>{account.hidden=true;demoMode=false;openGate()});
document.getElementById('wtg-account-signout').addEventListener('click',async()=>{try{await window.WTG_auth.signOut();account.hidden=true;accountMessage('')}catch(e){accountMessage('No se pudo cerrar sesión: '+e.message)}});
document.getElementById('wtg-account-resend').addEventListener('click',async()=>{if(!client||!currentUser?.email)return accountMessage('Inicia sesión primero.');try{const {error:e}=await client.auth.resend({type:'signup',email:currentUser.email,options:{emailRedirectTo:location.origin+location.pathname}});if(e)throw e;accountMessage('Si la cuenta necesita confirmación, recibirás un correo.')}catch(e){accountMessage('No se pudo reenviar: '+e.message)}});
const recoveryDialog=document.getElementById('wtg-recovery-dialog');
const recoveryForm=document.getElementById('wtg-recovery-form');
const recoveryMessage=document.getElementById('wtg-recovery-message');
function showRecovery(){if(!recoveryDialog)return;recoveryDialog.hidden=false;recoveryMessage.textContent='Escribe tu nueva contraseña para completar la recuperación.';recoveryForm?.querySelector('input')?.focus();}
document.getElementById('auth-forgot')?.addEventListener('click',async()=>{
 const email=document.getElementById('auth-email')?.value.trim();
 if(!email||!email.includes('@'))return showMessage('Escribe primero tu correo para recuperar la contraseña.');
 if(!client)return showMessage('No hay conexión con el sistema de cuentas.');
 try{
  const {error:e}=await client.auth.resetPasswordForEmail(email,{redirectTo:location.origin+location.pathname});
  if(e)throw e;
  showMessage('Si esa cuenta existe, recibirás un enlace para cambiar la contraseña.');
 }catch(e){showMessage('No se pudo solicitar la recuperación: '+String(e.message||'error').slice(0,160))}
});
recoveryForm?.addEventListener('submit',async event=>{
 event.preventDefault();
 const pass=document.getElementById('wtg-new-password')?.value||'';
 const confirm=document.getElementById('wtg-confirm-password')?.value||'';
 if(pass.length<8||pass!==confirm)return recoveryMessage.textContent='Usa al menos 8 caracteres e introduce la misma contraseña dos veces.';
 if(!client)return recoveryMessage.textContent='Supabase no está conectado.';
 const button=recoveryForm.querySelector('button[type="submit"]');button.disabled=true;
 try{
  const {error:e}=await client.auth.updateUser({password:pass});
  if(e)throw e;
  recoveryForm.reset();
  recoveryMessage.textContent='Contraseña actualizada correctamente.';
  setTimeout(()=>{recoveryDialog.hidden=true;},900);
 }catch(e){recoveryMessage.textContent='No se pudo actualizar: '+String(e.message||'Error').slice(0,180)}
 finally{button.disabled=false}
});
document.getElementById('wtg-recovery-close')?.addEventListener('click',()=>{recoveryDialog.hidden=true});
document.getElementById('wtg-profile-delete-account')?.addEventListener('click',async()=>{
 if(!currentUser)return showMessage('Inicia sesión para solicitar la eliminación de la cuenta.');
 if(!confirm('¿Quieres solicitar la eliminación de tu cuenta y tus datos? Esta solicitud requiere revisión; NO elimina inmediatamente tu cuenta.'))return;
 const notice=document.getElementById('wtg-profile-message');
 try{
  const receipt=await window.WTG_SUBMISSIONS.requestAccountDeletion();
  notice.textContent=receipt.alreadyPending?'Ya hay una solicitud de eliminación pendiente.':'Solicitud de eliminación registrada. Recibirás seguimiento; tu cuenta aún está activa.';
 }catch(e){notice.textContent='No se envió la solicitud. '+String(e.message||'Error').slice(0,180)}
});
document.getElementById('wtg-account-reset').addEventListener('click',async()=>{if(!client||!currentUser?.email)return accountMessage('Inicia sesión primero.');try{const {error:e}=await client.auth.resetPasswordForEmail(currentUser.email,{redirectTo:location.origin+location.pathname});if(e)throw e;accountMessage('Si la cuenta existe, recibirás instrucciones por correo. Para establecer una contraseña nueva se necesita completar el flujo de recuperación.')}catch(e){accountMessage('No se pudo solicitar: '+e.message)}});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){account.hidden=true;legal.hidden=true}});

if(settings.allowDemo===false){demo.hidden=true;}
if(!settings.supabaseUrl||!settings.supabaseAnonKey){
  demo.textContent='Abrir la app de prueba →';
  demo.style.cssText='background:#0fc6c2;color:#041b40;font-size:17px;padding:16px;border-radius:14px;font-weight:800';
  // Keep approved sign-in methods visible. They explain their unavailable state when clicked.
  document.querySelector('.auth-options').hidden=false;
  document.querySelector('.auth-divider').hidden=false;
  document.getElementById('auth-email-form').hidden=false;
  document.querySelector('.auth-optin').hidden=false;
  note.textContent='Modo de prueba: el registro con Google, Apple, Facebook o correo se habilita al conectar Supabase. No se guardan cuentas reales todavía.';
  if(settings.requireLogin===false){demoMode=true;window.WTG_PROFILE?.setSession?.(null,null);closeGate()}
}else{
  note.textContent='Conexión segura administrada por Supabase. Tu ubicación precisa no se guarda en el perfil.';
  try{
    const {createClient}=await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
    client=createClient(settings.supabaseUrl,settings.supabaseAnonKey,{auth:{detectSessionInUrl:true,persistSession:true,autoRefreshToken:true}});
    // The URL fragment may contain a freshly returned Google OAuth session.
    // Do not issue Supabase queries synchronously inside onAuthStateChange.
    client.auth.onAuthStateChange((event,session)=>{
      setTimeout(()=>{
        if(session?.user)handleUser(session.user);
        else if(event==='SIGNED_OUT'||(event==='INITIAL_SESSION'&&!currentUser))handleUser(null);
        if(event==='PASSWORD_RECOVERY')showRecovery();
      },0);
    });
    const {data,error:e}=await client.auth.getSession();
    if(e)throw e;
    let restored=data.session||null;
    // Fallback for browsers whose OAuth fragment survived the redirect but
    // was not automatically consumed. Never persist tokens ourselves.
    if(!restored&&location.hash.startsWith('#')){
      const callback=new URLSearchParams(location.hash.slice(1));
      const access_token=callback.get('access_token');
      const refresh_token=callback.get('refresh_token');
      if(access_token&&refresh_token){
        const recovery=await client.auth.setSession({access_token,refresh_token});
        if(recovery.error)throw recovery.error;
        restored=recovery.data.session||null;
      }
    }
    handleUser(restored?.user||null);
    // Remove sensitive OAuth credentials from the address bar only AFTER
    // Supabase has confirmed the authenticated session.
    if(restored&&/(?:^#|&)access_token=/.test(location.hash)){
      history.replaceState(history.state,'',location.pathname+location.search);
    }
  }catch(e){note.textContent='No se pudo conectar con el sistema de cuentas. Revisa la configuración de Supabase.';showMessage('Error de autenticación: '+(e.message||'proveedor no disponible'));}
}
