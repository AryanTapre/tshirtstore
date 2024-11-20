
const bigPromise = require('../middlewares/bigPromise');
const User = require('../models/User');
const CustomError = require('../utils/CustomError');
const setAccessRefreshTokens = require('../utils/UserCookieToken');
const cloudinary = require('cloudinary');
const mailHelper = require('../utils/EmailHelper');
const crypto = require('crypto');
const passport = require('passport');
const jwt = require('jsonwebtoken');

const deleteUserData = (request,response,_) => {
    response
        .status(200)
        .send("<h3>Represents how to Delete User's Data</h3>")
        .json({
        success: true,
        message: "represents how to delete data"
    })
}

const googleLogin = (request,response,_) => {
    response.send("login with Google");
    console.log("inside Google Login router....");
}

const facebookLogin = (request,response,_) => {
    response.send("Facebook login here")
}

const githubLogin = (request,response,_) => {
    response.send("Github login here...");
}


const googleCallbackHandler = (request,response,_) => {
    console.log("inside google callback handler");
    console.log("Google session is : ",request.session);
    // request.session.emailID = request.session.passport.user.email;
    //
    // response.send(request.session);
    //request.session.passport.user
    setAccessRefreshTokens(request.session.passport.user,response)
        .then(function (response) {
            console.log(`promise googlecallbackHandler is : ${response}`);
        })
}

const facebookCallbackHandler = (request,response,_) => {
    console.log("Facebook session is : ",request.session);
    // request.session.emailID = request.session.passport.user.email;
    // response.send(request.session);
    setAccessRefreshTokens(request.session.passport.user,response)
}

const githubCallbackHandler = (request,response,_) => {
    console.log("github session : ",request.session);
    setAccessRefreshTokens(request.session.passport.user,response)
}

const regenerateAccessRefreshTokens = async (request,response) => {
    const incomingRefreshToken =
        request.cookies.refreshToken ||
        request.header("RefreshToken").replace("Bearer ","") ||
        request.body.refreshToken

    if(!incomingRefreshToken) {
        response
            .status(401)
            .json({
                success:false,
                message:new CustomError("refresh token not found","refresh token not found",401)
            })
    }

    const decode = jwt.verify(incomingRefreshToken,process.env.JWT_SECRET_KEY)
    const user = await User.findOne({_id:decode.id});
    if(!user) {
        response
            .status(401)
            .json({
                success:false,
                message:new CustomError("userID does not exists","userID does not exists",401)
            })
    }

    const decodedRefreshToken =
        crypto
            .createHash("sha256")
            .update(decode.refreshToken)
            .digest("hex")
    if(decodedRefreshToken === user.refreshToken.token) {
        setAccessRefreshTokens(user,response)
            .then(async (response) => {
                console.log( response.req.cookies);
                user.refreshToken.token = response.req.cookies.refreshToken;
                await user.save({validateBeforeSave:false})
            })

    } else {
        response
            .status(401)
            .json({
                success:false,
                message:new CustomError("Refresh token is exprired, renew it","Refresh token is exprired, renew it",401)
            })
    }
}
const signupOperations =  async (request,response,next) => {

    let cloudinaryResult;

    if(request.files) {
        const userPhoto = request.files.userphoto;
        const options = {
            folder: "Users",
            crop:"scale"    
        }
      cloudinaryResult = await cloudinary.v2.uploader.upload(userPhoto.tempFilePath,options);
    }

    const {name, email, password} = request.body;

    if(!(name && email && password)) {
        return next(new CustomError("name,email & password are required!","not available these fields",400) )
    }
    else {
        const user = await User.create({
            name, 
            email, 
            password,
            photo: {
                id: cloudinaryResult.public_id,
                secure_url: cloudinaryResult.secure_url
            }
        });

        await setAccessRefreshTokens(user, response)
    }
  
}

const loginOperations = async(request,response,next) => {

    const {email,password} = request.body;

    if(!(email && password)) {
        return next(new CustomError("email and password are missing","email and password are missing","401"));
    }

    const user = await User.findOne({email}).select("+password");

    if(!(user)) {
        return next(new CustomError("user does not exist","not registered","401"));
    }
    else {
        const result = await user.isValidatePassword(password);

        if(!result) {
            return next(new CustomError("Invalidate password","not correct password","401"));
        } 
        else {
            // Everything is correct up-till now!.
             setAccessRefreshTokens(user, response);
        }
    }
}


const logoutOperation = async (request,response,_) => {
    // response.cookie("token",null,{
    //     expires: new Date(Date.now()),
    //     httpOnly: true,
    //     secure : true
    // })
    // response.status(200).json({
    //     "success": true,
    //     "msg": "logout successful"
    // })
    const options = {
        httpOnly:true,
        secure: true,
        expires: new Date(Date.now())
    }
   try{
       const userID = request.userID;
       await User.findOneAndUpdate({_id: userID},{
           refreshToken:{
               token: undefined}});
       response
           .status(200)
           .clearCookie("accessToken")
           .clearCookie("refreshToken")
           .json({
               "success": true,
               "msg": "logout successful"
           })
   } catch (error) {
        response.status(500).json({
            success:false,
            message: "unable to logout the user"
        })
   }
}

