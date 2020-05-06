const express = require('express');

const app = express();
const session = require('express-session');
const cookieParser = require('cookie-parser');
const passport = require('passport');

const bodyParser = require('body-parser');
const compression = require('compression');
const { User } = require('./Server/Database/Models');


app.use(cookieParser());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true,
}));


app.use(session({
	secret: 'zuehfzgbvchbsgvrcghuzebcrvgvzgervf',
	resave: false,
	saveUninitialized: true,
}));


passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(passport.initialize());
app.use(passport.session());

if (process.env.NODE_ENV === 'production') app.use(compression());

app.use(require('./Server/Routes/index'));

app.listen(3000);
