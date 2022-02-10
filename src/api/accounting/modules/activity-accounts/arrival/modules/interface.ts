import { BaseAccountProperties } from "../../../account-modules/interface";
import { Types } from "mongoose"
import { ActivityAccountInterface } from "../../activity-account";

export type ObjectId = Types.ObjectId | string

export interface ArrivalProperties extends BaseAccountProperties {
    inventoryItem: ObjectId
    arrived: number
    arrivedMU: ObjectId

    price: {
        amount: number,
        currency: string
    }

    worker: ObjectId
    provider: ObjectId
}

export default interface Arrival extends ActivityAccountInterface<ArrivalProperties> {}
