const router = require('express').Router();
const Election = require('../../models/Election');
const Voter = require('../../models/Voter');
const User = require('../../models/User')
const Candidate = require('../../models/Candidate');
const Administrator = require('../../models/Administrator');
const Transaction = require('../../models/TransactionStorage')
const {publish, amqpConn} = require('../../helpers/amqplib')

/* pemilih related ===============================================*/
router.post('/voters', function(req, res){
    const {body: {data: {election_id}}} = req;

    Voter.find({election_id}, function(err, info){
        if(err) return res.json({success: false, message: "Something goes wrong!"})
        if(!info) return res.json({success: false, message: `Cannot find voters with election id ${election_id}`})
        return res.json({success: true, data: info});
    })
})

router.post('/add-voters', function(req, res){
    const {body: {data, election_id} } = req;
    let error = []
    data.map((voter)=> {
        voter = {...voter, election_id};
        const storeVoter = new Voter(voter);
        try {
            let newVoter = storeVoter.save();
            const dataUser = {_id: storeVoter._id, username: voter.identification_id, password: "123456", email: voter.email}
            const newUser =  new User(dataUser);
            if(newUser._id !== storeVoter._id){
                User.updateOne({username: newVoter.identification_id}, {$set : {_id: newVoter._id}}, function(err, info){
                    if(err) console.error(err);
                    if(info.nModified === 0) console.error("Something wasn't right!");
                })
            } 
            newUser.save().then(console.log)
        } catch(err){
            console.log(err)
            error.push(`Error when saving data ${voter.identification_id}`)
        }
    })

    return res.json({success: true, message: "Successfully adding new data to database", error})
})

router.put('/update-voter', function(req, res){
    const {body: {data}} = req;

    Voter.updateOne({_id: data._id}, {$set: data}, function(err, info){
        if(err) return res.json({success: false, error: "something goes wrong!"})
        if(!info) return res.status(404).json({success: false, error: "Pemilih doesn't recognized by system"})
        return res.json({success: true, data: info})
    })
})

router.delete('/delete-voter', function(req, res){
    const {body: {data}} = req
    Voter.findByIdAndRemove({_id: data._id}, function(err, info){
        if(err) return res.json({success: false, message: "Something goes wrong!"});
        return res.json({success:true})
    })
});

/* kandidat related ===============================================*/
router.post('/candidates', function(req, res){
    const {body: {data: {election_id}}} = req;

    Candidate.find({election_id}, function(err, info){
        if(err) return res.json({success: false, message: "Something goes wrong!"})
        if(!info) return res.json({success: false, message: `Cannot find candidates with election id ${election_id}`})
        return res.json({success: true, data: info});
    })
})

router.post('/add-candidates', function(req, res){
    const {body: {data, election_id}} = req;

    const error = []
    data.map(candidate => {
        candidate = {...candidate, election_id};
        const storeCandidate = new Candidate(candidate);
        try {
            storeCandidate.save();
        } catch(err){
            error.push(`Error when saving data ${candidate.name}`)
        }
    })

    return res.status(200).json({success: true, message: "Successfully adding candidates to system", error})
})

router.put('/update-candidate', function(req, res){
    const {body: {data}} = req;

    Candidate.updateOne({ _id: data._id }, { $set: data }).exec(function(err, Candidate){
        if(err) return res.json({success: false, error: "something goes wrong!"})
        if(!Candidate) return res.status(404).json({success: false, error: "Kandidat doesn't recognized by system"})
        return res.json({success: true, data: Candidate, message: "Successfully update candidate data"})
    });
});

router.delete('/delete-candidate', function(req, res){
    const {body: {data}} = req;

    Candidate.findByIdAndRemove({_id: data._id}, function(err, info){
        if(err) return res.json({success: false, message: `Something goes wrong!`})
        return res.json({success: true, message: `Successfully remove data voter with id ${data._id}`})        
    })
});
/* kegiatan related ===============================================*/
/**
 * const data = {
 *  uid: "",
 *  election_id: ""
 * }
 */
router.post('/', async function(req,res){
    const {body: {data: {election_id, uid}}} = req

    const election = await Election.findOne({_id: election_id}, function(err, info){
        if(err) return res.json({success: false, message: "Something goes wrong!"});
        if(!info) return res.json({success: false, message: 'Not found'})
        return info
    })

    var administrator = await Administrator.findOne({_id: uid}, function(err, info){
        if(err) return res.json({success: false, message: "Something goes wrong!"});
        if(!info) return res.json({success: false, message: 'Not found admmin'})
        return info
    })

    var transaction = await Transaction.findOne({related_id: election_id}, function(err, info){
        if(err) return res.json({success: false, message: "Something goes wrong!"});
        if(!info) return res.json({success: false, message: 'Not found'})
        return info
    })

    const res_data = {
        doc: {
            contract_address: election.contract,
            transaction_hash: election.transaction_hash,
        },
        election: {
            id: election._id,
            name: election.election_name,
            date_reg: election.timestamp,
            start: new Date(election.election_start),
            end: new Date(election.election_end),
        },
        administrator: {
            id: administrator._id,
            name: administrator.name
        },
    }
    return res.json({success: true, data: res_data})
})

router.put('/update-election', function(req, res){
    const {body: {data}} = req;

    const obj = {election_start: new Date(data.election_start), election_end: new Date(data.election_end)}
    Election.updateOne({_id: data._id}, {$set : obj}, function(err, info){
        if(err) return res.json({success: false, message: "Something goes wrong!"})
        if(!info) return res.json({success: false, message: "Nothing has changed!"})
        return res.json({success: true, message: "Done"});
    })
})

async function getUserData(id, cb){
    await User.findById({_id: id}, function(err, info){
        if(err || !info) throw new Error("Please check your body data")
        cb(obj.encpk);
    })
}

router.post('/create-election-contract', function(req, res){
    const {body: {data}} = req;
    
    console.log(data);
    if(!data) return res.json({ok: false, message: {error: new Error("Cannot found election data!")}})
    publish("", "create-election", new Buffer.from(JSON.stringify(data)))

    return res.json({ok: true})
})

/**
 * @params {Object} data
 * @description 
 * @param {String} election_id
 * @param {String} administrator_id
 * @param {Array} voters
 */
router.post('/activate-voters', function(req, res){
    const {body} = req;

    publish("", "activate-voters", new Buffer.from(JSON.stringify(body)));  
    return res.json({ok: true})
})

/**
 * @params {Object} data
 * @description 
 * @param 
 */
router.post('/activate-candidates', function(req, res){
    const {body} = req;
    
    publish("", "activate-candidates", new Buffer.from(JSON.stringify(body)));
    return res.json({ok: true})
})

module.exports = router;