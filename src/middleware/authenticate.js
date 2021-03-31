import jwt from 'jsonwebtoken';
import jwt_decode from 'jwt-decode';
import User from '../models/user';

export const authenticate = async (req, res, next) => {
    let { token } = req.headers;
    if (!token) {
        return res.status(403).send({ auth: false, message: "No token provided." });
    }
    token = JSON.parse(token).token;
    jwt.verify(token, process.env.JWT_SECRET, async (err) => {
        let decodedToken;
        try {
            decodedToken = await jwt_decode(token);
            if (!decodedToken) throw 'failed to decode';
        } catch(e) {
            return res.status(303).send('failed to authenticate user')
        };
        if (err) {
            if(err.message === "jwt expired") {
                return res.status(304).send({ auth: false, message: "Failed to Authenticate" });
            }
        }
        req.user = await User.findOne({ _id: decodedToken.id });
        next();
    });
}