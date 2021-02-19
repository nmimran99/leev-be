import Tenant from '../models/tenant';

export const createTenant = async (req) => {
    const { name, contactName, contactNumber } = req.body;
    let tenant = new Tenant({
        name, 
        contactName, 
        contactNumber
    });
    return await tenant.save();
}

export const updateTenant = async (req) => {
    const { tenantId, name, contactName, contactNumber } = req.body;
    return await Tenant.findOneAndUpdate({ _id: tenantId}, { name, contactName, contactNumber }, { new: true, upsert: true });
}

export const removeTenant = async (req) => {
    const { tenantId } = req.body;
    return await Tenant.findOneAndDelete({ _id: tenantId });
}

export const getTenants = async (req) => {
    return await Tenant.find({});
}