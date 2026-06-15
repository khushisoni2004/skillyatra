const jwt=require('jsonwebtoken'); const User=require('../models/User');
async function protect(req,res,next){ try{ const header=req.headers.authorization||''; const token=header.startsWith('Bearer ')?header.split(' ')[1]:null; if(!token) return res.status(401).json({message:'Not authorized'}); const decoded=jwt.verify(token,process.env.JWT_SECRET||'skillyatra_secret_2026'); req.user=await User.findById(decoded.id).select('-password'); if(!req.user) return res.status(401).json({message:'User missing'}); next(); }catch(e){res.status(401).json({message:'Token failed'});} }
function admin(req,res,next){ if(req.user?.role==='admin') return next(); res.status(403).json({message:'Admin only'}); }
module.exports={protect,admin};
