import { Schema, SchemaTypes } from 'mongoose';
import Entity from '../entity';
import { EntityBaseProperties } from "../entity-modules/entity-class/entity-interface";

// Provider Schema
interface Provider extends EntityBaseProperties {};

const providerSchema = new Schema<Provider>( {
    name: {
        type: SchemaTypes.String,
        required: true
    }
}, { versionKey: false } );

// creating Consumption-Type entity
const Provider: Entity<Provider> = new Entity('Provider', providerSchema);

export default Provider