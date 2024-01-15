//importing middlewares
const {userMiddleware,customRole,isGoogleAuthenticate} = require('../middlewares/user');
const {googleAuthenticate,facebookAuthenticate,githubAuthentication} = require('../middlewares/passport')
const passport = require('passport');


const express = require('express');
const loginRouter = express.Router();
const signupRouter = express.Router();
const logoutRouter = express.Router();
const forgetPasswordRouter = express.Router();
const passwordResetRouter = express.Router();
const dashboardRouter = express.Router();
const changePasswordRouter = express.Router();
const userUpdateRouter = express.Router();
const adminAllUserRouter = express.Router();
const managerAllUserRouter = express.Router();
const adminUserRouter = express.Router();
const googleLoginRouter = express.Router();
const facebookLoginRouter = express.Router();
const googleCallbackHandlerRouter = express.Router();
const facebookCallbackHandlerRouter = express.Router();
const githubLoginRouter = express.Router();
const githubCallbackHandlerRouter = express.Router();
const regenerateAccessRefreshTokenRouter = express.Router();
const deleteUserDataRouter = express.Router();

const {
    logout,
    login,
    signup,
    forgetPassword,
    passwordReset,
    userDashboard,
    changePassword,
    updateUser,
    adminAllUsers,
    managerAllUsers,
    adminGetUser,
    adminUpdateUser,
    adminDeleteUser,
    googleLogin,
    facebookLogin,
    googleCallbackHandler,
    facebookCallbackHandler,
    githubLogin,
    githubCallbackHandler,
    regenerateAccessRefreshTokens,
    deleteUserData
} = require('../controllers/userController');

// TODO: login routes
loginRouter.route("/login").post(login); //🆗
deleteUserDataRouter.route("/users/delete-data").get(deleteUserData);

googleLoginRouter.route("/login/auth/google").get(googleAuthenticate,googleLogin);
googleCallbackHandlerRouter.route("/auth/google/callback").get(passport.authenticate('google'),googleCallbackHandler);

facebookLoginRouter.route("/login/auth/facebook").get(facebookAuthenticate,facebookLogin);
facebookCallbackHandlerRouter.route("/auth/facebook/callback").get(passport.authenticate('facebook'),facebookCallbackHandler)

githubLoginRouter.route("/login/auth/github").get(githubAuthentication,githubLogin);
githubCallbackHandlerRouter.route("/auth/github/callback").get(passport.authenticate('github'),githubCallbackHandler);

signupRouter.route("/signup").post(signup); // 🆗
logoutRouter.route("/logout").get(userMiddleware,logout); // 🆗🆗
regenerateAccessRefreshTokenRouter.route("/refresh-token").post(regenerateAccessRefreshTokens); // 🆗

forgetPasswordRouter.route("/forgetpassword").post(forgetPassword); // 🆗
passwordResetRouter.route("/password/reset/:token").post(passwordReset); // 🆗

dashboardRouter.route("/dashboard").get(userMiddleware,userDashboard); // 🆗
changePasswordRouter.route("/password/update").post(userMiddleware,changePassword); // 🆗
userUpdateRouter.route("/dashboard/update").post(userMiddleware,updateUser); // 🆗

//admin only route
adminAllUserRouter.route("/admin/users").get(userMiddleware,customRole('admin'),adminAllUsers); // 🆗

//Manager only Route
managerAllUserRouter.route("/manager/users").get(userMiddleware,customRole('manager'),managerAllUsers); // 🆗


adminUserRouter.route("/admin/user/:id")
    .get(userMiddleware,customRole('admin'),adminGetUser)    // admin getting detail of Single User
    .put(userMiddleware,customRole('admin'),adminUpdateUser) // admin updating user detail
    .delete(userMiddleware,customRole('admin'),adminDeleteUser); // admin delete a user



module.exports = {
    loginRouter,
    signupRouter,
    logoutRouter,
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
}