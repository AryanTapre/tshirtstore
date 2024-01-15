//require('dotenv').config();
require('dotenv').config({
    path: './environmentVariables/.env'
})

const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();

const morgan = require('morgan');
const fileUpload = require('express-fileupload');
const cookieParser = require('cookie-parser');

const swaggerUI = require('swagger-ui-express');
const {SwaggerTheme} = require('swagger-themes');
const yaml = require('yamljs');
const fileSystem = require('fs');

const passport = require('passport');
const googlePassportConfig = require('../passport/googlePassport')
const facebookPassportConfig = require('../passport/facebookPassport');
const githubPassportConfig = require('../passport/githubPassport');

const session = require('express-session');

//FIXME: default config
// {
//     "origin": "*",
//     "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
//     "preflightContinue": false,
//     "optionsSuccessStatus": 204
// }

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
    // optionsSuccessStatus: 200,
    // preflightContinue: true
}))

// app.options('*',(request,response) => {
//     response.header('Access-Control-Allow-Headers','Authorization');
//     response.header('Access-Control-Allow-Headers','RefreshToken');
//     response.sendStatus(204) // empty response for Successful pre-flight
// })

app.use(express.json({
    limit: "100kb",
    // inflate: true, // allow compressed bodies
    // strict: true, // Enables only accepting arrays and object
    // type: "*/*" // accept any format data..
}))

app.use(express.urlencoded({
    extended: true,
    // inflate:true,
    // limit: "100kb",
    // parameterLimit: 1000,
    // type: "*/x-www-form-urlencoded"
}))

app.use(cookieParser());

app.use(express.static('public'))

app.use(session({
    secret: "helloThisSecret",
    cookie: {
        maxAge: 60000
    },
    resave:false,
    saveUninitialized:true
}))

// middleware for passport settings....
app.use(passport.initialize(googlePassportConfig));
app.use(passport.initialize(facebookPassportConfig));
app.use(passport.initialize(githubPassportConfig));

//morgan middleware
app.use(morgan('tiny'));

//swagger
const theme = new SwaggerTheme('v3');
const themeOptions = {
        explorer: false,
        customCss: theme.getBuffer('dark')
}

const file = fileSystem.readFileSync('./swagger.yaml','utf-8');
const swaggerDocument = yaml.parse(file);
app.use('/api-docs',swaggerUI.serve,swaggerUI.setup(swaggerDocument,themeOptions));

//custom middlewares
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp/'
}));

//EJS- Embedded JavaScript
app.set("view engine",'ejs');

//FIXME: importing routes
const {homeRouter} = require("../routes/home");
const {
        logoutRouter,
        signupRouter,
        loginRouter,
        forgetPasswordRouter,
        passwordResetRouter,
        dashboardRouter,
        changePasswordRouter,
        userUpdateRouter,
        adminAllUserRouter,
        managerAllUserRouter,
        adminUserRouter,
        googleLoginRouter,
        facebookLoginRouter,
        googleCallbackHandlerRouter,
        facebookCallbackHandlerRouter,
        githubLoginRouter,
        githubCallbackHandlerRouter,
        regenerateAccessRefreshTokenRouter,
        deleteUserDataRouter
} = require('../routes/user');

const {productRouter} = require('../routes/product')
const {paymentRouter} = require('../routes/payment')
const {orderRouter} = require('../routes/order')

// FIXME: middlewares for routes
//user Routes
app.use(homeRouter);
app.use('/api/v1/',loginRouter);
app.use('/api/v1/',signupRouter);
app.use('/api/v1/',logoutRouter);
app.use('/api/v1/',forgetPasswordRouter);
app.use('/api/v1/',passwordResetRouter);
app.use('/api/v1/',dashboardRouter);
app.use('/api/v1/',changePasswordRouter);
app.use('/api/v1/',userUpdateRouter);
app.use('/api/v1/',adminAllUserRouter);
app.use('/api/v1/',managerAllUserRouter);
app.use('/api/v1',adminUserRouter)

//Product Routes
app.use('/api/v1/',productRouter);

//Payment Routes
app.use('/api/v1',paymentRouter);

//Order routers
app.use('/api/v1',orderRouter);

// google login router
app.use('/api/v1',googleLoginRouter)

// google callback handler
app.use('/api/v1',googleCallbackHandlerRouter);

//facebook login router
app.use('/api/v1',facebookLoginRouter);

//facebook callback handler
app.use('/api/v1',facebookCallbackHandlerRouter);

// Github login Router
app.use('/api/v1',githubLoginRouter);

// Github callback router
app.use('/api/v1',githubCallbackHandlerRouter);

//re-generate access refresh tokens router
app.use('/api/v1',regenerateAccessRefreshTokenRouter);

app.use('/api/v1',deleteUserDataRouter)

app.get("/",(request,response) => {
    response.render("home")
})
app.get("/signup",(request,response) => {
    response.render("signup")
})

app.get("/login",(request,response) => {
    response.render("login");
})

app.get("/checkout",async(request,response) => {
    const result = await axios.get("http://localhost:5000/api/v1/get/product/655763bb47d0f0a93dddafd1");
    console.log(result.data);
    response.render("checkout",{productData:result.data.productInformation});
})

//TODO: Exporting app
module.exports = app;
