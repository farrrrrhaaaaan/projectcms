const mongoose =require('mongoose')//module

const vechileSchema= mongoose.Schema({
    vnumber:String,
    vtype:String,
    enterTime:Number,
    exitTime:Number,
    amount:Number,
    status:String
})

module.exports =mongoose.model('vechile',vechileSchema);