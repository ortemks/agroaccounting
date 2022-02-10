import { objectIdValidator } from '../../../suport-modules/functions/validation-schemas';

import Joi from 'joi';
(Joi as any).objectId = objectIdValidator;

import { methodsData } from './interface';
import { UserRole } from '../user-interface';

const authenticateSchema = Joi.object<methodsData.authenticate>().keys({
    accessToken: Joi.string().regex(/\S+\.\S+\.\S+/).required(),
    userId: (Joi as any).objectId().required()
})

const userRoles: UserRole[] = ['Checkman', 'Administrator', 'Chief'];
const authorizationSchema = Joi.object<methodsData.authorize>().keys({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(30).required(),
    role: Joi.string().valid(...userRoles).required(),
    firms: Joi.array().items((Joi as any).objectId())
})

export default function getValidationSchema(schemaType: 'authenticate' | 'authorize'): Joi.Schema {
    switch (schemaType) {
        case 'authenticate':
            return authenticateSchema;
        case 'authorize':
            return authorizationSchema;
    }
}

