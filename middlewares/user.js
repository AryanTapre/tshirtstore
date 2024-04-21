const bigPromise = require('./bigPromise');
const customError = require('../utils/CustomError');
const jwt = require('jsonwebtoken');
const User  = require('../models/User');



exports.isGoogleAuthenticate = bigPromise((request,response,next) => {
    console.log("inside isGoogleAuthenticate...");
    const isSession = request.session.emailID ? request.session.emailID : undefined ;
    if(!isSession) {
        console.log("session not found:")
        response.redirect("/home")
    }
    console.log("session found!");
    next();
});

exports.userMiddleware = bigPromise(async (request,response,next) => {

    const token =
                  request.cookies.accessToken ||
                  request.header("Authorization").replace("Bearer ","") ||
                  request.body.accessToken;

    if(!token) {
        return next(new customError("you are not LoggedIn","you are not LoggedIn",500));
    } else {

        const decode = jwt.verify(token,process.env.JWT_SECRET_KEY);
        if(decode) {
            request.userID = decode.id;
        } else {
            return next(new customError("token expired login again","token expired login again",500));
        }
    }

   next();
})

exports.customRole = (...roles) => {
    return async(request,response,next) => {
        const user = await User.findById(request.userID);
        if(!user) {
            return next(new customError("user not Registered","user not Registered",500))
        }

        if(!(roles.includes(user.role))) {
            return next(new customError(`Access Denied,accessing from non ${roles[0]} account `,
                `Access Denied,accessing from non ${roles[0]} account `,500));
        }
        next();
    }
}