const forgetPasswordOperation = async (request,response,next) => {
    const {email} = request.body;
    const user = await User.findOne({email});
    console.log(`user data: ${user}`);

    if (!user) {
        return next(new CustomError("email does not exists","incorrect email",500));
    }

    const forgetToken = user.getForgetPasswordToken(); // generating forget token
    await user.save({validateBeforeSave: false}) // saving to the databaseMedia....

    
    const forgetPasswordURL = `${request.protocol}://${request.get("host")}/api/v1/password/reset/${forgetToken}`;

    const message = `paste the above link to any browser address bar \n\n link:${forgetPasswordURL}`;

    try {
        await mailHelper({
            email: user.email,
            subject: "password reset email for T-shirt Store 😁",
            message
        })

    } catch (error) {
        user.forgetPasswordToken = undefined
        user.forgetPasswordExpiry= undefined;
        await user.save({validateBeforeSave: false});
        return next(new CustomError("failed to sent email","failed to sent email",500));
    }
    
    response.status(200).send("email sended successfully").json({
        success: true,
        mailStatus: "fulfilled"
    })
}

const passwordReset = async(request,response,next) => {
    const token = request.params.token;
    const {password,confirmPassword} = request.body;

    const forgetPasswordToken = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex")
    
    
    const user = await User.findOne({
        forgetPasswordToken,
        forgetPasswordExpiry: {$gt: Date.now()}
    })

    if(!user) {
        return next(new CustomError("invalid or expired token","invalid or expired token",500));
    } else {

        if(password !== confirmPassword) {
            return next(new CustomError("password and confirm password does not Match!","password and confirm password does not Match!",500));

        }else {

            user.password = password;
            user.forgetPasswordToken = undefined;
            user.forgetPasswordExpiry = undefined;
            await user.save();

            response.status(201).send("password updated Successfully, You can login").json({
                success: true,
                message: "password updated Successfully, You can login now"
            })

        }
    }
}

const userDashboard = async (request,response,_) => {
    const user = await User.findById(request.userID);
    const data = new Object({
        username: user.name,
        photo: user.photo.secure_url
    })

    response.status(200).json(data);
}

const changePassword = async (request,response,next) => {

    const user = await User.findById(request.userID).select("+password");
    const oldPassword = request.body.oldPassword;
    const newPassword = request.body.newPassword;

    if(!(oldPassword && newPassword)) {
        return next(new CustomError("oldpassword and new password are Required fields","oldpassword and new password are Required fields",500));
    }

    if(oldPassword === newPassword) {
        return next(new CustomError("old and New Password can't be Same","old and New Password can't be Same",500));
    }

    const status = await user.isValidatePassword(oldPassword)
    if(!status) {
        return next(new CustomError("old password is incorrect","old password is incorrect",500));
    }

    //update Old password with a New one
    try{
        user.password = newPassword;
        await user.save();
    } catch (error) {
        response.status(400).json({
            success:false,
            message: "failed to update password!"
        })
    }
    response
        .staus(201)
        .json({
            success:true,
            message:"new password updated!"
        })
}

const selectDataToUpdate = (...data) => {

    let values = [];
    for(let n of data) {
        if(n.data) {
            values.push(n.type);
        }
    }
    return values;
}
    


const updateUser = async (request,response,next) => {
    // we are updating Name,Email and Photo

    const data = [
        {
            type: "name",
            data:request.body.name
        },
        {   type: "email",
            data: request.body.email
        },
        {   type: "photo",
            data: request.files?request.files.photo:undefined
        }
    ]


    const selectedData = selectDataToUpdate(...data);
    console.log(selectedData)
    let updateUserData = {};

    for(const d of selectedData) {
        switch (d) {
            case 'name':
                updateUserData.name = request.body.name;
                console.log("one:",updateUserData);
                break;

            case 'email':
                updateUserData.email = request.body.email;
                console.log("two:",updateUserData);
                break;

            case 'photo':
                const updatePhoto = request.files.photo;
                const user = await User.findById(request.userID);
                const status = await cloudinary.v2.uploader.destroy(user.photo.id);
                if(!status) return next(new CustomError("failed to delete photo from Cloudinary","failed to delete photo from Cloudinary",500));

                const cloudinaryOptions = {
                    folder:"Users",
                    crop: "scale"
                }

                const cloudinaryResult = await cloudinary.v2.uploader.upload(updatePhoto.tempFilePath,cloudinaryOptions);
                if(cloudinaryResult) {
                    updateUserData.photo = {
                        id:cloudinaryResult.public_id,
                        secure_url: cloudinaryResult.secure_url
                    }
                }

                break;

            default:
                break;

        }
    }

    console.log("four:",updateUserData);

    let updatedData;
    try{
        updatedData = await User.findOneAndUpdate({_id: request.userID},updateUserData,{
            new: true,
            runValidators: true
        })

    }catch (error) {
        console.log("error while updating data on databaseMedia server:",new CustomError(error,error,500));
        return response.status(501).json({
            success: false,message:"error while updating data on databaseMedia server"
        })
    }

    response.status(201).json({
        success: true,
        message: "data Updated successfully",
        updatedData
    })

}

