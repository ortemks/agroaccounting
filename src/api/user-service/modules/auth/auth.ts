import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import Joi from 'joi';
import express from "express";

import AuthInterface, { methodsData } from './interface';
import getValidationSchema from './validation-schemas';

import { UserProperties, UserRole } from '../user-interface';
import userModel from '../mongoose-model';

export default class Auth implements AuthInterface {
    private static authInstance: Auth;

    userModel: mongoose.Model<UserProperties> = userModel;
    
    methods: { 
        authenticate(authAttributes: methodsData.authenticate): Promise<UserProperties>; 
        authorize(user: methodsData.authorize, restrictions?: UserRole[]): void; 
    } = {
        authenticate: async function (this: Auth, authAttributes) {
            let userId = authAttributes.userId;

            let user = await this.userModel.findOne({ _id: userId });
            if (!user) throw {value: userId, name: `user with id passed in cookies doesn't exist`, type: 'AUTHENTICATION ERROR'}
            let secretKey = user.secret;

            jwt.verify(authAttributes.accessToken, secretKey);

            return user
        },
        authorize: function (user, restrictions?) {
            if (restrictions && restrictions.includes(user.role)) throw { name: `users with role: ${user.role} can't get access to requested resource`, type: 'AUTHORIZATION ERROR' }
        }
    };

    middlewares: { 
        authenticate(req: express.Request, res: express.Response, next: express.NextFunction): Promise<void>; 
        authorize(restrictions?: UserRole[]): (req: express.Request, res: express.Response, next: express.NextFunction ) => void;
    } = {
        authenticate: async function (this: Auth, req, res, next) {
            try {
                console.log('authentication...')
                let userId = req.cookies.user_id;
                let accessToken = req.get('Authorization')?.split(' ')[1];

                let validData = this.dataValidation.authenticate({ accessToken: accessToken, userId: userId });
                let user = await this.methods.authenticate(validData);

                res.locals.user = user;
            } catch (error) {
                next(error)
            }
            next()
        },
        authorize(this: Auth, restrictions) {
            let authorizeFunction = function (this: Auth, req: express.Request, res: express.Response, next: express.NextFunction) {
                try {
                    this.methods.authorize(res.locals.user, restrictions);
                } catch (error) {
                    next(error)
                }
                next()
            }

            return authorizeFunction.bind(this);
        }
    }
    
    dataValidation: { 
        authenticate(data: any): methodsData.authenticate; 
        authorize(data: any): UserProperties; 
    } = {
        authenticate: function (this: Auth, data) {
            return Joi.attempt(data, this.validationSchemas.authenticate, { stripUnknown: true });
        },
        authorize: function (this: Auth, data) {
            return Joi.attempt(data, this.validationSchemas.authorize, { stripUnknown: true });
        }
    };

    validationSchemas: {
        authenticate: Joi.Schema;
        authorize: Joi.Schema;
    } = {
        authenticate: getValidationSchema('authenticate'),
        authorize: getValidationSchema('authorize')
    }

    constructor () {
        let authInstance = Auth.authInstance;
        if (authInstance) return authInstance;

        function bindMethods (this: Auth, methodsObject: { [key: string]: Function} ) {
            for (let key in methodsObject) {
                methodsObject[key] = methodsObject[key].bind(this)
            }
        }

        bindMethods.call(this, this.methods);
        bindMethods.call(this, this.dataValidation);
        bindMethods.call(this, this.middlewares);

        Auth.authInstance = this;
    }
}