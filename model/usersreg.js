const mongoose = require('mongoose');


const usersRegSchema = mongoose.Schema({
    username:String,
    password:String,
    status:String,
    role:String
})

module.exports =mongoose.model('userreg',usersRegSchema);