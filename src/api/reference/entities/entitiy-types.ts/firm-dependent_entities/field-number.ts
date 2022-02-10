import { Schema } from 'mongoose';
import Entity from '../../entity';
import { FirmDependentEntity } from "../../entity-modules/entity-class/entity-interface";

// Field-Number Schema
interface FieldNumber extends FirmDependentEntity {}

const fieldNumberSchema = new Schema<FieldNumber>( {}, { versionKey: false } );


// creating Field-Number entity
const FieldNumber: Entity<FieldNumber> = new Entity('FieldNumber', fieldNumberSchema, { isFirmDependent: true });

export default FieldNumber