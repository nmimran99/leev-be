import StatusList from '../models/status'

export const getStatusList = async (req) => {
    const { module } = req.body;
    return await StatusList.find({ module: module });
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
        statusId,
        order
    });

    return await stList.save();
}