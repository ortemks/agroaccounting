import Joi from 'joi';
import mongoose from 'mongoose';
import { Router } from 'express';
import jwt from 'jsonwebtoken'; 
import { randomBytes } from 'crypto';
import InteractionIntrace, { methodsData } from './interface';
import getValidationSchema from './validation-schemas';
import setRouter from './router';

import { UserProperties } from '../user-interface';
import userModel from '../mongoose-model';
import firmRestrictions from '../../../suport-modules/functions/firm-restrictions';
import { MongooseDoc } from './interface';
import { ObjectId } from '../../../suport-modules/types/primitive-types';


export default class Interaction implements InteractionIntrace {
    private static interactionInstance: Interaction;

    router: Router = Router();
    userModel: mongoose.Model<UserProperties> = userModel;
    


    methods: { 
        login(userCredentials: methodsData.login): Promise<{tokens: { refreshToken: string, accessToken: string }, userProperties: MongooseDoc<Omit<UserProperties, 'secret'>>, availableUsers: MongooseDoc<Omit<UserProperties, 'secret'>>[] }>;
        refresh(refreshToken: methodsData.refresh): Promise<{refreshToken:string, accessToken: string}>; 
        credentialsUpdate(userCredentialsWithNewPassword: methodsData.credentialsUpdate): Promise<void>; 
    } = {
        login: async function (this: Interaction, userCredentials) {
            const statedEmail = userCredentials.email;
            const user = await this.userModel.findOne({ email: statedEmail }, {secret: 0}) as MongooseDoc<Omit<UserProperties,'secret'>>;
            if (!user) throw { value: statedEmail, path: 'email', name: `user with passed email doesn't exist`, type: 'BAD CREDENTIALS' };
            if (user.banned) throw { value: statedEmail, path: 'email', name: `user with passed email has been banned`, type: 'BAD CREDENTIALS' }
            
            const statedPassword = userCredentials.password;
            if (user.password !== statedPassword) throw { value: statedPassword, name: `wrong password`, type: 'BAD CREDENTIALS' };

            let newSecretKey = randomBytes(64).toString('hex');
            await user.updateOne({ secret: newSecretKey });
            
            const availableUsers = await this.getAvailableUsersInfo(user);
            const tokens = {
                refreshToken: jwt.sign({}, newSecretKey),
                accessToken: jwt.sign({ firms: user.firm, role: user.role}, newSecretKey, { expiresIn: '1 hour'})
            }
            return { tokens, userProperties: user, availableUsers }
        },
        refresh: async function (this: Interaction, refreshData) {
            let userId = refreshData.userId;
            let user = await this.userModel.findOne({ _id: userId, banned: false });
            if (!user) throw new Error(`user doesn't exist`);
            
            let usersRefreshToken = refreshData.refreshToken;
            jwt.verify(usersRefreshToken, user.secret);
            
            let newSecretKey = randomBytes(64).toString('hex'); 
            
            await user.updateOne({ secret: newSecretKey });
            let refreshToken: string = jwt.sign({}, newSecretKey);
            let accessToken: string = jwt.sign({ firms: user.firm, role: user.role}, newSecretKey, { expiresIn: '1 hour'});

            return { refreshToken: refreshToken, accessToken: accessToken }
        },
        credentialsUpdate: async function (this: Interaction, update) {
            let currentCredentials = update.currentCrdentials;
            let credentialsUpdate = update.credentialsUpdate;

            let user = await this.userModel.findOne({mail: currentCredentials.email});
            if (!user) throw new Error(`user with mail: ${currentCredentials.email} doesn't exist`);
            if (user.password !== currentCredentials.password) throw new Error('wrong password');

            await user.updateOne(credentialsUpdate); 
        }
    };
    
    dataValidation: { 
        login(data: any): methodsData.login; 
        refresh(data: any): methodsData.refresh; 
        credentialsUpdate(data: any): methodsData.credentialsUpdate; 
    } = {
        login: function (this: Interaction, data) {
            return Joi.attempt(data, this.validationSchemas.login, { stripUnknown: true });
        },
        refresh: function (this: Interaction, data) {
            return Joi.attempt(data, this.validationSchemas.refresh, { stripUnknown: true });
        },
        credentialsUpdate: function (this: Interaction, data) {
            return Joi.attempt(data, this.validationSchemas.credentialsUpdate, { stripUnknown: true });
        }
    };

    validationSchemas: {
        login: Joi.Schema;
        refresh: Joi.Schema;
        credentialsUpdate: Joi.Schema;
    } = {
        login: getValidationSchema('login'),
        refresh: getValidationSchema('refresh'),
        credentialsUpdate:  getValidationSchema('credentialsUpdate')
    }

    constructor () {
        let interactionInstance = Interaction.interactionInstance;
        if (interactionInstance) return interactionInstance;

        function bindMethods (this: Interaction, methodsObject: { [key: string]: Function} ) {
            for (let key in methodsObject) {
                methodsObject[key] = methodsObject[key].bind(this)
            }
        }

        bindMethods.call(this, this.methods);
        bindMethods.call(this, this.dataValidation);

        setRouter.call(this, this.router);

        Interaction.interactionInstance = this;
    }

    private async getAvailableUsersInfo(user: {role: string, firm: ObjectId[], [key: string]: any}): Promise<MongooseDoc<Omit<UserProperties, 'secret'>>[]> {
        if (user.role === 'Checkman') return [];

        const userQuery = {};
        if (user.firm.length > 0) firmRestrictions.onFind(userQuery, user.firm);
        const otherUsers = await this.userModel.find(userQuery, {secret: 0});
        return otherUsers
    }
}
