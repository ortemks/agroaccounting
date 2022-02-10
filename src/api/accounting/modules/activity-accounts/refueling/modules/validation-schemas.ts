import { objectIdValidator, findProperty } from "../../../../../suport-modules/functions/validation-schemas";

import Joi from "joi";
(Joi as any).objectId = objectIdValidator;

import { RefuelingProperties } from "./interface"
import { methodsData } from "../../../account-modules/interface";


const filterSchema = Joi.object<methodsData.FindFilter<RefuelingProperties>>().keys({
    _id: findProperty((Joi as any).objectId()).optional(),
    date: findProperty(Joi.date(), {quantitative: true, optional: false}),
    firm: findProperty((Joi as any).objectId()),
    comment: findProperty(Joi.string(), {quantitative: false, optional: true}),
    confirmed: findProperty(Joi.boolean()),
        
    mechanism: findProperty((Joi as any).objectId(), {quantitative: false, optional: true}),
    innerNum: findProperty((Joi as any).objectId(), {quantitative: false, optional: true}),
    fuelOrLub: findProperty((Joi as any).objectId()),
    spent: findProperty(Joi.number(), {quantitative: true, optional: false}),
    spentMU: findProperty((Joi as any).objectId()),
})


const createSchema = Joi.object<methodsData.CreateOptions<RefuelingProperties>>().keys({
    date: Joi.date().required(),
    firm: (Joi as any).objectId().required(),
    comment: Joi.string().optional(),
    confirmed: Joi.boolean().optional(),
    
    mechanism: (Joi as any).objectId().required(),
    innerNum: (Joi as any).when('mechanism', { not: Joi.exist(), then: Joi.forbidden(), otherwise: (Joi as any).objectId().optional() }),
    fuelOrLub: (Joi as any).objectId().required(),
    spent: Joi.number().required(),
    spentMU: (Joi as any).objectId().required(),
})

const updateSchema = Joi.object<methodsData.UpdateOptions<RefuelingProperties>>().keys({
    filter: filterSchema.required(),
    update: Joi.object().keys({
        date: Joi.date(),
        firm: (Joi as any).objectId(),
        comment: Joi.string(),
        
        mechanism: (Joi as any).objectId(),
        innerNum: (Joi as any).when('mechanism', { not: Joi.exist(), then: Joi.forbidden(), otherwise: (Joi as any).objectId() }),
        fuelOrLub: (Joi as any).objectId(),
        spent: Joi.number(),
        spentMU: (Joi as any).objectId(),
    }).or('date', 'firm', 'comment',  'mechanism', 'innerNum', 'fuelOrLub', 'spent', 'spentMU').required()
})

const removeSchema = filterSchema;

const confirmationSchema = filterSchema;

export default function getValidationSchema(schemaType: 'get' | 'create' | 'update' | 'remove' | 'confirmation'):Joi.Schema {
    switch (schemaType) {
        case 'get':
            return filterSchema;
        case 'create':
            return createSchema;
        case 'update':
            return updateSchema;
        case 'remove':
            return removeSchema;
        case 'confirmation':
            return confirmationSchema;
    }
}