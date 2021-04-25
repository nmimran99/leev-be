import { resolveContent } from 'nodemailer/lib/shared';
import Role from '../models/role';

export const createRole = async (req) => {
    const { tenant, _id: createdBy } = req.user;
    const { roleName, permissions } = req.body;
    const { permLevel } = req.headers;

    if (permLevel !== 2) {
        return { error: true, reason: 'unauthorized'}
    }

    const role = new Role({
        tenant,
        roleName,
        permissions,
        createdBy,
        lastUpdatedBy: createdBy
    });

    return await role.save();
}

export const getRole = async (req) => {
    const { roleId } = req.body;
    const { permLevel } = req.headers;

    if (permLevel === 2) {
        return await Role.findOne({ _id: roleId }, {});
    } else {
        return { error: true, reason: 'unauthorized' };
    }  
}

export const getRoles = async (req) => {
    const { _id: tenant } = req.user.tenant;
    return await Role.find({ tenant })
    
}

export const updateRole = async (req) => {
    const { _id: lastUpdatedBy } = req.user;
    const { roleId, permissions } = req.body;
    const { permLevel } = req.headers;
    
    if (permLevel !== 2) {
        return { error: true, reason: 'unauthorized'}
    }

    return await Role.findOneAndUpdate({ _id: roleId }, { permissions, lastUpdatedBy}, { useFindAndModify: false, new: true})
}
