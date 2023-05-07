const mongoose =require('mongoose')


const userProfileSchema =mongoose.Schema({
    firstName:String,
    lastName:String,
    email:String,
    userName:String,
    img:String
})

module.exports=  mongoose.model('userprofile',userProfileSchema);