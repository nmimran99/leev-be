import User from '../models/user';
import Joi from '@hapi/joi';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import jwt_decode from 'jwt-decode';
import path from 'path';
import fs from 'fs';
import { generateAccessToken, authenticate, genereateResetPasswordUrl } from './auth.service';
import { sendMail } from '../smtp/mail';

const valSchema = Joi.object({
    email: Joi.string().min(6).required().email(),
    password: Joi.string().min(8).required(),
    firstName: Joi.string(),
    lastName: Joi.string(),
    phoneNumber: Joi.string(),
    birthDate: Joi.date().max("now"),
    createdBy: Joi.string()
});

export const registerUser = async (req) => {
    const validation  = valSchema.validate(req.body);

    if (validation.error) {
        return validation;
    }

    let errors =  await checkUnique(req);
    if( errors.email ) {
        return errors;
    };


    let salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
  
    let user = new User({
        email: req.body.email,
        password: hashedPassword,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        phoneNumber: req.body.phoneNumber,
        birthDate: req.body.birthDate,
        createdBy: req.body.createdBy,
        // avatar: {
        //     data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)),
        //     contentType: req.file.contentType
        // }
    });

    return await user.save();

};


export const uploadAvatar = async (req) => {
    return true
}

export const checkUnique = async (req) => {
    let errors = { email };
    const email = await User.findOne({ email: req.body.email });

    if (email) {
        errors.email = {
            message: 'This email is already in use'
        }
    };

    return errors;
};

export const loginUser = async (req) => {
    const res = await authenticate(req);
    if (!res) return false;
    return {
        auth: true,
        user: res.user,
        message: 'Logged in successfully',
        token: res.token
    }
}

export const reloginUser = async (req) => {
    
    var token = req.body.token;
    if (!token) return { auth: false, message: "No token provided." };
    let decodedToken
    try {
        decodedToken = await jwt_decode(token);
    } catch(e) {
        return { auth: false, message: "could not decode token", user: null, token: null}
    };
    const user = await User.findOne({ _id: decodedToken.id }, '_id username firstName lastName email');
    return jwt.verify(token, process.env.JWT_SECRET, async (err) => {
        if (!user) return { auth: false, message: 'user token not linked to a user', user: null, token: null};
        if (err) {
            if (err.message === "invalid token") {
                return { auth: false, message: "Invalid token", user: null, token: null };
            }
            const currentTime = new Date() / 1000
            const timeDifference = currentTime - decodedToken.exp
            const refreshToken = req.body.refreshToken
            const refreshTokenHash = await bcrypt.compare(refreshToken, decodedToken.refreshTokenHash)
            
            if (err.message === "jwt expired" && timeDifference < 86400 && refreshTokenHash) {
                const newToken = await generateAccessToken(decodedToken.id);
                return {
                    auth: true, 
                    user: user, 
                    message: "Refreshed token sent", 
                    token: newToken
                };
            } 
            return { auth: false, message: "Failed to authenticate token.", user: null, token: null };
        }
        return { auth: true, user, message: "User authenticated successfully", user, token: req.body };   
    });
}

export const deleteUser = async (req) => {
    const { userId } = req.body.user;
    const res = await User.findByIdAndDelete({ _id: userId });
    if (res) return true;
    return false;
}

export const resetPasswordLink = async (req) => {
    const { email } = req.body;
    let user = await User.findOne({ email });
    if (user) {
        let url = await genereateResetPasswordUrl(user._id);
        let res =  await sendMail({
            to: email,
            subject: 'WorkBanter - Password reset',
            text: `Please go to the following link to reset you password:\n ${url}`
        });
        if (res.isError) {
            return res.error
        }
        return res.data;
    };
    return {
        message: 'Failed to retrive user'
    }
}

export const setNewPassword = async (req) => {
    const { userId, password } = req.body;
    let user = User.findOne({ _id: userId });
    
    let salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt); 
    return await User.findOneAndUpdate(userId, { password: hashedPassword }, {
        new: true
    }); 
}

export const authorizeSetNewPassword = async (req) => {
    const { token } = req.body;
    return jwt.verify(token, process.env.JWT_SECRET, async (err) => {
        let decodedToken;
        try {
            decodedToken = await jwt_decode(token);
            if (!decodedToken) throw 'failed to decode';
        } catch(e) {
            return { message: 'could not decode token' }
        };
        if (err) {
            if(err.message === "jwt expired") {
                return {
                    message: 'Password reset request time fream has expired'
                }
            }
        }
        let userId = decodedToken.id;
        return {
            userId
        }
    });
}


export const getUserList = async (req) => {
    return User.find({}, '_id firstName lastName phoneNumber avatar');
}

export const getUserData = async (req) => { 
    return await User.find({ _id: req.body.userId }, '_id firstName lastName phoneNumber avatar');
}

export const getUserDataById = async (req) => { 
    return await User.findById(req.body.userId , '_id firstName lastName phoneNumber avatar');
}
