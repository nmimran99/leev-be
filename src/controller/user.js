import * as userService from '../services/user.service';
import * as authService from '../services/auth.service';
import labels from '../assets/data/labels'

export const registerUser = async (req, res) => {
    try{
        let data = await userService.registerUser(req);
        if (data.error) {
            return res.status(400).send(data.error.details);
        }
        return res.status(200).send(data);
    } catch(e) {
        return res.status(500).send(e.message);
    }  
}

export const uploadAvatar = async (req, res) => {
    try{
        let data = await userService.uploadAvatar(req);
        return res.status(200).send(data);
    } catch(e) {
        return res.status(500).send(e.message);
    }  
}

export const loginUser = async (req, res) => {
    try{
        let data = await userService.loginUser(req);
        if (!data) {
            return res.status(401).json("Incorrect username or password");
        };
        if (data.auth) {
            return res
                .status(200)
                .header('auth-token', data.token.token)
                .header('refresh-token', data.token.refreshToken)
                .send(data);
        }       
    } catch(e) {
        return res.status(500).send(e.message);
    }  
}

export const reloginUser = async (req, res) => {
    try {
        let data = await userService.reloginUser(req);
        if (!data.auth) {
            return res.status(401).send(data.message);
        }
        return res
            .status(200)
            .send({ auth: data.auth, user: data.user, token: data.token, message: data.message});
    } catch(e) {
        return res.status(500).send(e.message);
    }
}

export const deleteUser = async (req, res) => {
    try {
        const deleteUser = await userService.deleteUser(req);
        if (deleteUser) {
            return res.status(200).send(`User ${ req.body.user.userId } was successfully deleted`);
        }
        return res.status(500).send('unable to delete user');
    } catch(e) {
        return res.status(500).send(e.message)
    }
}


export const resetPasswordLink = async (req, res) => {
    try {
        let data = await userService.resetPasswordLink(req);
        return res.status(200).send(data);
    } catch(e) {
        return res.status(500).send(e.message);
    }
}

export const setNewPassword = async (req, res) => {
    try {
        let data = await userService.setNewPassword(req);
        return res.status(200).send(data);
    } catch(e) {
        return res.status(500).send(e.message)
    }    
}

export const authorizeSetNewPassword = async (req, res) => {
    try {
        let data = await userService.authorizeSetNewPassword(req);
        return res.status(200).send(data);
    } catch(e) {
        return res.status(500).send(e.message)
    }    
}

export const getUserList = async (req, res) => {
    try {
        let data = await userService.getUserList(req);
        return res.status(200).send(data)
    } catch(e) {
        return res.status(500).send(e.message)
    }
 
}

export const getUserData = async (req, res) => {
    try {
        let data = await userService.getUserData(req);
        return res.status(200).send(data)
    } catch(e) {
        return res.status(500).send(e.message)
    }
 
}

export const getUserDataById = async (req, res) => {
    try {
        let data = await userService.getUserDataById(req);
        return res.status(200).send(data)
    } catch(e) {
        return res.status(500).send(e.message)
    }
 
}

