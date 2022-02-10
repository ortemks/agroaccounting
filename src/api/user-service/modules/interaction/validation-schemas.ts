import { objectIdValidator } from '../../../suport-modules/functions/validation-schemas';

import Joi from 'joi';
(Joi as any).objectId = objectIdValidator;

import { methodsData } from './interface';


const loginSchema = Joi.object<methodsData.login>().keys({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(30).required()
})

const refreshSchema = Joi.object<methodsData.refresh>().keys({
    refreshToken: Joi.string().regex(/\S+\.\S+\.\S+/).required(),
    userId: (Joi as any).objectId().required()
})

const credentialsUpdateSchema = Joi.object<methodsData.credentialsUpdate>().keys({
    currentCrdentials: loginSchema.required(),
    credentialsUpdate: Joi.object<methodsData.login>().keys({
        email: Joi.string().email(),
        password: Joi.string().min(6).max(30)
    }).or('mail', 'password').required()
});

export default function getValidationSchema(schemaType: 'login' | 'refresh' | 'credentialsUpdate'): Joi.Schema {
    switch (schemaType) {
        case 'login':
            return loginSchema;
        case 'refresh':
            return refreshSchema;
        case 'credentialsUpdate':
            return credentialsUpdateSchema;
    }
}