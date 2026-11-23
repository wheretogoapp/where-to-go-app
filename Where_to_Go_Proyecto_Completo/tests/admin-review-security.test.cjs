'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const sql=read('supabase/reviewer-admin-v1.sql');
const notes=read('supabase/reviewer-notes-v1.sql');
const js=read('public/admin-review.js');
const html=read('public/admin.html');
const app=read('public/app.js');
const auth=read('public/auth.js');

test('Los revisores no pueden autootorgarse permisos y solo su cuenta puede leer su rol',()=>{
 assert.match(sql,/revoke all on table public\.wtg_reviewers from public,anon,authenticated/i);
 assert.match(sql,/grant select on table public\.wtg_reviewers to authenticated/i);
 assert.match(sql,/for select to authenticated using \(user_id=\(select auth\.uid\(\)\)\)/);
 assert.doesNotMatch(sql,/grant\s+(?:all|insert|update|delete)[^;]*wtg_reviewers\s+to\s+authenticated/i);
 assert.match(sql,/\(select count\(\*\) from auth\.users\)=1/,'No autoconceder roles a otros registros');
});
test('El cliente de administración no puede cobrar, editar propietario ni publicar por sí solo',()=>{
 assert.match(js,/auth\.getUser\(\)/);
 assert.match(js,/from\('wtg_reviewers'\)/);
 assert.match(js,/createSignedUrl\(p,120\)/,'Previsualizaciones temporales y privadas');
 assert.match(js,/\.update\(changes\)\.eq\('id',row\.id\)\.eq\('status',row\.status\)/);
 assert.doesNotMatch(js,/service_role|SUPABASE_SERVICE|stripeSecret|paymentVerified\s*:/i);
 assert.match(js,/NO publica|NO implica cobro|No se ha publicado/);
 for(const path of ['wtg-business-applications','wtg-tour-applications','wtg-place-reports'])
  assert(sql.includes(path));
 assert.match(sql,/grant update\(status,reviewed_at\) on public\.business_submissions to authenticated/i);
 assert.match(notes,/grant update\(review_note\) on public\.business_submissions to authenticated/i);
});
test('La auditoría de revisiones es del servidor e inmutable para los navegadores',()=>{
 assert.match(sql,/security definer\s+set search_path=''/i);
 assert.match(sql,/insert into public\.wtg_review_audit/);
 assert.match(sql,/revoke all on table public\.wtg_review_audit from public,anon,authenticated/i);
 assert.match(sql,/after update of status on public\.business_submissions/i);
 assert.match(html,/name="robots" content="noindex,nofollow,noarchive"/);
 assert.match(html,/src="\.\/admin-review\.js\?v=1"/);
});
test('Favoritos, negocios y sesión local quedan aislados por cuenta',()=>{
 assert.match(app,/function scopedKey\(base,userId\)/);
 assert.match(app,/wtg-auth-session/);
 assert.match(app,/saveScoped\('wtg_favorites'/);
 assert.match(app,/saveScoped\('wtg_businesses'/);
 assert.doesNotMatch(auth,/async function importLocalFavorites/);
 assert.match(auth,/currentUser\?\.id!==userId/);
});
test('El perfil sincroniza cambios locales más recientes antes de confirmar',()=>{
 const profile=read('public/traveler-profile.js');
 assert.match(profile,/localDate>remoteDate/);
 assert.match(profile,/state\.updatedAt!==data\.updatedAt/);
 assert.match(profile,/clearTimeout\(cloudTimer\)/);
});
