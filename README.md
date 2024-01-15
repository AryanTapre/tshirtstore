**Technology used:** ![swagger](https://res.cloudinary.com/djmev9ppr/image/upload/v1705335363/icons/swagger%20docs.png) ![stripe](https://res.cloudinary.com/djmev9ppr/image/upload/v1705335363/icons/stripe.png) ![razorpay](https://res.cloudinary.com/djmev9ppr/image/upload/v1705335363/icons/razorpay.png) ![postman](https://res.cloudinary.com/djmev9ppr/image/upload/v1705335363/icons/postman.png) ![nodeJS](https://res.cloudinary.com/djmev9ppr/image/upload/v1705335362/icons/nodejs.png) ![github](https://res.cloudinary.com/djmev9ppr/image/upload/v1705335362/icons/github.png) ![mongoDB](https://res.cloudinary.com/djmev9ppr/image/upload/v1705335362/icons/mongo%20db.png) ![mailtrap](https://res.cloudinary.com/djmev9ppr/image/upload/v1705335362/icons/mailtrap.png) ![jwt](https://res.cloudinary.com/djmev9ppr/image/upload/v1705335362/icons/jwt.png) ![Google](https://res.cloudinary.com/djmev9ppr/image/upload/v1705335362/icons/google.png) ![facebook](https://res.cloudinary.com/djmev9ppr/image/upload/v1705335362/icons/facebook.png) ![ExpressJS](https://res.cloudinary.com/djmev9ppr/image/upload/v1705335362/icons/express%20js.png) ![cloudinary](https://res.cloudinary.com/djmev9ppr/image/upload/v1705335362/icons/cloudinary.png) ![css3](https://res.cloudinary.com/djmev9ppr/image/upload/v1705071655/icons/css3.png) ![JavaScript](https://res.cloudinary.com/djmev9ppr/image/upload/v1705071655/icons/js.png) ![html5](https://res.cloudinary.com/djmev9ppr/image/upload/v1705071655/icons/html5.png)

**Cool Name Be:** *Tshirtstore*

---

📝**Requirement:**
- A backend to serve for `mobile application`, `desktop application`, `web application`

- A store named `TshirtStore` wanna be rolled  into internet so that customers buys Tshirts Online.


📒**Description:**
- A production ready backend `live hosted` on `render.com` for handling `Request` and `Response` for Tshirtstore application.

- Comes with latest `OpenAuthorization` with `Google`, `Github` and `Facebook` .

- A digital assess management with `Cloudinary`.

- Email functionality for resetting password with `mailTrap`.

- As usual build upon most well known runtime `NodeJS`.

🤖**Technical Discussion:**


> *Let's go through the Structure*

1 `index file`:
is the main file for running the application includes DB connection, express configurations and cloudinary connect
2. `config folder`:
   contains file related to DB and app
3. `controllers folder`:
   contains all handly controllers
4. `environment variables`:
   maintaining the variables
5. `middlewares`:
6. `passport`:
   containes passport middlewares for `facebook`,  `Google` and `Github`
7. `routes`:
   defines all routes
8. `utils`:
   included all utilities
9. `views`:
   dynamic html pages
10. `constantjs`
    have constant vals
11. `swagger.yaml`
    Responsible for ui swagger docs for TshirtStore.



> *Following dependencies used for building backend*
- axios
- bcryptjs
- cloudinary
- cookie-parser
- cors
- dotenv
- ejs
- express
- express-fileupload
- express-session
- jsonwebtoken
- jwt-decode
- mongoose
- morgan
- nodemailer
- passport
- passport-facebook
- passport-github2
- passport-google-oauth20
- razorpay
- stripe
- swagger-themes
- swagger-ui-express
- validator
- yaml.js

For DEV dependencies
- nodemon

> *how to use it?*


Visit `https://store-hhy8.onrender.com/`, to reads docs go to `click to see Docs` and futhermore to clone project go to 'click to get Github repo' buttons.

while reading docs you will comes to knows about different routes and thier usage.


> *Running locally on machine (LocalHost)*

Setup application domain to `locahost:port` port running on your computer

Do other configurations like
- google oAuth, facebook oAuth, github oAuth according to your convenience
- SMTP mail ie. mailtrap account
- set environment variables according to your account credentials.


Steps to get locally:
- Create a empty directory
- do clone from `https://github.com/AryanTapre/tshirtstore.git` onto that directory
- or visit: `https://github.com/AryanTapre/tshirtstore`


> *Let's talk about Authentication, Authorization and Resource Server*

- Here,Authentication and Authorization is implemented using middlewares, specify control handler are also avaliable

- Authentication is defined in three ways of oAuth
    - Google
    - Facebook and
    - Github

- Domain `https://store-hhy8.onrender.com/` is being registered there to get in work.

- Authorization, a function is defined on middleware to verify the user's role.

- Resource Server, cloudinary is used to manage image assets and mongoDB to store datas.


> *OAuth*

- On `Google`, `Facebook` and `Github` developers site domain is registered
- Using serializtion and de-serializtion session are managed for oAuth.
- Generally, getting `email`,`profile` and `displayName` of user


> *Important for *Admin* user *

Here admin need to get registered onto Database manually, either via `UI` or `CLI`


> *Utilities created for development*
- Error utility
- Email utility
- Cookie utility
- Pagination, Search utility

For search here is the class.

```Javascript
const WhereClause = class {
   #base;
   #bigQuery;

   constructor(base,bigQuery) {
       this.#base = base;
       this.#bigQuery = bigQuery
   }
```


> *Using EJS dynamically serves html pages*

Created ejs for
- checkout.ejs
- home.ejs
- login.ejs
- singup.ejs


> *Data Models*

Data models is made for three
- User
- product
- Order

Pre-Hooks attached for User.modal is `save`

Below are method used in user.model
- isValidatePassword()
- generateAccessToken()
- generateRefreshToken()
- getForgetPasswordToken()


> *Taking discussion towards Middlewares*

1. `isGoogleAuthenticate`: indicates whether user is already authenicated with Google?


2. `userMiddleware`: verify user is authorize


3. `customRole`: for selecting the user Roles..


> *Taking discussion towards Controllers*

- home controller
- order controller
- payment controller
```javascript
const captureStripePayment = async (request,response,next) => {
    const paymentIntent = await stripe.paymentIntents.create({
        amount: request.body.amount,
        currency: 'inr',

        //optionals, but in use
        metadata: {integration_check: 'accept_a_payment'}
    })

    response.status(200).json({
        success: true,
        amount:request.body.amount,
        paymentIntent: paymentIntent
    })
}

```
```java
const captureRazorpayPayment = async (request,response,next) => {
    const instance = new Razorpay({ key_id: process.env.RAZORPAY_API_KEY, key_secret: process.env.RAZORPAY_SECRET_KEY })

    const orderOptions = {
        amount: request.body.amount,
        currency: "INR",
    }

    const myOrder = await instance.orders.create(orderOptions);

    response.status(201).json({
        success: true,
        amount:request.body.amount,
        order: myOrder
    })
}
```

- product controller
- user controller



