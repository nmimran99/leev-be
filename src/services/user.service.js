import User from '../models/user';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import jwt_decode from 'jwt-decode';
import fs from 'fs';
import path from 'path';
import { generateAccessToken, authenticate, genereateResetPasswordUrl } from './auth.service';
import { sendMail } from '../smtp/mail';
import { relocateFile } from '../api/generic';


export const registerUser = async (req) => {

    let errors =  await checkUnique(req);
    if( errors.email ) {
        return errors;
    };
    
    let salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    let user = new User({
        tenant: req.body.tenantId,
        email: req.body.email,
        password: hashedPassword,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        phoneNumber: req.body.phoneNumber,
        birthDate: req.body.birthDate,
        createdBy: req.body.createdBy,
        avatar: req.file.filename,
        role: req.body.role
    });

    let savedUser = await user.save();
    let newURL = await relocateFile(savedUser.avatar, savedUser._id, 'users');
    savedUser.avatar = newURL;
    return await savedUser.save();

};

export const updateUserRole = async (req) => {
    const { _id: lastUpdatedBy } = req.user;
    const { user, role } = req.body;
    return await User.findOneAndUpdate({ _id: user}, { role, lastUpdatedBy }, { useFindAndModify: false, new: true})
}

export const uploadAvatar = async (req) => {
    const { userId } = req.body;
    if (!req.file) return;
    const user = await User.findOne({_id: userId}, 'avatar');
    if (!user) return;
    
    if (user.avatar) {
        let oldAvatar = user.avatar.replace(process.env.BACKEND_URL, process.env.FS_LOCAL);
        if (fs.existsSync(oldAvatar)) {
            fs.unlinkSync(oldAvatar);
        }
    }
    
    let newAvatar = req.file.filename;
    let newURL = await relocateFile(newAvatar, userId, 'users');
    return await User.findOneAndUpdate({ _id: userId }, { avatar: newURL},{ new: true });
}

export const removeAvatar = async (req) => {
    const { userId } = req.body;
    if (!userId) return;
    const user = await User.findOne({ _id: userId });
    if (!user) return;
    
    if (user.avatar) {
        let oldAvatar = user.avatar.replace(process.env.BACKEND_URL, process.env.FS_LOCAL);
        if (fs.existsSync(oldAvatar)) {
            fs.unlinkSync(oldAvatar);
        }
    }
    return await User.findOneAndUpdate({ _id: userId }, { avatar: null},{ new: true });
}

export const disableUser = async (req) => {
    const { userId } = req.body;
    return await User.findOneAndUpdate({ _id: userId}, { isActive: false});
}


export const enableUser = async (req) => {
    const { userId } = req.body;
    return await User.findOneAndUpdate({ _id: userId}, { isActive: true});
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
    const user = await User.findOne({ _id: decodedToken.id }, '_id username firstName lastName email avatar tenant role').populate('role');
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
    const { userId } = req.body;
    let userFolder = `${process.env.FS_LOCAL}/users/${userId}`
    if (fs.existsSync(userFolder)) {
        fs.rmdirSync(userFolder, { recursive: true});
    }
    return await User.findOneAndDelete({ _id: userId });
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

export const extractuserId = async (token) => {
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
        return userId;
    });
}


export const getUserList = async (req) => {
    return User.find({}, '_id firstName lastName phoneNumber avatar role').populate('role');
}

export const getUsersData = async (req) => { 
    const { userList } = req.body;
    return await User.find({ _id: { $in: userList}}, '_id firstName lastName phoneNumber avatar role').populate('role');
}

export const getUserDataById = async (req) => { 
    return await User.findById(req.body.userId , '_id firstName lastName phoneNumber avatar role').populate('role');
}

