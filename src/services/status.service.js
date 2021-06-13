import StatusList from '../models/status'

export const getStatusList = async (req) => {
    const { module } = req.body;
    return await StatusList.find({ module: module });
}

export const getStatusIds = async (module, state) => {
    let filters = { module };
    let statusList= [];
    if (state) {
        filters.state = state;
    }
    let statuses = await StatusList.find(filters, '_id');
    statuses.forEach(s => statusList.push(s._id));
    return statusList;

}

export const updateStatusItem = async (req) => {
    const { _id, statusId, state, order } = req.body;
    return await StatusList.findOneAndUpdate({ _id: _id}, { statusId, state, order }, { new: true})
}

export const createStatusItem = async (req) => {
    const { module, statusId, state, order } = req.body;
    const stList = new StatusList({
        module,
        statusId,
        state,
        order
    });

    return await stList.save();
}

export const getStatusByNameAndModule = async (name, module) => {
    return await StatusList.find({ statusId: name, module });
}