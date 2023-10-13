const express = require('express');
const dbConnect = require('./config/dbConnection');
const bodyParser = require('body-parser');
const app = express();
const nocache = require('nocache');
const dotenv = require('dotenv').config();
const path = require('path')
const cookieParser = require('cookie-parser');
const PORT = process.env.PORT || 4000;
const hbs = require('express-handlebars');
const handlebars = require('handlebars');
const session = require('express-session')
const { notFound, errorHandler } = require('./middlewares/errorHandler');
const publicDirectoryPath = path.join(__dirname, '/public')
const flash = require('connect-flash')

const express_fileupload = require('express-fileupload')

//requiring admin routes
const adminRouter = require('./routes/adminRouter');
const categoryRouter = require('./routes/category_router');
const productRouter = require('./routes/product_router');
const customerRouter = require('./routes/customer_router');
const salesRoute = require('./routes/sales_route');
const coupensRoute = require('./routes/coupen_route');
const bannerRoute = require('./routes/banner_route');

//user routers 
const userRouter = require('./routes/userRouter');
const myAccountRouter = require('./routes/myAccountRouter');
const orderRouter = require('./routes/orderRouter');
const cartRouter = require('./routes/cartRouter');
const productSearchRouter = require('./routes/productSearchRoute');
const reviewRouter = require('./routes/reviewRouter');


//connect database
dbConnect();

//body-Parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// app.use(express_fileupload())
//connect flash
app.use(flash())

//setting  us the view engine 
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.use(express.static(publicDirectoryPath))

const xhbs = hbs.create({
  layoutsDir: __dirname + '/views/layouts',
  extname: 'hbs',
  runtimeOptions: {
    allowProtoPropertiesByDefault: true,
    allowProtoMethodsByDefault: true,
  },
  defaultLayout: 'layout',
  partialsDir: __dirname + '/views/partials/'
});

app.engine('hbs', xhbs.engine);

handlebars.registerHelper('toDateAndTime', function (date) {
  date = new Date(date);
  const year = date.getFullYear();
  const month = date.getMonth() + 1; // Months are zero-based, so add 1
  const day = date.getDate();

  const timeString = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false
  });

  return `${day}-${month}-${year} ${timeString}`;
});

handlebars.registerHelper('checkSatatus', function (status, options) {
  if (status == "Debit") {
    return options.fn(this);
  } else {
    return options.inverse(this);
  }
})

app.use(session({
  secret: 'secrekeey',
  resave: false,
  maxAge: 1000 * 60 * 60,
  saveUninitialized: true
}))


//clearing the cache of browser
app.use(nocache());

//user router
app.use('/', userRouter);
app.use('/my-account', myAccountRouter);
app.use('/cart', cartRouter);
app.use('/orders', orderRouter);
app.use('/products', productSearchRouter);
app.use('/reviews', reviewRouter);


//admin router
app.use('/admin', adminRouter);
app.use('/admin/categories', categoryRouter);
app.use('/admin/products', productRouter);
app.use('/admin/customers', customerRouter);
app.use('/admin/sales-report', salesRoute);
app.use('/admin/coupens', coupensRoute);
app.use('/admin/banners', bannerRoute);

//error handling
app.use(notFound);
app.use(errorHandler)

//server listening to the port
app.listen(PORT, () => {
  console.log(`serevr is running at port ${PORT}`)
})