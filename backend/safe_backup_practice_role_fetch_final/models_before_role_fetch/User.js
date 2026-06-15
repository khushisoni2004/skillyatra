const mongoose=require('mongoose');
const bcrypt=require('bcryptjs');
const UserSchema=new mongoose.Schema({name:{type:String,required:true},email:{type:String,required:true,unique:true,lowercase:true},password:{type:String,required:true},role:{type:String,enum:['student','admin'],default:'student'},profile:{college:String,branch:String,year:String,skillLevel:String,targetGoal:String,targetCompany:String,dailyTime:String,preferredLanguage:String,weakAreas:[String],strongAreas:[String]},streak:{type:Number,default:0}},{timestamps:true});
UserSchema.pre('save',async function(next){ if(!this.isModified('password')) return next(); this.password=await bcrypt.hash(this.password,10); next(); });
UserSchema.methods.matchPassword=function(p){ return bcrypt.compare(p,this.password); };
module.exports=mongoose.model('User',UserSchema);
