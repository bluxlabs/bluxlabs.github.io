export const siteUrl=value=>typeof value==='string'&&value.startsWith('/')&&!value.startsWith('//')?import.meta.env.BASE_URL.replace(/\/$/,'')+value:value;
export const appPath=()=>{const base=import.meta.env.BASE_URL.replace(/\/$/,'');return (window.location.pathname.startsWith(base+'/')?window.location.pathname.slice(base.length):window.location.pathname).replace(/\/+$/,'')||'/'};
