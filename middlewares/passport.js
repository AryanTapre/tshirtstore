
const passport = require('passport')

exports.googleAuthenticate = passport.authenticate('google',{
    scope: ["profile", "email"]
});

exports.facebookAuthenticate = passport.authenticate('facebook',{
    scope: ['email','public_profile']
});

exports.githubAuthentication = passport.authenticate('github',{
    scope: [['user:email']]
});


