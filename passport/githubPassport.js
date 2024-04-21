const githubPassport = require('passport');
const githubStrategy = require('passport-github2').Strategy;
const User = require('../models/User');
const CustomError = require('../utils/CustomError');

githubPassport.serializeUser((user,done) => {
    console.log("serialize user in SESSION :");
    done(null,user)
})

githubPassport.deserializeUser(async (user,done) => {
    console.log("DE-serializing user from SESSION");
    await user.findById(user._id,(err,user) => {
        done(err,user);
    })
})

/*
* github profile data: {"id":"122979120",
* "nodeId":"U_kgDOB1SDMA",
* "displayName":"Aryan Sanjay  Tapre",
* "username":"AryanTapre",
* "profileUrl":"https://github.com/AryanTapre",
* "emails":[{"value":"taprearyan7@gmail.com"}],
* "photos":[{"value":"https://avatars.githubusercontent.com/u/122979120?v=4"}],
*
* */






githubPassport.use(new githubStrategy(
    {
        clientID:process.env.GITHUB_APP_CLIENT_ID,
        clientSecret:process.env.GITHUB_APP_CLIENT_SECRET,
        callbackURL:process.env.GITHUB_APP_CALLBACK_URL,
        profileFields: ['photos','email','displayName','name']
    },

     async (accessToken,refreshToken,profile,next) => {
        console.log(`github profile data: ${JSON.stringify(profile)}`);

        await User.findOne({email: profile.emails[0].value})
            .then(async (user) => {
                if(user) {
                    console.log("user already exist:",profile.displayName);
                    next(null,user);
                } else {
                    await User.create({
                            name: profile.displayName,
                            email: profile.emails[0].value,
                            photo: profile.photos[0].value})
                        .then((user) => {
                            console.log("New user Found!",user.name);
                            next(null,user);
                        })
                        .catch((error) => {
                            console.log("Unable to register NEW user error:",new CustomError(error,"not register",501));
                            next(error);
                        })
                }
            })

    }
))