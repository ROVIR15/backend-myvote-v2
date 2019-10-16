const passport = require('passport');
const router = require('express').Router();

const UsersSession = require('../../models/UserSession');
const Election = require('../../models/Election')
const Users =require('../../models/User');
const Administrator = require('../../models/Administrator');
const TransactionStorage = require('../../models/TransactionStorage');

const {publish} = require('../../helpers/amqplib')

function randomIntFromInterval(min,max) {
    return Math.floor(Math.random()*(max-min+1)+min);
}

router.get('/login', function(req, res){
    res.render('login');
})

router.post('/login', function(req, res, next){
    passport.authenticate('local', function(err, user, info) {
        if (err) { return next(err); }
        if (!user) { return res.status(401).json({status : false, message : {error : info}}) } 
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

router.post('/sign-up', function(req, res){
  const {body: {data : {administrator_name, election_name, election_description, email, address, identification_id, position, organization_name}}} = req;
  
  const dataAdministrator = {name: administrator_name, email, institution_address: address, identification_id, position}
  const dataElection = {election_name, description: election_description, institution_name: organization_name, insititution_address: address};

  const newAdministrator = new Administrator(dataAdministrator);
  const newElection = new Election(dataElection);
  const dataUser = {_id: newAdministrator._id, username: identification_id, password: "123456", email: email}
  const newUser =  new Users(dataUser);
  const dataTransaction = {related_id: newElection._id}
  const newTransactionList = new TransactionStorage(dataTransaction)

  newAdministrator.save();
  newElection.save();
  newUser.save();
  newTransactionList.save()

  return res.json({ok: true})
  // try {
  //   return res.json({success: true, data: obj});
  // } catch (error) {
  //   if(error) return res.status(401).json({error: new Error(error)});
  // };
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
          return res.send({
            success: false,
            message: 'Error: Server error'
          });
        }
        if (sessions.length != 1) {
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