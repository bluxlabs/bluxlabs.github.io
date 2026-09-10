import test from 'node:test';
import assert from 'node:assert/strict';
import {contact} from '../server/contact.js';
import backend from '../server/index.js';
const data={name:'Test Researcher',email:'test@example.test',message:'A test inquiry for validation only.',website:'',requestId:'12345678-1234-1234-1234-123456789012'};
const request=(value=data,headers={})=>new Request('https://blux.example/api/contact',{method:'POST',headers:{origin:'https://blux.example','content-type':'application/json',...headers},body:JSON.stringify(value)});
const env={RESEND_API_KEY:'test-secret',CONTACT_FROM:'Blux <website@example.test>'};
const noNetwork=()=>{throw new Error('Unexpected network call')};
test('unconfigured service returns 503, never a false success',async()=>{const r=await contact(request(),{}, {fetch:noNetwork});assert.equal(r.status,503);assert.match((await r.json()).message,/not been sent/)});
test('rejects invalid fields, header injection, honeypot and oversized bodies before delivery',async()=>{
 for(const change of [{name:'a\r\nb'},{email:'bad'},{message:'short'},{website:'spam'},{requestId:''}])assert.equal((await contact(request({...data,...change}),env,{fetch:noNetwork})).status,400);
 assert.equal((await contact(request({...data,message:'a'.repeat(18000)}),env,{fetch:noNetwork})).status,413);
});
test('rejects other origins and methods',async()=>{assert.equal((await contact(request(data,{origin:'https://evil.test'}),env)).status,403);assert.equal((await contact(new Request('https://blux.example/api/contact'),env)).status,405)});
test('sends to fixed recipient, reply-to is validated; duplicate retries share provider key',async()=>{
 const calls=[];const send=async(url,init)=>{calls.push({url,...init});return Response.json({id:'mock-id'})};
 for(let i=0;i<2;i++)assert.equal((await contact(request({...data,to:'attacker@test.test'}),env,{fetch:send,clientIp:'test-success'})).status,200);
 const payload=JSON.parse(calls[0].body);assert.deepEqual(payload.to,['sol@bluxlabs.com']);assert.equal(payload.reply_to,data.email);assert.equal(payload.html,undefined);assert.equal(calls[0].headers['Idempotency-Key'],calls[1].headers['Idempotency-Key']);
});
test('provider rejection and timeout do not report success or leak credentials',async()=>{
 for(const send of [async()=>new Response('test-secret',{status:401}),async()=>{throw Error('test-secret')}]){const r=await contact(request(),env,{fetch:send,clientIp:crypto.randomUUID()});assert.equal(r.status,502);assert.ok(!(await r.text()).includes('test-secret'))}
});
test('rate limiter stops sixth attempt before invoking provider',async()=>{let n=0;const send=async()=>{n++;return Response.json({id:'mock'})};for(let i=0;i<6;i++){const r=await contact(request(),env,{fetch:send,clientIp:'rate-test'});assert.equal(r.status,i===5?429:200)}assert.equal(n,5)});
test('unknown API path never serves HTML',async()=>{const r=await backend.fetch(new Request('https://blux.example/api/nope',{headers:{accept:'text/html'}}),{});assert.equal(r.status,404);assert.match(r.headers.get('content-type'),/json/)});

test('standalone Node server serves deep links/assets and keeps private files outside web root',async()=>{
 const {spawn}=await import('node:child_process');
 const child=spawn(process.execPath,['server/node.mjs'],{cwd:new URL('../',import.meta.url),env:{...process.env,PORT:'0',HOST:'127.0.0.1',RESEND_API_KEY:'',CONTACT_FROM:''},stdio:['ignore','pipe','pipe']});
 try{
  const port=await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('Server startup timed out')),8000);child.once('error',reject);child.stdout.on('data',chunk=>{const match=String(chunk).match(/port (\d+)/);if(match){clearTimeout(timer);resolve(match[1])}})});
  const base=`http://127.0.0.1:${port}`;
  assert.equal((await fetch(base+'/products/miniscope-v4/')).status,200);
  const asset=await fetch(base+'/assets/logo.svg');assert.equal(asset.status,200);assert.match(asset.headers.get('content-type'),/svg/);
  assert.equal((await fetch(base+'/.env')).status,404);
  assert.equal((await fetch(base+'/api/contact')).status,405);
 }finally{child.kill()}
});

test('SMTP adapter uses encrypted transport and deduplicates concurrent submissions',async()=>{
 const {smtpSender}=await import('../server/smtp.js');let config,calls=0;
 const sender=smtpSender({MAIL_TRANSPORT:'smtp',SMTP_USER:'sender@example.test',SMTP_PASS:'test',CONTACT_FROM:'sender@example.test'},opts=>{config=opts;return {sendMail:async mail=>{calls++;assert.deepEqual(mail.to,['sol@bluxlabs.com']);return {accepted:['sol@bluxlabs.com'],messageId:'mock'}},close(){}}});
 const mail={from:'sender@example.test',to:['sol@bluxlabs.com'],reply_to:'visitor@example.test',subject:'test',text:'test'};
 await Promise.all([sender(mail,'smtp-test'),sender(mail,'smtp-test')]);assert.equal(calls,1);assert.equal(config.secure,true);assert.equal(config.port,465);assert.equal(config.tls.minVersion,'TLSv1.2');
});
test('SMTP selection without credentials stays unavailable',async()=>{const r=await contact(request(),{MAIL_TRANSPORT:'smtp',CONTACT_FROM:'sender@example.test'});assert.equal(r.status,503)});
test('SMTP API success and failure match frontend contract',async()=>{
 const smtpEnv={MAIL_TRANSPORT:'smtp',CONTACT_FROM:'sender@example.test'};
 const success=await contact(request(),smtpEnv,{clientIp:'smtp-api',sendMail:async mail=>{assert.deepEqual(mail.to,['sol@bluxlabs.com'])}});assert.equal(success.status,200);
 const failure=await contact(request(),smtpEnv,{clientIp:'smtp-error',sendMail:async()=>{throw Error('private-secret')}});assert.equal(failure.status,502);assert.ok(!(await failure.text()).includes('private-secret'));
});
