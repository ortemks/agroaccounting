import { Schema, model, SchemaTypes, models } from 'mongoose';
import { FirmProperties } from './interface';

const firmSchema = new Schema<FirmProperties>({
    name: {
        type: SchemaTypes.String,
        unique: true,
        required: true
    },
    disabled: {
        type: SchemaTypes.Boolean,
        required: true,
        default: false
    }
}, { versionKey: false } )

const FirmModel = model<FirmProperties>('Firm', firmSchema);

export default FirmModel;