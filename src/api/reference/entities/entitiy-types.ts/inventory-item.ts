import { ObjectId, Schema, SchemaTypes } from 'mongoose';
import Entity from '../entity';
import { EntityBaseProperties } from "../entity-modules/entity-class/entity-interface";
import checkExistance from '../entity-modules/entity-types/checkExistance';


// Inventory-Item Schema
type consumptionType = 'палива' | 'масла' | 'культури' | 'хімія';
const consumptionTypes: consumptionType[] = ['палива', 'масла', 'культури', 'хімія'];

interface InventoryItem extends EntityBaseProperties {
    consumptionType: consumptionType,
    measurement: ObjectId
}

const inventoryItemSchema = new Schema<InventoryItem>( {
    consumptionType: {
        type: SchemaTypes.String,
        enum: [...consumptionTypes],
        required: true
    },
    measurement: {
        type: SchemaTypes.ObjectId,
        ref: 'Measurement',
        required: [true, `quantityMeasured must contain at least 1 value`],
        validate:  checkExistance('Measurement') 
    }
}, { versionKey: false } );


// creating Inventory-Item entity
const InventoryItem: Entity<InventoryItem> = new Entity('InventoryItem', inventoryItemSchema);

export default InventoryItem


