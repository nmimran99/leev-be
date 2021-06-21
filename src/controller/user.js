import * as userService from '../services/user.service';
import * as authService from '../services/auth.service';

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

export const updateUserData = async (req, res) => {
    try{
        let data = await userService.updateUserData(req);
        if (data.error) {
			return res.status(data.status).send(data.reason);
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

export const updateUserRole = async (req, res) => {
    try{
        let data = await userService.updateUserRole(req);
        return res.status(200).send(data);
    } catch(e) {
        return res.status(500).send(e.message);
    }  
}

export const removeAvatar = async (req, res) => {
    try{
        let data = await userService.removeAvatar(req);
        return res.status(200).send(data);
    } catch(e) {
        return res.status(500).send(e.message);
    }  
}

export const disableUser = async (req, res) => {
    try{
        let data = await userService.disableUser(req);
        return res.status(200).send(data);
    } catch(e) {
        return res.status(500).send(e.message);
    }  
}

export const enableUser = async (req, res) => {
    try{
        let data = await userService.enableUser(req);
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

export const deactivateUser = async (req, res) => {
    try {
        const deleteUser = await userService.deactivateUser(req);
        if (deleteUser) {
            return res.status(500).send(deleteUser);   
        }
        return res.status(200).send(`User ${ req.body.userId } was successfully deleted`);
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
        if (data.error) {
            return res.status(data.status).send(data.reason);
        }
        return res.status(200).send(data)
    } catch(e) {
        return res.status(500).send(e.message)
    }
 
}

export const getResidentList = async (req, res) => {
    try {
        let data = await userService.getResidentList(req);
        if (data.error) {
            return res.status(data.status).send(data.reason);
        }
        return res.status(200).send(data)
    } catch(e) {
        return res.status(500).send(e.message)
    }
 
}

export const getUsersData = async (req, res) => {
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
        if (data.error) {
            return res.status(data.status).send(data.reason);
        }
        return res.status(200).send(data)
    } catch(e) {
        return res.status(500).send(e.message)
    }
}


export const verifyEmailExists = async (req, res) => {
    try {
        let data = await userService.verifyEmailExists(req);
        if (data.error) {
            return res.status(data.status).send(data);
        }
        return res.status(200).send(data)
    } catch(e) {
        return res.status(500).send(e.message)
    }
}

export const verifyResetPasswordHandle = async (req, res) => {
    try {
        let data = await userService.verifyResetPasswordHandle(req);
        if (data.error) {
            return res.status(data.status).send(data);
        }
        return res.status(200).send(data)
    } catch(e) {
        return res.status(500).send(e.message)
    }
}

