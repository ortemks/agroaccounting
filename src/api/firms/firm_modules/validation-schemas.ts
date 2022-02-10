import { objectIdValidator } from '../../suport-modules/functions/validation-schemas';

import Joi from 'joi'
(Joi as any).objectId = objectIdValidator;

import { firmDocsMethods, FirmProperties } from './interface';
import dbMethodsData = firmDocsMethods.dbMethodsData


let createSchema = Joi.object<dbMethodsData.create>({
    name: Joi.string().required(),
    disabled: Joi.boolean().optional()
})

let updateSchema = Joi.object<dbMethodsData.update>({
    _id: (Joi as any).objectId(),
    update: Joi.object<Partial<FirmProperties>>().keys({
        name: Joi.string(),
        disabled: (Joi as any).objectId(),
    }).or('name', 'disabled')
})

let removeSchema = Joi.object<dbMethodsData.remove>().keys({
    _id: (Joi as any).objectId().required()
});


export default function getValidationSchemas(schemaType: 'create' | 'update' | 'remove'): Joi.Schema {
    switch (schemaType) {
        case 'create':
            return createSchema;
        case 'update':
            return updateSchema;
        case 'remove':
            return removeSchema;
    }
}