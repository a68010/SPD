const express=require('express');
const app=express(),port=3003;
app.use(express.json());
app.get('/health',(req,res)=>res.json({status:'ok',service:'health-monitor'}));
app.listen(port,()=>console.log('Health Monitor a ouvir',port));
