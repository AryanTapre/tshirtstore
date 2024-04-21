const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true,'name is mandatory'],
        maxLength: [40,'name should be under 40 characters']
    },
    email: {
        type: String,
        required: [true,'email is mandatory'],
        validate: [validator.isEmail,'email should be in right format'],
        unique: true  // indexing placed here..!
    },
    password: {
        type: String,
        select: false,
        minLength: [6,'password should be atleast 6 characters']
    },
    photo: {
        id: {
            type: String,
           
        },
        secure_url: {
            type: String,
        }
    },
    role: {
        type: String,
        default: 'user'
    },
    forgetPasswordToken:String,

    forgetPasswordExpiry: Date,

    createdAt: {
        type: Date,
        default: Date.now
    },

    refreshToken: {
        token: {
            type: String
        },
        revoke :{
            type: Boolean,
            default : false
        }
    }   
})

//FIXME: pre-hooks 
//Encrypting the password before Save
userSchema.pre('save',async function(next) {
    if(!this.isModified('password')) {
        return next();
    }
    this.password = await bcrypt.hash(this.password,10);
})

//TODO: Appending methods to document

//validate the password - compare that is stored in DB
userSchema.methods.isValidatePassword = async function(userPassword) {
    return await bcrypt.compare(userPassword,this.password);
}

//generating jwt token
// userSchema.methods.getJwtToken = function() {    
//     return jwt.sign({id: this._id},process.env.JWT_SECRET_KEY,{
//         expiresIn: process.env.JWT_SECRET_EXPIRY
//     })
// }

userSchema.methods.generateAccessToken =  function () {
    return  jwt.sign(
        {id: this._id},
        process.env.JWT_SECRET_KEY,
        {
            expiresIn: process.env.JWT_SECRET_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken =   function () {
    /* TODO: About refresh tokens..
        return un-encrypted refreshToken to client Application
        Store encrypted version onto DB

        When client application request for a token refresh to sustain integrity
        we will again encrypt the user sended refresh-token
        and match with the on stored on our DB
        if match successful,then refresh token is valid
    * */

    const refreshToken =  crypto.randomBytes(20).toString("hex");
    this.refreshToken.token =  crypto
        .createHash("sha256")
        .update(refreshToken)
        .digest("hex");

    return  jwt.sign(
        {
            id: this._id,
            refreshToken
        },
        process.env.JWT_SECRET_KEY,
        {
            expiresIn: process.env.JWT_SECRET_EXPIRY
        }
    )

}


//forget password string generation
userSchema.methods.getForgetPasswordToken = function() {
    const forgetToken = crypto.randomBytes(20).toString("hex");

    this.forgetPasswordToken = crypto
    .createHash("sha256")
    .update(forgetToken)
    .digest("hex");

    this.forgetPasswordExpiry = Date.now() + 20 * 60 * 1000;

    return forgetToken;
}



//Exporting model
module.exports = mongoose.model("User",userSchema);