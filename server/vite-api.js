import {smtpSender} from './smtp.js';
import {Readable} from 'node:stream';
import {contact} from './contact.js';
export function contactApi(env){
  function configure(server){server.middlewares.use('/api/',async(req,res,next)=>{
    if(req.url?.split('?')[0]!=='contact' && req.url?.split('?')[0]!=='/contact'){res.writeHead(404,{'Content-Type':'application/json'});res.end(JSON.stringify({message:'Not found'}));return;}
    try{
      const request=new Request(`http://${req.headers.host}/api/contact`,{method:req.method,headers:req.headers,...(!['GET','HEAD'].includes(req.method)?{body:Readable.toWeb(req),duplex:'half'}:{})});
      const response=await contact(request,env,{clientIp:req.socket.remoteAddress,sendMail:smtpSender(env)});
      res.writeHead(response.status,Object.fromEntries(response.headers));res.end(await response.text());
    }catch{res.writeHead(400,{'Content-Type':'application/json'});res.end(JSON.stringify({message:'Unable to read this inquiry.'}));}
  })}
  return {name:'blux-contact-api',configureServer:configure,configurePreviewServer:configure};
}
