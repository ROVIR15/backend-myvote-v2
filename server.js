const express = require('express');
const session = require('express-session');
const passport = require('passport');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors')

const user = require('./routes/api/user')
const admin = require('./routes/api/admin')
const voter = require('./routes/api/pemilih')
const app = express();

const {start} = require('./helpers/amqplib')

require('./config/passport');
require('./models/User');
require('./models/UserSession')

app.use(cors())
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({ secret: 'passport-tutorial', cookie: { maxAge: 60000 }, resave: false, saveUninitialized: false}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(passport.initialize());
app.use(passport.session());

const db = require('./config/keys').MongoURI;
const options = { useFindAndModify : false, useNewUrlParser: true};

mongoose
    .connect(db, options)
    .then(() => console.log('MongoDB Connected...'))
    .catch(err => console.log(err));

app.use('/', user);
app.use('/administrator', admin);

start();

const port = process.env.PORT || 5000;

app.listen(port, () => console.log('Server started on port 5000'));