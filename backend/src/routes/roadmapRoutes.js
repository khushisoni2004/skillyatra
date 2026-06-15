const express=require('express'); const {protect}=require('../middleware/authMiddleware'); const router=express.Router();
const makeDay=i=>({day:i,dsa:'Solve 2 DSA questions',practice:'Attempt 20 MCQs',aptitude:'30 min aptitude',core:'Revise DBMS/OS/CN',resume:'Improve one resume bullet',interview:'Practice one HR answer',revision:'Revise mistakes'});
router.get('/today',protect,(req,res)=>res.json({date:new Date(),tasks:[{type:'Video task',title:'Watch one topic video'},{type:'DSA task',title:'Solve one easy/medium problem'},{type:'Practice MCQ task',title:'Attempt 15 MCQs'},{type:'Aptitude task',title:'Time and work practice'},{type:'Core CS task',title:'DBMS normalization revision'},{type:'Resume task',title:'Add measurable project impact'},{type:'Revision task',title:'Revise yesterday mistakes'}]}));
router.post('/generate',protect,(req,res)=>{const days=Number(req.body.days||30);res.json(Array.from({length:days},(_,i)=>makeDay(i+1)))});
module.exports=router;
