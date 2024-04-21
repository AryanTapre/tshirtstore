const CustomError = require('../utils/CustomError');
// const cookieToken = (user,response) => {
//     const userToken = user.getJwtToken();
//
//     const options = {
//         expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
//         httpOnly: true,
//         secure: true
//     }
//
//     user.password = undefined;  //user.select("-password")
//     response.status(201).cookie('token',userToken,options).json({
//         success: true,
//         userToken,
//         user
//     })
// }
// module.exports = cookieToken;





const {reject} = require("nodemailer/.ncurc");
const setAccessRefreshTokens = async (user, response) => {
    try {
        const accessToken =  user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        await user.save({validateBeforeSave:false})

        //TODO: Validity period for ACCESS TOKEN = 3 days
        //TODO: Validity period for REFRESH TOKEN = 15 days

        const accessTokenOptions = {
            httpOnly: true,
            secure: true,
            expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
        }
        const refreshTokenOptions = {
            httpOnly: true,
            secure: true,
            expires: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
        }

        user.password = undefined;
        user.forgetPasswordToken = undefined;
        user.forgetPasswordExpiry = undefined;
        user.createdAt = undefined;
        user.refreshToken = undefined;

        console.log("in cookie token method!");
        return new Promise((resolve, reject) => {
            resolve(
                response
                    .status(200)
                    .cookie("accessToken",accessToken,accessTokenOptions)
                    .cookie("refreshToken",refreshToken,refreshTokenOptions)
                    .json({
                        success: true,
                        accessToken,
                        refreshToken,
                        user
                    })
            )
        })
    }
    catch (error) {
       return new CustomError(`unable to send cookie :${error}`,`unable to send cookie :${error}`,500);

    }
}
module.exports = setAccessRefreshTokens;