const adminAllUsers = async (request,response,_) => {
    const users = await User.find({    // Selects all the documents except the "admin"
        role: {
            $ne:"admin"
        }});

    if(!users) {
        return response.status(500).send("no user exists").json({
            success: false,
            message: "no user exists"})
    }

    response.status(201).json({
        success: true,
        users
    })
}

//TODO: FETCH ALL DOCUMENTS EXCEPT ADMIN & MANAGER
const managerAllUsers = async (request,response,_) => {
    const user = await User.find({role:{$nin:["admin","manager"]}});
    if(!user) {
        return response.status(500).send("no user exists").json({
            success: false,
            message: "no user exists"
        })
    }

    response.status(201).json({
        success: true,
        user
    })
}

const adminGetUser = async (request,response,next) => {
    const user = await User.findById(request.params.id);
    if(!user) {
        console.log("invalid user ID")
        return next(response.status(401).json({
            message: "invalid user ID",
            error: new CustomError("invalid user id","invalid user id",400)
        }));
    }

    response.status(200).json({
        success: true,
        user
    })
}

//TODO: WE CHANGING ROLE OF USER ONLY FROM ADMIN SIDE....
const adminUpdateUser = async (request,response,next) => {
    const newRole = "clerk"; // admin will select from control panel
    const data = {
        role: newRole
    }
    let updatedData;

    try {
        updatedData = await User.findOneAndUpdate({_id: request.params.id},data,{
            new: true,
            runValidators: true})
    }
    catch (error) {
        console.log("error while updating data on databaseMedia server:",new CustomError(error,error,500));
         return next(response.status(501).json({
             success: false,error: new CustomError("error while updating data on databaseMedia server","error while updating data on databaseMedia server",401)
         }))
    }

    response.status(201).json({
        success: true,
        message: "data updated Successfully",
        updatedData
    })
}

const adminDeleteUser = async (request,response,next) => {
    const userID = request.params.id;

    if(!userID) {
        console.log(new CustomError("userid is not available","userid is not avaliable",401));
        return next(response.status(401).json({
            status: false,
            message: "userid is not available"}))

    } else {
        const user = await User.findById(userID);
        if(!user) {
            console.log(new CustomError("user does not Exists!","user does not Exists!",500));
            return next(response.status(500).json({
                success: false,
                error: new CustomError("user does not Exists!","user does not Exists!",500)}))
        }

        if(user.photo.id) {
            const cloudinaryStatus = await cloudinary.v2.uploader.destroy(user.photo.id);
            if(!cloudinaryStatus) {
                console.log(new CustomError("failed to delete photo from Cloudinary!","failed to delete photo from Cloudinary!",500));
                return next(response.status(500).json({
                    success: false,
                    message: new CustomError("failed to delete photo from Cloudinary!","failed to delete photo from Cloudinary!",500)}))
            }
        }

        let userDeleted;
        try{
            userDeleted = await User.findOneAndDelete(userID,{
                new:true,
                runValidators: true})
        }
        catch (error) {
            console.log(new CustomError(`error while deleting user: ${error}`,`error while deleting user: ${error}`,501));
            return next(response.status(500).json({
                success: false,
                message: new CustomError(`error while deleting user: ${error}`,`error while deleting user: ${error}`,501)
            }))
        }

        response.status(200).json({
            success: true,
            message:"user deleted successfully",
            userDeleted
        })
    }
}

exports.githubCallbackHandler = bigPromise(githubCallbackHandler);
exports.googleCallbackHandler = bigPromise(googleCallbackHandler);
exports.facebookCallbackHandler = bigPromise(facebookCallbackHandler);
exports.facebookLogin = bigPromise(facebookLogin);
exports.googleLogin = bigPromise(googleLogin);
exports.githubLogin = bigPromise(githubLogin);

exports.adminDeleteUser = bigPromise(adminDeleteUser);
exports.adminUpdateUser = bigPromise(adminUpdateUser);
exports.adminGetUser = bigPromise(adminGetUser);
exports.adminAllUsers = bigPromise(adminAllUsers);
exports.updateUser = bigPromise(updateUser);
exports.passwordReset = bigPromise(passwordReset);
exports.forgetPassword = bigPromise(forgetPasswordOperation);
exports.signup = bigPromise(signupOperations);
exports.login = bigPromise(loginOperations);
exports.logout = bigPromise(logoutOperation);
exports.userDashboard = bigPromise(userDashboard);
exports.changePassword = bigPromise(changePassword);
exports.managerAllUsers = bigPromise(managerAllUsers);
exports.regenerateAccessRefreshTokens = bigPromise(regenerateAccessRefreshTokens)
exports.deleteUserData = bigPromise(deleteUserData);
