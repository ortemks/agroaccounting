import Account, { BaseAccountProperties } from "../../account-modules/interface";
import { Types } from "mongoose";

type ObjectId = Types.ObjectId | string

export interface InventorisationProperties extends BaseAccountProperties {
    inventoryItem: ObjectId,
    amount: number,
    computedAmount: number,
    amountMU: ObjectId
}

export default interface Inventorisation extends Account<InventorisationProperties> {}