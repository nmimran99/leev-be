import Tenant from '../models/tenant';
import User, { updateMany } from '../models/user';

export const createTenant = async (req) => {
    const { name, contactName, contactNumber, lang, isActive } = req.body;
    let tenant = new Tenant({
        name, 
        contactName, 
        contactNumber,
        lang,
        isActive
    });
    return await tenant.save();
}

export const updateTenant = async (req) => {
    const { tenantId, name, contactName, contactNumber,lang, isActive } = req.body;

    if (!isActive) {
        await User.updateMany({ tenant: tenantId }, { isActive: false });
    }
    
    return await Tenant.findOneAndUpdate({ _id: tenantId}, { name, contactName, contactNumber, lang, isActive }, { new: true, upsert: true });
}

export const deleteTenant = async (req) => {
    const { tenantId } = req.body;
    return await Tenant.findOneAndDelete({ _id: tenantId });
}

export const getTenants = async (req) => {
    let { filters, page, rowsPerPage } = req.body;
    if (page >= 0 && rowsPerPage > 0) {
        return await Tenant.find({}).skip(page * rowsPerPage || 0).limit(rowsPerPage);
    }
    return await Tenant.find({});
}

export const getTenant = async (req) => {
    const { tenantId } = req.body;

    return await Tenant.findOne({ _id: tenantId});
}