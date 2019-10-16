const router = require('express').Router();
const Election = require('../../models/Election')
const Candidate = require('../../models/Candidate')
const Voter = require('../../models/Voter');
const Transaction = require('../../models/TransactionStorage')

/**
 * var data = {
 *  uid: "",
 *  election_id: ""
 * }
 */
router.post('/voter', function(req, res){
    const {body: {data: {uid, election_id}}} =  req

    const candidates = Candidate.find({election_id}, function(info, err){
        if(!info) return res.json({message: "Cannot find any candidates here"})
        if(err) return res.json({message: "Error was occured"});
        return info
    })

    const user = Voter.findOne({_id: uid}, function(info, err){
        if(!info) return res.json({message: "Cannot find an user here"})
        if(err) return res.json({message: "Error was occured"});
        return info
    })

    const transaction = Transaction.findOne({election_id: election_id}, function(info, err){
        if(!info) return res.json({message: `Cannot find an transaction storage for ${election_id} here`})
        if(err) return res.json({message: "Error was occured"});
        return info.transactions
    })

    const election = Election.findOne({_id: election_id}, function(info, err){
        if(!info) return res.json({message: `Cannot find an transaction storage for ${election_id} here`})
        if(err) return res.json({message: "Error was occured"});
        return info
    })

    const info = {
        voted: user.voted,
        authenticated: user.authenticated,
        account: user.encpk
    }

    const election= {
        candidate_list: candidates,
        transaction_list: transaction,
        start: election.election_start,
        end: election.election_end,
        name: election.name,  
    }

    return res.json({success: true, data: {info, election}})
})

module.exports = router;