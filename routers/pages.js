const router = require('express').Router();
const Banner = require('../model/banner');
const Query = require('../model/query');
const UserReg = require('../model/usersreg');
const multer = require('multer');//module
const Userprofile= require('../model/userprofile');
const Testi= require('../model/testi');



//storeage 

const stroage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, './public/upload');
    },
    //  add prefix to file
    filename: function (req, file, callback) {
        callback(null, Date.now() + file.originalname);
    },

});

//upload

const upload = multer({
    storage: stroage,
    limits: { fileSize: 1024 * 1024 * 4 }, //4mb
});


let ab;

function checklogin(req, res, next) {
    if (req.session.isAuth) {
        next()
    } else {
        res.redirect('/login')
    }
};

function hnadleRoles(req, res, next) {
    if (ab.role !== 'public') {
        next()
    } else {
        res.send("you dont have rights to see the containe of this page");
    }
}


router.get('/', async(req, res) => {
    const banner = await Banner.findOne();
    const testiREcords= await Testi.find({status:'active'});
    //console.log(testiREcords)
    if (ab) {
        res.render('index', {message: '',testiREcords,banner,username: ab.username});
    } else {
        res.render('index', {message: '',testiREcords,banner,username: 'hello'});
    }
})

router.get('/banner',checklogin, async (req, res) => {
    const banner = await Banner.findOne();
    if (ab) {
        res.render('banner.ejs', { banner, username: ab.username,message:''});
    } else {
        res.render('banner.ejs', { banner, username: 'hello',message:''});

    }
});

router.post('/querydata',checklogin, async (req, res) => {
    const { name, email, query } = req.body;
    const banner = await Banner.findOne();
    if(!name && !email && !query){
        if(ab){
        res.render('index', { banner, username:ab.username, message: 'Name, email & query should not be blank' });
    }else{
        res.render('index', { banner, username:'hello', message: 'Name, email & query should not be blank' });

    }
    }else{
        if(ab){
    const status = 'unread'
    const queryRecord = new Query({ name: name, email: email, query: query, status: status });
    await queryRecord.save();
    res.render('index', { banner, username:ab.username, message: 'Successfully Query Submitted' });
        }
        else{
            const status = 'unread'
            const queryRecord = new Query({ name: name, email: email, query: query, status: status });
            await queryRecord.save();
            res.render('index', { banner, username:'hello', message: 'Successfully Query Submitted' }); 
        }
}
});
router.get('/registraion', (req, res) => {
    res.render('registration.ejs', { message: '', username: 'hello' })
});
router.post('/regdata', async (req, res) => {
    const { username, pass } = req.body
         const usernamecheck=   await UserReg.findOne({username:username})
         if(usernamecheck==null){
    if (!username && !pass && !ab) {
        res.render('registration.ejs', { username: 'hello', message: 'username and password should not be blank' });
    } else {
        const status = 'suspended'
        const role = 'public'
        const regRecord = new UserReg({ username: username, password: pass, status: status, role: role })
        await regRecord.save();
        const userProfile=new Userprofile({firstName:'',lastName:'',email:'',userName:username,img:''})
        userProfile.save();
        res.render('login.ejs', { username: 'hello', message: 'Successfully Account Created'});

    }
}else{
    res.render('registration.ejs', { username: 'hello', message: 'Username is already Taken' });

}
});

router.get('/login', (req, res) => {

    res.render('login.ejs', { username: 'hello', message: '' });

})

router.post('/logincheck', async (req, res) => {
    const { username, pass } = req.body;
    if (!username && !pass) {
        res.render('login.ejs', { username: 'hello', message: 'username & password should not be blank' });

    } else {
        const userrecord = await UserReg.findOne({ username: username });
        console.log(userrecord);
        if (userrecord !== null) {
            if (userrecord.password == pass) {
                if (userrecord.status == 'active') {
                    //console.log('correct details');
                    req.session.isAuth = true;
                    ab = req.session;
                    ab.username = userrecord.username
                    ab.role = userrecord.role;
                    //console.log(ab.role);
                    const userRecord= await Userprofile.findOne({userName:ab.username});
                    //console.log(userRecord);
                     res.render('profile.ejs',{username:ab.username,message:"",userRecord})

                } else {
                    res.render('login.ejs', { username: 'hello', message: 'Your account is suspended' });

                }
            } else {
                res.render('login.ejs', { username: 'hello', message: 'wrong Credentails' });
            }
        } else {
            res.render('login.ejs', { username: 'hello', message: 'wrong Credentails' });
        }
    }
});

router.get('/logout', (req, res) => {
    req.session.destroy();
    ab = null;
    res.render('login.ejs', { username: 'hello', message:'Successfully Logout'});

})

router.get('/image', (req, res) => {
    res.render('imageform.ejs')
});

router.post('/imagerecord', upload.single('img'), (req, res) => {
    console.log(req.file);

})

router.get('/changepassword',checklogin,(req,res)=>{
    res.render('changepassword.ejs',{ username:ab.username, message:''})
})
router.post('/changepassword',async(req,res)=>{
    const{oldpass,newpass}=req.body;
    const admin=await UserReg.findOne()
    if(admin.password==oldpass){
        const id =admin.id;
        await UserReg.findByIdAndUpdate(id,{password:newpass})
        const adminrecord= await UserReg.findOne()
        res.render('changepassword.ejs',{username:ab.username, adminrecord,message:"Successfully Update"});
    }else{
        const adminrecord= await UserReg.findOne()
        res.render('changepassword.ejs',{username:ab.username, adminrecord,message:"OLd and New Password not matched"});
     
    }

});

router.get('/profileupdate',checklogin,async(req,res)=>{
   const userRecord= await Userprofile.findOne({userName:ab.username});
   //console.log(userRecord);
    res.render('profile.ejs',{username:ab.username,message:"",userRecord})
})
router.post('/profileupdate/:id',checklogin,upload.single('img'),async(req,res)=>{
    const{firstname,lastname,email}=req.body;
    //console.log(req.file.filename);
    const id =req.params.id;
    if(req.file){
    await Userprofile.findByIdAndUpdate(id,{firstName:firstname,lastName:lastname,email:email,img:req.file.filename});
    
   //console.log(userRecord);
}else{
    await Userprofile.findByIdAndUpdate(id,{firstName:firstname,lastName:lastname,email:email});

}
    const userRecord= await Userprofile.findOne({userName:ab.username});
    res.render('profile.ejs',{username:ab.username,message:"Successfully Updated",userRecord}) 
})


router.get('/testi',async(req,res)=>{
    if (ab) {
        res.render('testi.ejs', {username: ab.username,message:''});
    } else {
        res.render('testi.ejs', {username: 'hello',message:''});

    }
    
})

router.post('/testirecord',async(req,res)=>{
    const{quote,cname}=req.body
   const testRecord= new Testi({quotes:quote,companyname:cname,status:'inactive'})
   await testRecord.save();
   res.redirect('/')
})



module.exports = router;