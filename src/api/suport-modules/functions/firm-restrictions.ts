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
        
        let stringedFirmRestrictions = firmRestrictions.map(objectId => objectId.toString());
        let firmSet = setOptions.firm;

        let canUserSetFirm = Array.isArray(firmSet) ? firmSet.every( firm => stringedFirmRestrictions.includes(firm.toString()) ) : stringedFirmRestrictions.includes(firmSet.toString());
        if (!canUserSetFirm) throw { path: 'firm', value: firmSet, name: `user can't set passed firm ${Array.isArray(firmSet) ? 's' : ''}`, type: `FIRM RESSTRICTIONS ERROR`}
    }
}
