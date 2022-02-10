import { FilterQuery } from "mongoose"
import { ObjectId } from "../types/primitive-types"

export default {
    onFind: function (filter: FilterQuery<any>, firmRestrictions: ObjectId[] ) {
        let firmRestrictionsCondition = { firm: { $in: firmRestrictions } };

        if (filter.firm) { 
            if (filter.$and) {
                filter.$and.push(firmRestrictions)
            } else {
                filter.$and = [ { firm: filter.firm }, firmRestrictionsCondition ]
            }
        } else {
            Object.assign(filter, firmRestrictionsCondition)
        }
    },
    onSet: function (setOptions: { [key: string]: any }, firmRestrictions: ObjectId[]) {
        if (!setOptions.firm) return;
        
        let stringObjectIds = firmRestrictions.map(objectId => objectId.toString());
        let firmSetted = setOptions.firm;

        let canUserSetFirm = Array.isArray(firmSetted) ? firmSetted.every( firm => stringObjectIds.includes(firm.toString()) ) : stringObjectIds.includes(firmSetted.toString());
        if (!canUserSetFirm) throw { path: 'firm', value: firmSetted, name: `user can't set passed firm ${Array.isArray(firmSetted) ? 's' : ''}`, type: `FIRM RESSTRICTIONS ERROR`}
    }
}
