import { ObjectId } from '../../../suport-modules/types/primitive-types';

import mongoose from 'mongoose';
import Joi from 'joi';
import { Router } from 'express';
import ManagementInterface, { methodsData } from './interface';
import getValidationSchema from './validation-schemas';
import setRouter from './router';

import { UserProperties } from '../user-interface';
import userModel from '../mongoose-model';

import bindMethods from '../../../suport-modules/functions/bind-methods';
import firmRestrictions from '../../../suport-modules/functions/firm-restrictions';


export default class Management implements ManagementInterface {
    private static managementInstance: Management;

    router: Router = Router();
    UserModel: mongoose.Model<UserProperties> = userModel;
    
    public methods: { 
        getUsers(options: { returnRaw?: boolean, firmRestrictions?: ObjectId[] }): Promise<(mongoose.Document<UserProperties> | UserProperties)[]>;
        register(userProperties: UserProperties, options: { firmRestrictions?: ObjectId[] }): Promise<mongoose.Document<any, any, UserProperties>>; 
        updateUser(updateOptions: methodsData.updateUser, options: { firmRestrictions?: ObjectId[] }): Promise<void>; 
        removeUser(removeOptions: methodsData.removeUser, options: { firmRestrictions?: ObjectId[] }): Promise<void>;
    } = {
        getUsers: async function (this: Management, options = { returnRaw: true, firmRestrictions: [] }) {
            let filter = {};

            let firmRestrictions = options.firmRestrictions;
            if (firmRestrictions) this.firmRestrictions.onFind(filter, firmRestrictions);

            return await userModel.find(filter, { secret: false }, { lean: options.returnRaw });
        },
        register: async function (this: Management, userProperties, options = { firmRestrictions: [] }) {
            let email = userProperties.email;
            if ( await this.UserModel.exists({ email: email }) ) throw { value: email, name: `user with mail passed mail already exists`, type: `BAD CREDENTIALS` };

            let firmRestrictions = options.firmRestrictions;
            if (firmRestrictions) this.firmRestrictions.onSet(userProperties, firmRestrictions);

            let newUser = await this.UserModel.create(userProperties);
            return newUser;
        },
        updateUser: async function (this: Management, updateOptions, options = { firmRestrictions: [] }) {
            let filter = { _id: updateOptions._id };
            let update = updateOptions.update;

            let firmRestrictions = options.firmRestrictions;
            if (firmRestrictions?.length) { 
                this.firmRestrictions.onSet(update, firmRestrictions);
                this.firmRestrictions.onFind(filter, firmRestrictions);
            }

            let user = await this.UserModel.findOne(filter);

            if (!user) throw { value: updateOptions._id, name: `user with passed id doesn't exist`, type: 'BAD ID' };
            if (user.role === 'Chief') throw { value: updateOptions._id, name: `user with role "Chief" can't be changed`, type: 'BAD ID'};
            
            await user.updateOne(updateOptions.update, { runValidators: true });
        },
        removeUser: async function (this: Management, removeOptions, options = { firmRestrictions: [] }) {
            let filter = { _id: removeOptions._id };

            let firmRestrictions = options.firmRestrictions;
            if (firmRestrictions?.length) this.firmRestrictions.onFind(filter, firmRestrictions);
    
            let deleteData = await this.UserModel.deleteOne(filter);
            if (!deleteData.deletedCount) throw { value: removeOptions._id, path: 'id', name: `user with passed id does'nt exist for user perfoming deletion`, type: 'BAD ID' }
        }
    };
    
    public dataValidation: { 
        register(data: any): methodsData.register; 
        updateUser(data: any): methodsData.updateUser; 
        removeUser(data: any): methodsData.removeUser;
    } = {
        register: function (this: Management, data) {
            return Joi.attempt(data, this.validationSchemas.register, { stripUnknown: true });
        },
        updateUser: function (this: Management, data) {
            return Joi.attempt(data, this.validationSchemas.updateUser, { stripUnknown: true });
        },
        removeUser: function (this: Management, data) {
            return Joi.attempt(data, this.validationSchemas.removeUser, { stripUnknown: true });
        }
    };

    private validationSchemas: {
        register: Joi.Schema;
        updateUser: Joi.Schema;
        removeUser: Joi.Schema;
    } = {
        register: getValidationSchema('register'),
        updateUser: getValidationSchema('updateUser'),
        removeUser: getValidationSchema('removeUser')
    }

    private firmRestrictions = firmRestrictions;

    constructor () {
        if (Management.managementInstance) return Management.managementInstance;

        bindMethods.call(this, this.methods);
        bindMethods.call(this, this.dataValidation);
        bindMethods.call(this, this.firmRestrictions);

        setRouter.call(this, this.router);

        Management.managementInstance = this;
    }
}