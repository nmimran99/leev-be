import StatusList from '../models/status'

export const getStatusList = async (req) => {
    const { module } = req.body;
    return await StatusList.findOne({ module: module });
}

export const updateStatusList = async (req) => {
    const { module, statusList } = req.body;
    return await StatusList.findOneAndUpdate({ module: module}, { statusList: statusList }, { new: true})
}

export const createStatusList = async (req) => {
    const { module, statusList } = req.body;
    const stList = new StatusList({
        module,
        statusList 
    });

    return await stList.save();
}