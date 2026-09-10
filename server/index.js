import assets from '../worker/index.js';
import {contact} from './contact.js';
export default {async fetch(request,env,ctx){
  const path=new URL(request.url).pathname;
  if(path==='/api/contact')return contact(request,env);
  if(path.startsWith('/api/'))return new Response(JSON.stringify({message:'Not found'}),{status:404,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
  return assets.fetch(request,env,ctx);
}};
