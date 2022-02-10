import { Schema, SchemaTypes, model, Types } from "mongoose";
import { RefuelingProperties } from "./interface";

import { baseAccountingScema, schemaReferenceValidation, convertMeasureUnits } from "../../../account-modules/mongoose-model";

import Reference from "../../../../../reference/reference";
const reference = new Reference();
let InventoryItemModel = reference.entities.inventoryItem.model;

const refuelingSchema = new Schema<RefuelingProperties>({
    mechanism: {
        type: SchemaTypes.ObjectId,
        ref: 'Mechanism',
        required: true
    },
    innerNum: {
        type: SchemaTypes.ObjectId,
        ref: 'MechanismInnerNumber',
        required: true
    },
    fuelOrLub:  {
        type: SchemaTypes.ObjectId,
        ref: 'InventoryItem',
        validate: {
            validator: async function isFuel(value: string | Types.ObjectId) {
                await InventoryItemModel.exists({ _id: value, consumptionType: { $in: ['палива', 'масла']}})
            },
            message: `inventory items's consumption type must be etither 'палива', or 'масла'`,
            type: 'BAD ID REFERENCE'
        },
        required: true
    },
    spent: {
        type: SchemaTypes.Number,
        required: true
    },
    spentMU: {
        type: SchemaTypes.ObjectId,
        ref: 'MeasureUnit',
        required: true
    },

}, { versionKey: false } );
refuelingSchema.add(baseAccountingScema);
schemaReferenceValidation<RefuelingProperties>(refuelingSchema, 
    { pathName: "fuelOrLub", depndentProperty: { pathName: "spentMU", sameProperty: { name: 'measurement' } } },
    { pathName: "spentMU", depndentProperty: { pathName: "fuelOrLub", sameProperty: { name: 'measurement' } } },
)
convertMeasureUnits<RefuelingProperties>( refuelingSchema,
    { amountPathName: "spent", measureUnitPathName: "spentMU" }
)

const RefuelingModel = model('Refueling', refuelingSchema);
export default RefuelingModel