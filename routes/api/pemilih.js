const router = require('express').Router();
const Pemilih =require('../../models/Pemilih');
const Kegiatans = require('../../models/KegiatanSchema')
const Users =require('../../models/User');


function randomIntFromInterval(min,max) {
    return Math.floor(Math.random()*(max-min+1)+min);
}

router.post('/dashboard/admin/:id_kegiatan/tambah_pemilih', function(req, res){
    const {body: {data} } = req;

    let kegiatan = req.query.id_kegiatan

    const finalPemilih = new Pemilih(data);

    finalPemilih.save().then(() => console.log("Data Pemilih has been added"));

    var randomNumber = randomIntFromInterval(273981,123172983).toString();
    const dataRegisterUser = {username : data.nik_pemilih, password: randomNumber, email: data.email_pemilih}

    const finalUser = new Users(dataRegisterUser);

    finalUser.setPassword(finalUser.password);

    return res.json({success: true, message : "Data has been added and account is activated", data: { username: finalUser.username, password: finalUser.password}});
})

// router.post('/dashboard/admin/tambah-pemilih', function(req, res){
//     const { body: { data } } = req;

//     if(!data_voter){
//         return res.status(422).json({
//         errors: {
//             username: 'is required'}});
//     }
//     if(!data.id_voter) return res.status(422).json({error: "something goes wrong, didnt receive any id_voter variabel"});
//     if(!data.id_ktp) return res.status(422).json({error: "something goes wrong, didnt receive any id_ktp variabel"});
//     if(!data.id_kegiatan) return res.status(422).json({error: "something goes wrong, didnt receive any id_kegiatan variabel"});
//     if(!data.id_address_user) return res.status(422).json({error: "something goes wrong, didnt receive any id_address_user variabel"});
   
//     const finalPemilih = new Pemilih(data);

//     return finalPemilih.save()
//         .then(() => res.json({success : 'registered as voter' }));
// })

// router.put('/dashboard/admin/update-pemilih/:id_voter', function(req, res){
//     Pemilih.update({ id_voter: id_voter }, { $set: { size: 'large' }}).exec(function(err, voter){
//         if(err) return res.json({success: false, error: "something goes wrong!"})
//         if(!voter) return res.status(404).json({success: false, error: "Pemilih doesn't recognized by system"})
//         return res.json({success: true, msg: 'data Pemilih has been updated'})
//     });
// });

// router.delete('/dashboard/admin/hapus-pemilih/:id_voter', function(req, res){
//     Pemilih.findByIdAndRemove({id_voter}).exec(function(err, voter){
//         if(err) return res.json({success: false, error: "something goes wrong!"})
//         if(!voter) return res.status(404).json({success: false, error: "Pemilih doesn't recognized by system"})
//         return res.json({success: true, msg: 'data Pemilih has been deleted'})
//     });
// });



module.exports = router;