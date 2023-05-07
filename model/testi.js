const monngoose=require('mongoose')


const testSchema=monngoose.Schema({
    quotes:String,
    companyname:String,
    status:String

})

module.exports= monngoose.model('testi',testSchema)