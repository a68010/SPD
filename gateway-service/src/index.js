const express = require('express');
const fetch = require('node-fetch');
const HashRing = require('hashring');
const dns = require('dns').promises;

const app = express();
app.use(express.json());

let ring = new HashRing();

async function refreshNodes() {
  try {
    const addrs = await dns.resolve4('tasks.kv-node');
    const nodes = {};
    addrs.forEach(ip => nodes[`http://${ip}:3001`] = 1);
    ring = new HashRing(nodes);
    console.log('Ring atualizado:', Object.keys(nodes));
  } catch(err) {
    console.error('Falha DNS:', err);
  }
}

refreshNodes();
setInterval(refreshNodes, 30000);

async function proxyToNode(req, res) {
  const key = req.method === 'PUT' ? req.body.data?.key : req.query.key;
  if (!key) return res.status(400).json({ error:'Falta parâmetro key' });
  const target = ring.get(key);
  if (!target) return res.status(503).json({ error:'Sem nós disponíveis' });
  const url = new URL(req.originalUrl, target);
  const opts = { method: req.method, headers:{'Content-Type':'application/json'}, body: req.method==='PUT'?JSON.stringify(req.body):undefined};
  try {
    const resp = await fetch(url.href, opts);
    res.status(resp.status);
    const ct = resp.headers.get('content-type')||'';
    if(ct.includes('application/json')) return res.json(await resp.json());
    return res.send();
  } catch(err) {
    console.error('Proxy erro:', err);
    return res.status(502).json({ error:'Bad Gateway' });
  }
}

app.put('/', proxyToNode);
app.get('/', proxyToNode);
app.delete('/', proxyToNode);

app.get('/health',(req,res)=>res.json({status:'ok'}));

app.listen(3000,()=>console.log('Gateway a ouvir 3000'));
