const facebookPassport = require('passport');
const User = require("../models/User");
const facebookStrategy = require('passport-facebook').Strategy;


facebookPassport.serializeUser((user, done) => {
    console.log("serialize user in SESSION :");
    done(null,user)
})
facebookPassport.deserializeUser(async (user, done) => {
    console.log("de-serialize user in")
    await User.findById(user._id,(err,user) => {
        done(err,user);
    })
})

facebookPassport.use(new facebookStrategy(
    {
        clientID : process.env.FACEBOOK_APP_ID,
        clientSecret : process.env.FACEBOOK_APP_SECRET,
        callbackURL : process.env.FACEBOOK_CALLBACK_URL,
        profileFields: ['photos','email','displayName','name']
    },
    async (accessToken,refreshToken,profile,next) => {
        console.log("facebook profile: ",profile);

        await User.findOne({email: profile.emails[0].value})
            .then(async (user) => {
                if(user) {
                    console.log("User already Exist: ",user);
                    next(null,user);

                } else {
                    await User.create({
                        name : profile.displayName,
                        email : profile.emails[0].value})
                        .then((user) => {
                            console.log("New User:",user);
                            next(null,user);
                        })
                        .catch((error) => {
                            console.log(error);
                            next(error);
                        })
                }
            })
    }
))