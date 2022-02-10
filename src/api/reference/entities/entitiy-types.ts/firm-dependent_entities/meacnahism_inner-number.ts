import { ObjectId, Schema, SchemaTypes } from 'mongoose';
import Entity from '../../entity';
import { FirmDependentEntity } from "../../entity-modules/entity-class/entity-interface";
import checkExistance from '../../entity-modules/entity-types/checkExistance';

// Mechanism Inner-Number Schema
interface MechanismInnerNumber extends FirmDependentEntity {
    mechanism: ObjectId
}

const mechanismInnerNumberSchema = new Schema<MechanismInnerNumber>( {
    mechanism: {
        type: SchemaTypes.ObjectId,
        ref: 'Mechanism',
        required: true,
        validate: [ checkExistance('Mechanism') ]
    }
}, { versionKey: false } );


// creating Mechanism Inner-Number entity
const MechanismInnerNumber: Entity<MechanismInnerNumber> = new Entity('MechanismInnerNumber', mechanismInnerNumberSchema, { isFirmDependent: true });

export default MechanismInnerNumber