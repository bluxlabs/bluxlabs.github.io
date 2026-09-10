const json = (status, message, extra = {}) => new Response(JSON.stringify({message, ...extra}), {status, headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
const buckets = new Map();
function limited(key, now) {
  for (const [k,v] of buckets) if (v.until <= now) buckets.delete(k);
  const b = buckets.get(key) || {count:0,until:now+600000};
  if (b.count >= 5 || (!buckets.has(key) && buckets.size >= 10000)) return true;
  b.count++; buckets.set(key,b); return false;
}
async function readJson(request) {
  const reader=request.body?.getReader(); if(!reader) throw new Error('invalid');
  const chunks=[]; let length=0;
  try { while(true){const {done,value}=await reader.read();if(done)break;length+=value.length;if(length>16384){await reader.cancel();throw new Error('large')}chunks.push(value)} }
  finally { reader.releaseLock(); }
  const bytes=new Uint8Array(length);let offset=0;for(const c of chunks){bytes.set(c,offset);offset+=c.length}
  return JSON.parse(new TextDecoder().decode(bytes));
}
export async function contact(request, env={}, options={}) {
  if(request.method!=='POST')return json(405,'Use POST to submit an inquiry.');
  const origin=request.headers.get('origin');
  const allowed=env.CONTACT_ALLOWED_ORIGIN || new URL(request.url).origin;
  if(!origin || origin!==allowed)return json(403,'Please submit from the Blux website.');
  if(!request.headers.get('content-type')?.startsWith('application/json'))return json(415,'Send JSON.');
  if(Number(request.headers.get('content-length'))>16384)return json(413,'Your inquiry is too long.');
  let data;try{data=await readJson(request)}catch(e){return json(e.message==='large'?413:400,'Please check your inquiry and try again.')}
  if(!data || typeof data!=='object' || Array.isArray(data))return json(400,'Please check your inquiry.');
  if(data.website)return json(400,'Unable to submit this inquiry.');
  const name=typeof data.name==='string'?data.name.trim():'';
  const email=typeof data.email==='string'?data.email.trim():'';
  const message=typeof data.message==='string'?data.message.trim():'';
  if(!name || name.length>100 || /[\r\n\x00-\x1f]/.test(name))return json(400,'Enter a name of up to 100 characters.');
  if(email.length>254 || !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email))return json(400,'Enter a valid email address.');
  if(message.length<10 || message.length>5000 || message.includes('\0'))return json(400,'Use between 10 and 5,000 characters for your message.');
  if(typeof data.requestId!=='string' || !/^[a-zA-Z0-9-]{16,80}$/.test(data.requestId))return json(400,'Please refresh and try again.');
  if(!env.CONTACT_FROM || (env.MAIL_TRANSPORT==='smtp'?!options.sendMail:!env.RESEND_API_KEY))return json(503,'Online sending is not available yet. Your message has not been sent. Please email sol@bluxlabs.com directly.');
  // Trust only the runtime-supplied IP, never a user-supplied forwarding header.
  const client=options.clientIp || request.headers.get('cf-connecting-ip') || 'unknown';
  if(limited(client,Date.now()))return json(429,'Too many attempts. Please wait 10 minutes or email us directly.');
  const send=options.fetch || fetch;
  try {
    const mail={from:env.CONTACT_FROM,to:['sol@bluxlabs.com'],reply_to:email,subject:`Blux research inquiry — ${name}`,text:`Name: ${name}\nEmail: ${email}\n\n${message}`};
    if(env.MAIL_TRANSPORT==='smtp'){await options.sendMail(mail,`blux-contact-${data.requestId}`);return json(200,'Your inquiry has been accepted by our email service. Thank you for contacting Blux.',{ok:true});}
    const response=await send('https://api.resend.com/emails',{
      method:'POST',headers:{Authorization:`Bearer ${env.RESEND_API_KEY}`,'Content-Type':'application/json','Idempotency-Key':`blux-contact-${data.requestId}`},
      body:JSON.stringify({from:env.CONTACT_FROM,to:['sol@bluxlabs.com'],reply_to:email,subject:`Blux research inquiry — ${name}`,text:`Name: ${name}\nEmail: ${email}\n\n${message}`}),signal:AbortSignal.timeout(10000)
    });
    if(!response.ok)return json(502,'The email service could not confirm submission. Your text is still here; please retry or email us directly.');
    const result=await response.json();if(!result.id)return json(502,'Submission could not be confirmed. Please retry or email us directly.');
    return json(200,'Your inquiry has been accepted by our email service. Thank you for contacting Blux.',{ok:true});
  }catch{return json(502,'Submission could not be confirmed. Your text is still here; please retry or email sol@bluxlabs.com.');}
}
