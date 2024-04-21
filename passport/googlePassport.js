const User = require('../models/User');
const googlePassport = require('passport');
const googleStrategy = require('passport-google-oauth20').Strategy;


googlePassport.serializeUser((user, done) => { // Serializing user json object into Session
    console.log("serialize user in SESSION :");
    done(null,user)
})

googlePassport.deserializeUser(async (user, done) => { // De-Serializing session back onto user's json object
    console.log("de-serialize user in")
    await User.findById(user._id,(err,user) => {
        done(err,user);
    })
})

googlePassport.use(new googleStrategy(
    {
        clientID : process.env.GOOGLE_OAUTH_CLIENT_ID,
        clientSecret : process.env.GOOGLE_OAUTH_CLIENT_SECRET,
        callbackURL : process.env.GOOGLE_CALLBACK_URL
    },
    async (accessToken, refreshToken, profile, next) => {
        console.log(`google profile : `,profile);

        await User.findOne({email: profile._json.email})
            .then(async (user) => {
                if(user) {
                    console.log("User already Exist: ",user);
                    next(null,user);

                } else {
                    await User.create({
                            name : profile.displayName,
                            email : profile._json.email})
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
