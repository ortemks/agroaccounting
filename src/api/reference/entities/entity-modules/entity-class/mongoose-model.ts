import { Schema, SchemaTypes, model } from "mongoose";
import { EntityBaseProperties, FirmDependentEntity } from "./entity-interface";

const entityBaseSchema = new Schema<EntityBaseProperties>({
    name: {
        type: SchemaTypes.String,
        required: true,
        lowercase: true
    },
    description: {
        type: SchemaTypes.String,
        required: false,
        lowercase: true
    },
    changedBy: {
        type: SchemaTypes.ObjectId,
        ref: 'User',
        required: true
    }
}, { versionKey: false, collection: 'entities', discriminatorKey: 'entityName'})



const EntityBaseModel = model<EntityBaseProperties>('Entity', entityBaseSchema);
export default EntityBaseModel;

const firmDependentEntitySchema = new Schema<FirmDependentEntity>({
    firm: {
        type: SchemaTypes.ObjectId,
        ref: 'Firm',
        required: true
    }
}, { versionKey: false });

const FirmDependentEntityModel = EntityBaseModel.discriminator('FirmDependentEntity', firmDependentEntitySchema);

export { firmDependentEntitySchema, FirmDependentEntityModel } ;
