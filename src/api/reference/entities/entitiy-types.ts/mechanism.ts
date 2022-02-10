import { ObjectId, Schema, SchemaTypes, Types } from 'mongoose';
import Entity from '../entity';
import { EntityBaseProperties } from "../entity-modules/entity-class/entity-interface";

import InventoryItem from './inventory-item';
import checkExistance from '../entity-modules/entity-types/checkExistance';

// Mechanism Schema
interface Mechanism extends EntityBaseProperties {
    fuelUsed: Array<typeof SchemaTypes.ObjectId>,
    oilUsed?: Array<Types.ObjectId | string>
}

const mechanismSchema = new Schema<Mechanism>( {
    fuelUsed: [{
        type: [SchemaTypes.ObjectId],
        ref: 'InventoryItem',
        required: true,
        validate:  [ checkExistance('InventoryItem'), { 
            validator: async function (value: ObjectId): Promise<boolean> {
                return Boolean(await InventoryItem.model.exists({ _id: value, consumptionType: 'палива' }));
            },
            messsage: `Inventory Item's consumption type must be "палива"`,
            type: `BAD INVENTORY ITEM ID REFERENCE`
        }
        ]
    }],
    oilUsed: [{
        type: SchemaTypes.ObjectId,
        ref: 'InventoryItem',
        required: false,
        default: [],
        validate:  [ checkExistance('InventoryItem'), { 
            validator: async function (value: ObjectId): Promise<boolean> {
                return Boolean(await InventoryItem.model.exists({ _id: value, consumptionType: 'масла' }));
            },
            messsage: `Inventory Item's consumption type must be "масла"`,
            type: `BAD INVENTORY ITEM ID REFERENCE`
        } ]
    }]
}, { versionKey: false } );


// creating Mechanism entity
const Mechanism: Entity<Mechanism> = new Entity('Mechanism', mechanismSchema);   

export default Mechanism