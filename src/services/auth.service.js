import jwt from 'jsonwebtoken';
import User from '../models/user';
import bcrypt from 'bcryptjs';
import randtoken from 'rand-token'

export const authenticate = async (req) => {
    let { email } = req.body;
    if (email) {
        email = email.toLowerCase();
    }
    const user = await User.findOne({ email });
    if (!user) return; 

    const isPassValid = await bcrypt.compare(req.body.password, user.password);
    if (!isPassValid) { return };
    const token = await generateAccessToken(user._id);
    
    return {
        user: {
            tenant: user.tenant,
            _id: user._id,
            email: user.email,
            firstname: user.firstName,
            lastname: user.lastName,
            lang: user.lang,
            data: user.data
        },
        token
    }
}


export const generateAccessToken = async (userId) => {
    const refreshToken = randtoken.uid(256) 
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10)
    const payload = {
        id: userId,
        time: new Date(),
        refreshTokenHash: refreshTokenHash
    };
    var token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: '6h'
    });
    return {token , refreshToken};
}

export const genereateResetPasswordUrl = (userId) => {
    return new Promise ((resolve, reject) => {
        if (!userId) {
            reject('User ID was not supplied');
        }
        const payload = {
            id: userId
        };
        var token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: '5m'
        });        
        resolve(`${process.env.FRONTEND_URL}/reset/${token}`);
    }); 
}

export const signPayload = async (payload) => {
    var token = jwt.sign(payload, process.env.JWT_SECRET);
    return token;
}


