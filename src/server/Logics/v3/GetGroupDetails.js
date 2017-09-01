/** Get group details */

const GroupModel = require('../../Models/Group');

const GetGroupDetails = {
    
    get: (groupId, fields, onSuccess, onError) => {
        const model = GroupModel.get();
        model.findOne({ _id: groupId }, fields, (err,foundGroup) => {
            if(err && onError) return onError(err);
            result = foundGroup.toObject();
            result.id = foundGroup._id;
            delete result._id;
            if(onSuccess) onSuccess(result);
        });
    }
};


module["exports"] = GetGroupDetails;