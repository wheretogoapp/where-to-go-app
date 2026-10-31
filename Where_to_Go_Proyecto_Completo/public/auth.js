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
    await importLocalFavorites();
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
    const res=create?await client.auth.signUp({email,password}):await client.auth.signInWithPassword({email,password});
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
}
function handleUser(user){
  currentUser=user||null;
  const avatar=document.getElementById('top-business');if(avatar)avatar.textContent=user?(user.email||'WT').slice(0,2).toUpperCase():'WT';
  if(user){demoMode=false;closeGate();loadProfile();}
  else if(!demoMode && settings.requireLogin!==false)openGate();
}
window.WTG_auth={
  get user(){return currentUser;},
  get demo(){return demoMode;},
  get available(){return !!client;},
  async recordView(place_id,category){
    if(!client||!currentUser||!currentProfile?.personalization_opt_in)return;
    if(typeof place_id!=='string'||place_id.length>250)return;
    try{await client.from('activity_events').insert({user_id:currentUser.id,event_type:'view',place_id,category:String(category||'atracciones').slice(0,80)});}
    catch{/* Analytics must never block discovery. */}
  },
  async signOut(){
    if(client){await client.auth.signOut();currentUser=null;}
    demoMode=false;openGate();
  }
};
document.querySelectorAll('[data-social]').forEach(button=>button.addEventListener('click',()=>social(button.dataset.social)));
document.getElementById('auth-email-form').addEventListener('submit',e=>{e.preventDefault();loginEmail(false)});
document.getElementById('auth-create').addEventListener('click',()=>loginEmail(true));
demo.addEventListener('click',()=>{if(settings.allowDemo===false)return;demoMode=true;showMessage('');closeGate()});
document.getElementById('auth-consent').addEventListener('change',e=>setPersonalization(e.target.checked));
document.getElementById('top-business').addEventListener('click',e=>{
  e.stopImmediatePropagation();
  if(currentUser){if(confirm('¿Quieres cerrar sesión en Where to Go?'))window.WTG_auth.signOut();}
  else{demoMode=false;openGate();}
},true);
if(settings.allowDemo===false){demo.hidden=true;}
if(!settings.supabaseUrl||!settings.supabaseAnonKey){
  note.textContent='Modo de prueba: el registro con Google, Apple, Facebook o correo se habilita al conectar Supabase. No se guardan cuentas reales todavía.';
  if(settings.requireLogin===false){demoMode=true;closeGate()}
}else{
  note.textContent='Conexión segura administrada por Supabase. Tu ubicación precisa no se guarda en el perfil.';
  try{
    const {createClient}=await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
    client=createClient(settings.supabaseUrl,settings.supabaseAnonKey,{auth:{detectSessionInUrl:true,persistSession:true,autoRefreshToken:true}});
    client.auth.onAuthStateChange((event,session)=>{handleUser(session?.user||null);});
    const {data,error:e}=await client.auth.getSession();
    if(e)throw e;
    handleUser(data.session?.user||null);
  }catch(e){note.textContent='No se pudo conectar con el sistema de cuentas. Revisa la configuración de Supabase.';showMessage('Error de autenticación: '+(e.message||'proveedor no disponible'));}
}
