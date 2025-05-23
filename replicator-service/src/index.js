const express=require('express');
const app=express(),port=3002;
app.use(express.json());
app.get('/health',(req,res)=>res.json({status:'ok',service:'replicator'}));
app.listen(port
,()=>console.log('Replicator a ouvir',port));
