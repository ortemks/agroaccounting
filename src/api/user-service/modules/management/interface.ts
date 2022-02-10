import { ObjectId } from '../../../suport-modules/types/primitive-types';

import mongoose from 'mongoose';
import { UserProperties } from '../user-interface';

export namespace methodsData {
    export type register = Omit<UserProperties, "secret">;
    export type updateUser = { _id: ObjectId, update: { [ property in keyof UserProperties ]+?: UserProperties[property] extends Array<any> ? 
        { add: UserProperties[property], remove: UserProperties[property] } : UserProperties[property] } };
    export type removeUser = { _id: ObjectId }
}

export default interface Management {
    methods: {
        getUsers(options: { returnRaw?: boolean, firmRestrictions?: ObjectId[] }): Promise<(mongoose.Document<UserProperties> | UserProperties)[]>;
        register(userProperties: methodsData.register, options: { firmRestrictions?: ObjectId[] }): Promise<mongoose.Document<UserProperties>>;
        updateUser(updateOptions: methodsData.updateUser, options: { firmRestrictions?: ObjectId[] }): Promise<void>;
        removeUser(removeOptions: methodsData.removeUser, options: { firmRestrictions?: ObjectId[] }): Promise<void>;
    }
    dataValidation: {
        register(data: any): methodsData.register;
        updateUser(data: any): methodsData.updateUser;
        removeUser(data: any): methodsData.removeUser;
    }
}