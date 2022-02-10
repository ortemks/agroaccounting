import { BaseAccountProperties } from "../../../account-modules/interface";
import { Types } from "mongoose"
import { ActivityAccountInterface } from "../../activity-account";

type ObjectId = Types.ObjectId | string;

export interface InventoryItemChange {
    inventoryItem: ObjectId
    amount: number
    amountMU: ObjectId
}

export interface WorkProperties extends BaseAccountProperties {
    workType: ObjectId
    workDone: number
    workDoneMU: ObjectId

    arrival?: InventoryItemChange[]
    spending?: InventoryItemChange[]

    worker: ObjectId
    employeePrice?: {
        currency: string
        amount: number
    }
    fieldNum?: ObjectId

    mechanism?: ObjectId
    innerNum?: ObjectId
    outfit?: ObjectId

    fuelType: ObjectId
    fuelSpent: number
    fuelSpentMU: ObjectId
}

export default interface WorkInterface extends ActivityAccountInterface<WorkProperties> {}