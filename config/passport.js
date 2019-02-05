const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

const Users = require('../models/User');

passport.use(new LocalStrategy({
    usernameField : 'username',
    passwordField : 'password'
},async (username, password, done) => {
    let validate = false
    Users.findOne({username})
    .then((user) => {
        if(!user){
          return done(null, false, 'username is invalid');      
        }
        console.log(user)
        user.isValidPassword(password).then(res => { 
            if(!res) return done(null, false, 'password is invalid')
            if(res) console.log(res);
            return done(null, user);
        })
    })
})
)

passport.serializeUser(function(user, done){
    return done(null, user._id);
})

passport.deserializeUser(function(id, done){
    Users.findById(id, function(err, user) {
        return done(err, user);
    });
});