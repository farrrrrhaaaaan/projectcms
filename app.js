const express = require('express')// function
const app = express()//module
app.use(express.urlencoded({extended:false}));
const adminRouter =require('./routers/admin');
const pagesRouter =require('./routers/pages');
const mongoose = require('mongoose');
const session =require('express-session');

urlDB='mongodb://127.0.0.1:27017/mr11expressproject';
mongoose.connect(urlDB,()=>{
    console.log("connected to database mr11expressproject");
});

app.use(session({
    secret:'123',
    resave:false,
    saveUninitialized:false
}));

app.set('view engine','ejs');
app.use(express.static('public'));
app.use(pagesRouter);
app.use('/admin',adminRouter);
app.listen(5000, ()=>{
    console.log("server is running on port 5000");
});