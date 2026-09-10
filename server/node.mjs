import {smtpSender} from './smtp.js';
import http from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {loadEnvFile} from 'node:process';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {Readable} from 'node:stream';
import {contact} from './contact.js';
try{loadEnvFile()}catch(e){if(e.code!=='ENOENT')throw e}
const root=path.resolve(fileURLToPath(new URL('../dist/client/',import.meta.url)));
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.webp':'image/webp','.gif':'image/gif','.png':'image/png','.jpg':'image/jpeg','.woff2':'font/woff2'};
const server=http.createServer(async(req,res)=>{
  res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','strict-origin-when-cross-origin');res.setHeader('X-Frame-Options','DENY');
  try{
    const url=new URL(req.url,'http://localhost');
    if(url.pathname.startsWith('/api/')){
      if(url.pathname!=='/api/contact'){res.writeHead(404,{'Content-Type':'application/json'});res.end('{"message":"Not found"}');return;}
      const base=process.env.CONTACT_ALLOWED_ORIGIN || `http://${req.headers.host}`;
      const request=new Request(new URL('/api/contact',base),{method:req.method,headers:req.headers,...(!['GET','HEAD'].includes(req.method)?{body:Readable.toWeb(req),duplex:'half'}:{})});
      const peer=req.socket.remoteAddress;
      const trusted=process.env.TRUST_LOOPBACK_PROXY==='true' && ['127.0.0.1','::1','::ffff:127.0.0.1'].includes(peer);
      const clientIp=trusted && typeof req.headers['x-real-ip']==='string'?req.headers['x-real-ip']:peer;
      const result=await contact(request,process.env,{clientIp,sendMail:smtpSender(process.env)});
      res.writeHead(result.status,Object.fromEntries(result.headers));res.end(await result.text());return;
    }
    if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);res.end();return;}
    const pathname=decodeURIComponent(url.pathname);
    if(pathname.split(/[\\/]/).some(part=>part.startsWith('.'))){res.writeHead(404);res.end();return;}
    let file=path.resolve(root,'.'+pathname);
    if(file!==root&&!file.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
    try{if((await stat(file)).isDirectory())file=path.join(file,'index.html');if(!(await stat(file)).isFile())throw Error()}catch{
      if(path.extname(pathname)){res.writeHead(404);res.end();return;}
      file=path.join(root,'index.html');
    }
    const body=await readFile(file);res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');
    res.setHeader('Cache-Control',file.endsWith('.html')?'no-cache':'public, max-age=3600');res.writeHead(200);res.end(req.method==='HEAD'?undefined:body);
  }catch{res.writeHead(400);res.end('Unable to handle request.');}
});
server.requestTimeout=20000;server.headersTimeout=15000;
server.listen(Number(process.env.PORT||3000),process.env.HOST||'127.0.0.1',()=>console.log('Blux server ready on port '+server.address().port));
