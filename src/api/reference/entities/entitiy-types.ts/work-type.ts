import { ObjectID } from 'bson';
import { ObjectId, Schema, SchemaTypes } from 'mongoose';
import Entity from '../entity';
import { EntityBaseProperties } from "../entity-modules/entity-class/entity-interface";
import checkExistance from '../entity-modules/entity-types/checkExistance';

// Work-Type Schema
interface WorkType extends EntityBaseProperties {
    measurement: ObjectId[],
    arrival: ObjectId[],
    spending: ObjectId[]
}

const workTypeSchema = new Schema<WorkType>( {
    measurement: [{
        type: SchemaTypes.ObjectId,
        ref: 'Measurement',
        required: true,
        validate: [ checkExistance('Measurement') ]
    }],
    arrival: [{
        type: SchemaTypes.ObjectId,
        ref: 'InventoryItem',
        required: false,
        validate: [ checkExistance('InventoryItem') ],
        default: []
    }],
    spending: [{
        type: SchemaTypes.ObjectId,
        ref: 'InventoryItem',
        required: false,
        validate: [ checkExistance('InventoryItem') ],
        default: []
    }]
}, { versionKey: false } );

workTypeSchema.path('measurement').validate( ( measurements: ObjectID[] ) => measurements.length > 0, `work type must have at least one measurement`, "BAD VALUE" )

// creating Work-Type entity
const WorkType: Entity<WorkType> = new Entity('WorkType', workTypeSchema);

export default WorkType