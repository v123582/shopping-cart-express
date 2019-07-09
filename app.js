const createError = require('http-errors');
const express = require('express');
const path = require('path');
const methodOverride = require('method-override');
const exphbs  = require('express-handlebars');
const bodyParser = require('body-parser')
const session = require('express-session');
const cookieParser = require('cookie-parser');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');

const app = express();

// view engine setup
app.engine('.hbs', exphbs({
  extname: '.hbs', 
  defaultLayout: 'main',
  helpers: require('./config/handlebars-helpers')
}));

app.set('view engine', '.hbs');

// Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded());

// Parse JSON bodies (as sent by API clients)
app.use(express.json());
app.use(methodOverride('_method'))
app.use(express.static(path.join(__dirname, 'public')));

app.use(cookieParser());
app.use(session({
    secret: '12345',
    name: 'testapp',   //这里的name值得是cookie的name，默认cookie的name是：connect.sid
    cookie: {maxAge: 80000 },  //设置maxAge是80000ms，即80s后session和相应的cookie失效过期
    resave: false,
    saveUninitialized: true,
}));

const db = require('./models')
app.listen(3000, () => {
  db.sequelize.sync()
  console.log(`Example app listening on port ${3000}!`)
})

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
