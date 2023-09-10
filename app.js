const express = require('express');
const dbConnect = require('./config/dbConnection');
const bodyParser = require('body-parser');
const app = express();
const nocache = require('nocache');
const dotenv = require('dotenv').config();
const path = require('path')
const cookieParser = require('cookie-parser');
const PORT = process.env.PORT || 4000;
const hbs = require('express-handlebars')
const adminRouter = require('./routes/adminRouter');
const userRouter = require('./routes/userRouter')
const session = require('express-session')
const { notFound, errorHandler } = require('./middlewares/errorHandler');
const publicDirectoryPath = path.join(__dirname, '/public')

//connect database
dbConnect();

//body-Parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));
app.use(cookieParser());

//setting  us the view engine 
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.use(express.static(publicDirectoryPath))
app.engine('hbs', hbs.engine({ 
    layoutsDir: __dirname + '/views/layouts',
    extname: 'hbs',
    defaultLayout: 'layout',
    partialsDir:__dirname+'/views/partials'
    }));

    app.use(session({
        secret: 'secrekeey',
        resave: false,
        maxAge:1000*60*60,
        saveUninitialized: true
      }))


//clearing the cache of browser
app.use(nocache());

//admin router
app.use('/', userRouter);
app.use('/admin',adminRouter)


//error handling
app.use(notFound);
app.use(errorHandler)

//server listening to the port
app.listen(PORT, () => {
    console.log(`serevr is running at port ${PORT}`)
})