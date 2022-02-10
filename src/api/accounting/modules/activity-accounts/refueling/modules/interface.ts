import { BaseAccountProperties } from "../../../account-modules/interface";
import { Types } from "mongoose"
import { ActivityAccountInterface } from "../../activity-account";

export type ObjectId = Types.ObjectId | string

export interface RefuelingProperties extends BaseAccountProperties {
    mechanism?: ObjectId
    innerNum?: ObjectId
    fuelOrLub: ObjectId
    spent: number
    spentMU: ObjectId
}

export default interface Refueling extends ActivityAccountInterface<RefuelingProperties> {}