const router = require('express').Router()//module
const Admin = require('../model/adminreg');
const Banner = require('../model/banner');
const bcrypt = require('bcrypt');
const Query = require('../model/query');
const UserReg = require('../model/usersreg');
const Parking = require('../model/parking');
const multer = require('multer');//module
const UserProfile=require('../model/userprofile');
const Testi=require('../model/testi');


let sessionadmin=null;

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




function checkLogin(req, res, next) {
    if (req.session.isAuth) {
        next()
    } else {
        res.redirect('/admin/');
    }
}

router.get('/', (req, res) => {
    res.render('admin/login.ejs',{message:''});
})

router.get('/dashboard', checkLogin,async (req, res) => {
     const adminrecord= await Admin.findOne({username:sessionadmin.username})
    res.render('admin/dashboard',{username:sessionadmin.username, adminrecord,message:''});
})
router.post('/dashboard',async(req,res)=>{
    const{oldpass,newpass}=req.body;
    const admin=await Admin.findOne()
    const comparedpassword = await bcrypt.compare(oldpass, admin.password)
    if(comparedpassword){
        const id =admin.id;
        const hashedPassword = await bcrypt.hash(newpass, 10);
        await Admin.findByIdAndUpdate(id,{username:admin.username,password:hashedPassword})
        const adminrecord= await Admin.findOne()
        res.render('admin/dashboard',{username:sessionadmin.username, adminrecord,message:"Successfully Update"});
    }else{
        const adminrecord= await Admin.findOne()
        res.render('admin/dashboard',{username:sessionadmin.username, adminrecord,message:"OLd and New Password not matched"});
     
    }

})

router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/admin/');
})

router.post('/', async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    const admin = await Admin.findOne({ username: username });
    if (admin !== null) {
        const comparedpassword = await bcrypt.compare(password, admin.password)
        //console.log(comparedpassword);
        //console.log(admin.password)
        if (comparedpassword) {
            req.session.isAuth = true;
            sessionadmin=req.session;
            sessionadmin.username=admin.username
            res.redirect('/admin/dashboard');
        } else {
            res.render('admin/login.ejs',{message:'Wrong credentails'});

        }
    } else {
        res.render('admin/login.ejs',{message:'Wrong credentails'});

    }
});

router.get('/banner',checkLogin, async(req, res) => {
    const bannerRecord = await Banner.findOne()
    res.render('admin/banner.ejs', { bannerRecord: bannerRecord,username:sessionadmin.username})
})



//////test url to enter values in database
router.get('/test', async (req, res) => {
    const username = 'honey'
    let password = '111';
    //let ldesc= 'dgdfhgdg'
    const hashedPassword = await bcrypt.hash(password, 10);
    //console.log(hashedPassword);
    const admin = new Admin({ username: username, password: hashedPassword })
    await admin.save();

})

router.get('/bannerform/:id',checkLogin, async (req, res) => {
    const id = req.params.id;
    const bannerrecord = await Banner.findById(id)
    res.render('admin/bannerform.ejs', { bannerrecord,username:sessionadmin.username });
})

router.post('/bannerupdate/:id',checkLogin, upload.single('img'), async (req, res) => {
    const id = req.params.id;
    const title = req.body.title;
    const desc = req.body.desc
    const ldesc = req.body.ldesc
    const status = 'unread'
    if (req.file) {
        await Banner.findByIdAndUpdate(id, { title: title, desc: desc, ldesc: ldesc, img: req.file.filename });
    }
    else {
        await Banner.findByIdAndUpdate(id, { title: title, desc: desc, ldesc: ldesc });
    }
    res.redirect('/admin/banner');

});

router.get('/query',checkLogin, async (req, res) => {
    const queryRecords = await Query.find();
    console.log(queryRecords.length)
    res.render('admin/query.ejs', { queryRecords: queryRecords, title: 'query', message: '',username:sessionadmin.username })

})

router.get('/queryupdate/:id',checkLogin, async (req, res) => {
    const { id } = req.params
    const queryRecord = await Query.findById(id)
    console.log(queryRecord);
    let a = null;
    if (queryRecord.status == 'unread') {
        a = 'read'
    } else {
        a = 'unread'
    }
    await Query.findByIdAndUpdate(id, { name: queryRecord.name, email: queryRecord.email, query: queryRecord.query, status: a })
    res.redirect('/admin/query');

});
router.post('/querySearch',checkLogin, async (req, res) => {
    const { search } = req.body;
    const searchRecords = await Query.find({ status: search });
    res.render('admin/query.ejs', { queryRecords: searchRecords, title: 'query',message:'',username:sessionadmin.username })
});

