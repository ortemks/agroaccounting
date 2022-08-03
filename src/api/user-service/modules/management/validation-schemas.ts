import { objectIdValidator, findProperty } from '../../../suport-modules/functions/validation-schemas';

import Joi from 'joi';
(Joi as any).objectId = objectIdValidator

import { methodsData } from './interface';
import { UserProperties, UserRole } from '../user-interface';

const userRoles: UserRole[] = ['Checkman', 'Administrator', 'Chief'];

const registerSchema = Joi.object<methodsData.register>().keys({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(30).required(),
    role: Joi.string().valid(...userRoles).required(),
    firm: Joi.array().items((Joi as any).objectId()).optional(),
    banned: Joi.boolean().optional()
})
const updateUserSchema = Joi.object<methodsData.updateUser>().keys({
    _id: (Joi as any).objectId().required(),
    update: Joi.object<Partial<UserProperties>>().keys({
        email: Joi.string().email().optional(),
        password: Joi.string().min(6).max(30).optional(),
        role: Joi.string().valid(...userRoles),
        firm: Joi.array().min(1).items((Joi as any).objectId()).unique(),
        banned: (Joi as any).objectId()
    }).or('mail', 'password', 'role', 'firms', 'banned')
});

const removeUserSchema = Joi.object<methodsData.removeUser>().keys({
    _id: (Joi as any).objectId().required()
})


export default function getValidationSchema(schemaType: 'register' | 'updateUser' | 'removeUser'): Joi.Schema {
    switch (schemaType) {
        case 'register':
            return registerSchema;
        case 'updateUser':
            return updateUserSchema;
        case 'removeUser':
            return removeUserSchema;
    }
}