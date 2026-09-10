import nodemailer from 'nodemailer';
import {createHash} from 'node:crypto';
const attempts=new Map();
export function smtpSender(env,createTransport=nodemailer.createTransport){
  if(env.MAIL_TRANSPORT!=='smtp' || !env.SMTP_USER || !env.SMTP_PASS || !env.CONTACT_FROM)return undefined;
  const port=Number(env.SMTP_PORT||465);if(![465,587].includes(port))return undefined;
  return async (mail,key)=>{
    const now=Date.now();for(const[k,v]of attempts)if(v.until<=now)attempts.delete(k);
    const fingerprint=createHash('sha256').update(JSON.stringify(mail)).digest('hex');
    const previous=attempts.get(key);if(previous){if(previous.fingerprint!==fingerprint)throw Error('Request changed');return previous.promise;}
    if(attempts.size>=2000)throw Error('Submission capacity reached');
    const promise=(async()=>{
      const transport=createTransport({host:env.SMTP_HOST||'smtp.gmail.com',port,secure:port===465,requireTLS:port===587,auth:{user:env.SMTP_USER,pass:env.SMTP_PASS},connectionTimeout:5000,greetingTimeout:5000,socketTimeout:10000,tls:{minVersion:'TLSv1.2'},disableFileAccess:true,disableUrlAccess:true});
      try{const result=await transport.sendMail({from:mail.from,to:mail.to,replyTo:mail.reply_to,subject:mail.subject,text:mail.text});if(!result.accepted?.some(address=>String(address).toLowerCase()==='sol@bluxlabs.com'))throw Error('Recipient not accepted');return {id:result.messageId||key};}finally{transport.close()}
    })();
    // Keep outcome (including uncertain SMTP errors) to avoid blind duplicate retry.
    attempts.set(key,{fingerprint,promise,until:now+86400000});return promise;
  };
}