router.get('/usermanage',checkLogin, async (req, res) => {
    const userdata = await UserReg.find()
    res.render('admin/usermanage.ejs', { queryRecords: userdata, title: 'User Managemenet', message: '',username:sessionadmin.username })
});
router.get('/statuschange/:id',checkLogin, async (req, res) => {
    const id = req.params.id;
    console.log(id);
    const userRecord = await UserReg.findById(id);
    console.log(userRecord);
    let status = null;
    if (userRecord.status == 'suspended') {
        status = 'active'
    } else {
        status = 'suspended'
    }
    await UserReg.findByIdAndUpdate(id, { username: userRecord.username, password: userRecord.password, status: status, role: userRecord.role });
    res.redirect('/admin/usermanage');

});

router.get('/rolechange/:id',checkLogin, async (req, res) => {
    const id = req.params.id
    const regRecord = await UserReg.findById(id);
    console.log(regRecord);
    let role = null;
    if (regRecord.role == 'public') {
        role = 'pvt'
    } else {
        role = 'public'
    }

    await UserReg.findByIdAndUpdate(id, { username: regRecord.username, password: regRecord.password, status: regRecord.status, role: role })
    res.redirect('/admin/usermanage');
});
//////////////////////////// parking system

router.get('/parking',checkLogin, (req, res) => {
    res.render('admin/parkingform.ejs',{username:sessionadmin.username});



});


router.post('/parkingRecord',checkLogin, async (req, res) => {
    //const a =Parking.count({status:'IN'})
    const { vnumber, vtype, entertime } = req.body;
    const exitTime = 0;
    const amount = 0;
    const status = 'IN'
    const parkingRecord = new Parking({ vnumber: vnumber, vtype: vtype, enterTime: entertime, exitTime: exitTime, amount: amount, status: status });
    await parkingRecord.save();
    res.redirect('/admin/parkingfetch');

});

router.get('/parkingfetch',checkLogin, async (req, res) => {
    const parkingRecords = await Parking.find();
    res.render('admin/parkingfetch.ejs', { parkingRecords,message:'',username:sessionadmin.username})
});

router.get('/parkingupdate/:id',checkLogin, async (req, res) => {
    const id = req.params.id;
    //console.log(id)
    const parkingRecord = await Parking.findById(id);
    res.render('admin/parkingupdate.ejs', { parkingRecord,username:sessionadmin.username })

});

router.post('/parkupdate/:id',checkLogin, async (req, res) => {
    const { exit } = req.body;
    const id = req.params.id;
    const parkRecord = await Parking.findById(id);
    console.log(parkRecord);
    let finalAmount = 0;
    if (parkRecord.vtype == 'twow') {
        finalAmount = (exit - parkRecord.enterTime) * 20
    }
    else if (parkRecord.vtype == 'threew') {
        finalAmount = (exit - parkRecord.enterTime) * 40
    }
    else if (parkRecord.vtype == 'fourw') {
        finalAmount = (exit - parkRecord.enterTime) * 100
    }
    await Parking.findByIdAndUpdate(id, { exitTime: exit, amount: finalAmount, status: 'out' })
    res.redirect('/admin/parkingfetch');

});
router.get('/deleteuser/:id',checkLogin, async (req, res) => {
    const id = req.params.id;
    const userUsername=await UserReg.findById(id)
    await UserReg.findByIdAndDelete(id)
    await UserProfile.findOneAndDelete({username:userUsername.username})
    //res.redirect('/admin/usermanage');
    const userdata = await UserReg.find()
    res.render('admin/usermanage.ejs', { queryRecords: userdata, title: 'User Managemenet', message: 'Successfully deleted',username:sessionadmin.username })

})
router.get('/querydelete/:id',checkLogin, async (req, res) => {
    const id = req.params.id
    await Query.findByIdAndDelete(id)
    const queryRecords = await Query.find();
    //console.log(queryRecords)
    res.render('admin/query.ejs', { queryRecords: queryRecords, title: 'query', message: 'Successfully Deleted',username:sessionadmin.username })

})
router.get('/parkingdelete/:id',checkLogin,async(req,res)=>{
    const id =req.params.id;
    await Parking.findByIdAndDelete(id)
    const parkingRecords = await Parking.find();
    res.render('admin/parkingfetch.ejs', { parkingRecords,message:'Successfully Deleted',username:sessionadmin.username })

});

router.get('/testi',async(req,res)=>{
    const testiRecords= await Testi.find()
    res.render('admin/testi.ejs',{testiRecords,username:sessionadmin.username});
  })
  
  router.get('/testiupdate/:abc',async(req,res)=>{
    const id =req.params.abc;
    const testirecord=await Testi.findById(id)
    console.log(testirecord);
    let newstatus=null;
    if(testirecord.status=='inactive'){
      newstatus='active'
    }else{
      newstatus='inactive'
    }
     await Testi.findByIdAndUpdate(id,{status:newstatus})
     res.redirect('/admin/testi');
  })

module.exports = router;