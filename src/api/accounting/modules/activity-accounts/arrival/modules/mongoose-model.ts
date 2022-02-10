import { Schema, SchemaTypes, model, Types } from "mongoose";
import { ArrivalProperties } from "./interface";

import { baseAccountingScema, priceSchema, schemaReferenceValidation, convertMeasureUnits } from "../../../account-modules/mongoose-model";

const arrivalSchema = new Schema<ArrivalProperties>({
    inventoryItem: {
        type: SchemaTypes.ObjectId,
        ref: 'InventoryItem',
        required: true
    },
    arrived: {
        type: SchemaTypes.Number,
        required: true
    },
    arrivedMU: {
        type: SchemaTypes.ObjectId,
        ref: 'MeasureUnit',
        required: true
    },
    price: priceSchema,

    worker: {
        type: SchemaTypes.ObjectId,
        ref: 'Worker',
        required: true
    },
    provider: {
        type: SchemaTypes.ObjectId,
        ref: 'Provider',
        required: true
    }
}, { versionKey: false } );
arrivalSchema.add(baseAccountingScema);
schemaReferenceValidation<ArrivalProperties>(arrivalSchema, 
    { pathName: 'inventoryItem', depndentProperty: { pathName: 'arrivedMU', sameProperty: { name: 'measurement' } } },
    { pathName: 'arrivedMU', depndentProperty: { pathName: 'inventoryItem', sameProperty: { name: 'measurement' } } }
)
convertMeasureUnits<ArrivalProperties>( arrivalSchema,
    { amountPathName: "arrived", measureUnitPathName: "arrivedMU" }
)

const ArrivalModel = model('Arrival', arrivalSchema);
export default ArrivalModel