import Counter from '../models/counter';

export const incrementCounter = async type => {
    const counter = await Counter.findOne({ module: type});
    let newValue = counter ? counter.currentValue : 0;
    return await Counter.findOneAndUpdate({ module: type}, { currentValue: newValue + 1}, {upsert: true, new: true})
}