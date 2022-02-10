import { ObjectId, Schema, SchemaTypes} from 'mongoose';
import Entity from '../../entity';
import { FirmDependentEntity } from "../../entity-modules/entity-class/entity-interface";
import checkExistance from '../../entity-modules/entity-types/checkExistance';


// Worker Schema
interface Worker extends FirmDependentEntity {
    workingPosts: ObjectId[]
}

const workerSchema = new Schema<Worker>( {
    workingPosts: [{
        type: SchemaTypes.ObjectId,
        ref: 'WorkingPost',
        required: true,
        validate: [ checkExistance('WorkingPost') ]
    }]
}, { versionKey: false } );

// creating Worker entity
const Worker: Entity<Worker> = new Entity('Worker', workerSchema, { isFirmDependent: true });

export default Worker