import mongoose from 'mongoose';
import { UserProperties } from './user-interface';

const userSchema = new mongoose.Schema<UserProperties>({
    email: {
        type: mongoose.SchemaTypes.String,
        required: true,
        unique: true
    },
    password: {
        type: mongoose.SchemaTypes.String,
        required: true
    },
    role: {
        type: mongoose.SchemaTypes.String,
        required: true,
        enum: ['Checkman', 'Administrator', 'Chief']
    },
    firms:[{
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Firm',
        required: false,
        default: [],
        validate: {
            validator: async function checkFirmMemberExistance(this: UserProperties, value: mongoose.Types.ObjectId | string) {
                return await FirmModel.exists({ _id: value})
            },
            message: function(validator) {
                return `firm with id ${validator.value} doesn't exist`
            },
            type: 'BAD FIRM ID'
        }
    }],
    secret: {
        type: mongoose.SchemaTypes.String,
        required: false
    },
    banned: {
        type: mongoose.SchemaTypes.Boolean,
        required: false,
        default: false
    }
}, { versionKey: false } );

const FirmModel = mongoose.model<UserProperties>('User', userSchema);
export default FirmModel



