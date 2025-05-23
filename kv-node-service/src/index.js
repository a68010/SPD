const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3001;
app.use(express.json());
app.use('/ui', express.static(path.join(__dirname, '../public')));
const DATA_FILE = path.join(__dirname, 'store.json');
let store = {};
if (fs.existsSync(DATA_FILE)) {
  try { store = JSON.parse(fs.readFileSync(DATA_FILE)); }
  catch(e){ console.error(e); store={}; }
}
function persist(){ fs.writeFileSync(DATA_FILE, JSON.stringify(store,null,2)); }
app.get('/health',(req,res)=>res.json({status:'ok',node:process.env.NODE_ID}));
app.put('/',(req,res)=>{
  const {data} = req.body;
  if(!data||typeof data.key!=='string'||data.value===undefined)
    return res.status(400).json({error:'JSON inválido'});
  store[data.key]=data.value;persist();res.sendStatus(200);
});
app.get('/',(req,res)=>{
  const {key} = req.query;
  if(!key) return res.status(400).json({error:'Falta parâmetro key'});
  if(!(key in store)) return res.sendStatus(404);
  res.json({data:{value:store[key]}}); 
});
app.delete('/',(req,res)=>{
  const {key} = req.query;
  if(!key) return res.status(400).json({error:'Falta parâmetro key'});
  if(!(key in store)) return res.sendStatus(404);
  delete store[key];persist();res.sendStatus(200);
});
app.listen(port,()=>console.log(`KV-Node ${process.env.NODE_ID} a ouvir ${port}`));

app.post('/burn', (req, res) => {
  const { duration = 30 } = req.body; // duração em segundos
  const stop = Date.now() + duration * 1000;
  function loop() {
    if (Date.now() < stop) {
      // cálculo tolo para ocupar CPU
      let x = 0;
      for (let i = 0; i < 1e6; i++) x += Math.sqrt(i);
      setImmediate(loop);
    }
  }
  loop();
  res.json({ status: 'burning', duration });
});
