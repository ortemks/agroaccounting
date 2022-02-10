import { Schema, SchemaTypes, model } from "mongoose";

import { baseAccountingScema, schemaReferenceValidation } from "../../account-modules/mongoose-model";
import { InventorisationProperties } from "./interface";

let inventorisationSchema = new Schema<InventorisationProperties>({
    inventoryItem: {
        type: SchemaTypes.ObjectId,
        ref: 'InventoryItem',
        required: true
    },
    amount: {
        type: SchemaTypes.Number,
        required: true
    },
    computedAmount: {
        type: SchemaTypes.Number,
        default: undefined
    },
    amountMU: {
        type: SchemaTypes.ObjectId,
        ref: 'MeasureUnit',
        required: false
    }
}, { versionKey: false })
inventorisationSchema.add(baseAccountingScema);
schemaReferenceValidation<InventorisationProperties>(inventorisationSchema,
     { pathName: 'inventoryItem', depndentProperty: { pathName: 'amountMU', sameProperty: { name: 'measurement' } } },
     { pathName: 'amountMU', depndentProperty: { pathName: 'inventoryItem', sameProperty: { name: 'measurement' } } }
)

const InventorisationModel = model('Inventorisation', inventorisationSchema);
export default InventorisationModel

