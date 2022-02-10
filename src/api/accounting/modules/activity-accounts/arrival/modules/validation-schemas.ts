import { objectIdValidator, findProperty } from "../../../../../suport-modules/functions/validation-schemas";

import Joi from "joi";
(Joi as any).objectId = objectIdValidator;

import { ArrivalProperties } from "./interface"
import { methodsData } from "../../../account-modules/interface";



const filterSchema = Joi.object<methodsData.FindFilter<ArrivalProperties>>().keys({
    _id: findProperty((Joi as any).objectId()).optional(),
    date: findProperty(Joi.date(), {quantitative: true, optional: false}),
    firm: findProperty((Joi as any).objectId()),
    comment: findProperty(Joi.string(), {quantitative: false, optional: true}),
    confirmed: findProperty(Joi.boolean()),
        
    inventoryItem: findProperty((Joi as any).objectId()),
    arrived: findProperty(Joi.number(), {quantitative: true, optional: false}),
    arrivedMU: findProperty((Joi as any).objectId()),
    
    price: Joi.object<{amount: number, currency: string}>().keys({
        amount: findProperty(Joi.number(), {quantitative: true, optional: false}),
        currency: findProperty(Joi.string().pattern(/\p{Sc}/))
    }).optional(),
    
    worker: findProperty((Joi as any).objectId()),
    provider: findProperty((Joi as any).objectId())
})


const createSchema = Joi.object<methodsData.CreateOptions<ArrivalProperties>>().keys({
    date: Joi.date().required(),
    firm: (Joi as any).objectId().required(),
    comment: Joi.string().optional(),
    confirmed: Joi.boolean().optional(),
    
    inventoryItem: (Joi as any).objectId().required(),
    arrived: Joi.number().required(),
    arrivedMU: (Joi as any).objectId().required(),

    price: Joi.object<{amount: number, currency: string}>().keys({
        amount: Joi.number(),
        currency: Joi.string().pattern(/\p{Sc}/).required()
    }).required(),

    worker: (Joi as any).objectId().required(),
    provider: (Joi as any).objectId().required()
})

const updateSchema = Joi.object<methodsData.UpdateOptions<ArrivalProperties>>().keys({
    filter: filterSchema.required(),
    update: Joi.object().keys({
        date: Joi.date(),
        firm: (Joi as any).objectId(),
        comment: Joi.string(),
        
        inventoryItem: (Joi as any).objectId(),
        arrived: Joi.string(),
        arrivedMU: (Joi as any).objectId(),
    
        price: Joi.object<{amount: number, currency: string}>().keys({
            amount: findProperty(Joi.number(), { quantitative: true, optional: false }),
            currency: Joi.string().pattern(/\p{Sc}/)
        }).or('amount', 'price'),
    
        worker: Joi.when('firm', { is: Joi.exist(), then: (Joi as any).objectId().required(), otherwise: (Joi as any).objectId() }),
        provider: (Joi as any).objectId()
    }).or('date', 'firm', 'comment',  'inventoryItem', 'arrived', 'arrivedMU', 'price',  'worker', 'provider').required()
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