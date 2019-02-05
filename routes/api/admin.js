const router = require('express').Router();
const Kegiatans = require('../../models/KegiatanSchema')
const Pemilih = require('../../models/Pemilih')
const Kandidat = require('../../models/Kandidat')
const DetailKegiatan = require('../../models/DetailKegiatanSchema')

/* pemilih related ===============================================*/
router.post('/kegiatan/:id_kegiatan/tambah-pemilih', function(req, res){
    const {body: {data} } = req;
    const {params: {id_kegiatan}} = req;
    const finalPemilih = new Pemilih(data);

    finalPemilih.save().then(() => console.log("Data Pemilih has been added"));

    let {id_voter} = finalPemilih
        DetailKegiatan.updateOne({id_kegiatan: id_kegiatan}, {$push : {id_voter: id_voter}}, function(err, voter){
        if(err) return res.json({success: false, message: {error: err}})
        if(voter.nModified === 0) console.log({success: false, message: {error: "Cannot adding Pemilih"}});
        console.log(voter)
        return res.json({success: true, message: {voter}})
    })

})

router.put('/kegiatan/:id_kegiatan/ubah-pemilih/', function(req, res){
    const {params: {id_kegiatan}} = req;

    DetailKegiatan.find({id_kegiatan: id_kegiatan}, function(err, found){
        if(err) return res.status(401).json({success: false, message: {error: "Something goes wrong"}});
        if(!found) return res.status(404).json({success: false, message: {error: "Kegiatan not found"}});
        let temp = found[0], {id_voter} = temp;
        console.log(temp, id_voter)
        Pemilih.find({id_voter: { $in : id_voter}}).exec(function(err, voters){
            if(err) return res.status(401).json({success: false, message: {error: "Something goes wrong!"}});
            if(!voters) return res.status(400).json({success: false, message: {error: "Voters not found!"}});
            return res.status(200).json({success: true, message: {data: voters}});
        })
    })
})

router.put('/kegiatan/:id_kegiatan/update-pemilih/:id_voter', function(req, res){
	const {params:{id_voter}} = req
    Pemilih.update({ id_voter: id_voter }, { $set: { size: 'large' }}).exec(function(err, voter){
        if(err) return res.json({success: false, error: "something goes wrong!"})
        if(!voter) return res.status(404).json({success: false, error: "Pemilih doesn't recognized by system"})
        return res.json({success: true, msg: {voter, pesan : 'data Pemilih has been updated'}})
    });
});

router.delete('/kegiatan/:id_kegiatan/hapus-pemilih/:id_pemilih', function(req, res){
    const {params:{id_pemilih, id_kegiatan}} = req
    DetailKegiatan.updateOne({id_kegiatan: id_kegiatan}, {$pull : {id_voter : id_pemilih}}).exec(function(err, success){
        if(err) return res.json({success: false, error: "something was wrong"});
        if(success.nModified === 0) return res.json({success: false, error: "Nothing has changed"})
        Pemilih.findOneAndRemove({id_voter:id_pemilih}).exec(function(err, Candidate){
            if(err) return res.json({success: false, error: "something goes wrong!"})
            if(!Candidate) return res.status(404).json({success: false, error: "Pemilih doesn't recognized by system"})
            return res.json({success: true, msg: 'data Pemilih has been deleted'})
        });  
    })
  });

/* kandidat related ===============================================*/
router.post('/kegiatan/:id_kegiatan/tambah-kandidat', function(req, res){
    const{params:{id_kegiatan}} = req;
    const{body: {data}} = req;

    const finalKandidat = new Kandidat(data)

    finalKandidat.save(function(err, Candidate){
        if(err) return res.json({success: false, error: "something goes wrong!"})
        if(!Candidate) return res.status(404).json({success: false, error: "Kandidat doesn't recognized by system"})
        DetailKegiatan.updateOne({id_kegiatan: id_kegiatan}, {$push: {id_kandidat: finalKandidat._id}}).exec(function(err, success){
            if(err) return res.json({success: false, error: "cannot find kegiatan"});
            if(success.nModified === 0) return res.json({success: false, error: ""})
            return res.json({success: true, message: "successfully adding kandidat into kegiatan"});
        })
    })
})

router.get('/kegiatan/:id_kegiatan/ubah-kandidat', function(req, res){
	const {params:{id_kegiatan}} = req
    DetailKegiatan.findOne({id_kegiatan: id_kegiatan}).exec(function(err, event){
        if(err) return res.json({success: false, message: {error: "Something goes wrong, cannot find any kegiatan"}});
        if(!event) return res.json({success: false, message: {error: "Kandidat not found"}})        
        let temp = event[0], {id_kandidat} = temp;
        Kandidat.find({id_kandidat: id_kandidat}).exec(function(err, candidates){
            if(err) return res.json({success: false, message: {error: "Something goes wrong, cannot find any kegiatan"}});
            if(!candidates) return res.json({success: false, message: {error: "Kandidats not found"}});
            return res.json({success: true, message: {data: candidates}})
        });
    })
});

router.put('/kegiatan/:id_kegiatan/update-kandidat/:id_kandidat', function(req, res){
    const {params:{id_kandidat}} = req;
    const {body: {data}} = req;

    Kandidat.update({ _id: id_kandidat }, { $set: { data }}).exec(function(err, Candidate){
        if(err) return res.json({success: false, error: "something goes wrong!"})
        if(!Candidate) return res.status(404).json({success: false, error: "Kandidat doesn't recognized by system"})
        return res.json({success: true, msg: {Candidate, pesan : 'data Kandidat has been updated'}})
    });
});

router.delete('/kegiatan/:id_kegiatan/hapus-kandidat/:id_kandidat', function(req, res){
	const {params:{id_kandidat, id_kegiatan}} = req

    DetailKegiatan.updateOne({id_kegiatan: id_kegiatan}, {$pull : {id_kandidat : id_kandidat}}).exec(function(err, success){
        if(err) return res.json({success: false, error: "something was wrong"});
        if(success.nModified === 0) return res.json({success: false, error: "Nothing has changed"})
        Kandidat.findOneAndRemove({_id:id_kandidat}).exec(function(err, Candidate){
            if(err) return res.json({success: false, error: "something goes wrong!"})
            if(!Candidate) return res.status(404).json({success: false, error: "Kandidat doesn't recognized by system"})
            return res.json({success: true, msg: 'data Kandidat has been deleted'})
        });
    });
});

/* kegiatan related ===============================================*/

router.get('/kegiatan/:id_kegiatan/profil-kegiatan', function(req, res){
    const {params: {id_kegiatan}} = req;
	Kegiatans.findById({_id : id_kegiatan}, function(err, event){
        console.log(err, event)
		if(err) return res.json({success: false, error: {message : "Something goes wrong"}});
		return res.json({success: true, message: { data: event }})
	});
})

router.put('/kegiatan/:id_kegiatan/update-kegiatan', function(req, res){
	const {params: {id_kegiatan}} = req;
	const {body: {data}} = req;

	Kegiatans.updateOne({_id: id_kegiatan}, {$set: {"waktu_mulai": new Date(data.waktu_mulai), "waktu_akhir": new Date(data.waktu_akhir)}}, function(err, event){
		if(err) return res.json({success: false, message: { error : err}});
		if(event) return res.json({success: true, message: {data : event}});
	})
})

module.exports = router;