const passport = require('passport');
const router = require('express').Router();
const Kegiatan = require('../../models/KegiatanSchema')
const Users =require('../../models/User');
const UsersSession = require('../../models/UserSession');
const AdminPenyelenggara = require('../../models/AdminPenyelenggaraSchema');
const Institusi = require('../../models/InstitusiSchema');
const DetailKegiatan = require('../../models/DetailKegiatanSchema')

function randomIntFromInterval(min,max) {
    return Math.floor(Math.random()*(max-min+1)+min);
}

router.get('/', function(req, res){
    Users.find()
    .then(user => res.json({user}));
})

router.get('/login', function(req, res){
    res.render('login');
})

router.post('/login', function(req, res, next){
    passport.authenticate('local', function(err, user, info) {
        if (err) { return next(err); }
        if (!user) { return res.status(401).json({status : false, message : {error : info}}) } 
        console.log(err, user, info)
        if (user && typeof user === 'object') {
            req.logIn(user, function(err) {
            if (err) { return next(err); }
            if (user){
                const newUserSession = new UsersSession({
                    id : user._id,
                    isAuth : req.isAuthenticated()
                })
                newUserSession.save((err, doc) => {
                    if (err) {
                      return res.send({
                        status: false,
                        message: { error : 'Error: server error'}
                    });
                }
                return res.status(200).json({status : true, message : newUserSession.authInfo()});
                });
            }      
        });
        }
    })(req, res, next);
})

router.post('/register', function(req, res){
    const { body: { data } } = req;

    let data1 = { nama_kegiatan: data.nama_kegiatan, des_kegiatan: data.des_kegiatan}

    const finalKegiatan = new Kegiatan(data1);

    finalKegiatan.save().then(() => console.log("success adding event to Kegiatan models"));

    let data2 = { id_kegiatan: finalKegiatan._id, nama_adminpeny: data.nama_admpeny, nik_adminpeny: data.nik_admpeny ,jabatan_adminpeny: data.jabatan_admpeny, email_adminpeny: data.email_admpeny}
    
    const finalAdminPenyelenggara = new AdminPenyelenggara(data2)

    finalAdminPenyelenggara.save().then(() => console.log("success adding admin to Admin Penyelenggara models"))

    let  data3 = {nama_institusi: data.nama_institusi, alamat_institusi: data.alamat_institusi_admpeny}
    
    const finalInstitusi = new Institusi(data3);

    finalInstitusi.save().then(()=> console.log("success adding institusi models"))

    var randomPassword = randomIntFromInterval(342323,31290830).toString()
    let data4 = {username: finalAdminPenyelenggara.nik_adminpeny, password: randomPassword, email: finalAdminPenyelenggara.email_adminpeny}

    const finalUser = new Users(data4)

    finalUser.setPassword(finalUser.password);

    let data5 = {id_admin_penyelenggara: finalAdminPenyelenggara._id,
                    id_kegiatan: finalKegiatan._id ,
                    id_institusi: finalInstitusi._id}

    const finalDetailKegiatan = new DetailKegiatan(data5)

    finalDetailKegiatan.save().then(()=> console.log("success adding detail kegiatan"))

    return finalUser.save().then(() => res.json({success: true, message: "Your data has been added", data: {username: finalUser.username, password: randomPassword}}));
})

router.get('/logout', function(req, res){
    const {query : { id }} = req;
    UsersSession.findOneAndRemove({id, isAuth: true})
    .exec(function(err, user) {  
        if (err) {
            return res.json({success: false, msg: 'Cannot remove item'});
        }       
        if (!user) {
            return res.status(404).json({success: false, msg: 'User not found'});
        }  
        res.json({success: true, msg: 'User deleted.'});
    });
    req.session.destroy();
});

router.get('/verify', function(req, res){
    const {query:{ id }} = req;

    UsersSession.find({
        id: id,
        isAuth: true
      }, (err, sessions) => {
        if (err) {
          console.log(err);
          return res.send({
            success: false,
            message: 'Error: Server error'
          });
        }
        if (sessions.length != 1) {
          console.log(sessions);
          return res.send({
            success: false,
            message: 'Error: Invalid'
          });
        } else {
          // DO ACTION
          return res.send({
            success: true,
            message: 'Good'
          });
        }
      });
});

module.exports = router;