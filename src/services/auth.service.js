import jwt from 'jsonwebtoken';
import User from '../models/user';
import bcrypt from 'bcryptjs';
import randtoken from 'rand-token'

export const authenticate = async (req) => {
    const user = await User.findOne({ username: req.body.username });
    if (!user) return; 

    const isPassValid = await bcrypt.compare(req.body.password, user.password);
    if (!isPassValid) { return };
    const token = await generateAccessToken(user._id);
    
    return {
        user: {
            _id: user._id,
            username: user.username,
            email: user.email,
            firstname: user.firstName,
            lastname: user.lastName
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
            expiresIn: '10s'
        });        
        resolve(`http://${process.env.FRONTEND_ADDRESS}:${process.env.FRONTEND_PORT}/users/passwordreset/${token}`);
    }); 
}




