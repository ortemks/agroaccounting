import { objectIdValidator, findProperty } from "../../../../suport-modules/functions/validation-schemas";

import Joi from "joi";
(Joi as any).objectId = objectIdValidator;

import { InventorisationProperties } from "./interface";
import { methodsData } from "../../account-modules/interface";

const filterSchema = Joi.object<methodsData.FindFilter<InventorisationProperties>>().keys({
    _id: findProperty((Joi as any).objectId()),
    date: findProperty(Joi.date(), {quantitative: true, optional: false}),
    firm: findProperty((Joi as any).objectId()),
    comment: findProperty(Joi.string(), {quantitative: false, optional: true}),
    confirmed: findProperty(Joi.boolean()),
        
    inventoryItem: findProperty((Joi as any).objectId()),
    amount: findProperty(Joi.number(), {quantitative: true, optional: false}),
    computedAmount: findProperty(Joi.number(), {quantitative: true, optional: false}),
    amountMU: findProperty((Joi as any).objectId())
})


const createSchema = Joi.object<methodsData.CreateOptions<InventorisationProperties>>().keys({
    date: Joi.date().required(),
    firm: (Joi as any).objectId().required(),
    comment: Joi.string().optional(),
    confirmed: Joi.boolean().optional(),
    
    inventoryItem: (Joi as any).objectId().required(),
    amount: Joi.number().required(),
    amountMU: (Joi as any).objectId()
})

const updateSchema = Joi.object<methodsData.UpdateOptions<InventorisationProperties>>().keys({
    filter: filterSchema.required(),
    update: Joi.object().keys({
        date: Joi.date(),
        firm: (Joi as any).objectId(),
        comment: Joi.string(),
        
        inventoryItem: (Joi as any).objectId(),
        amount: Joi.number(),
        amountMU: (Joi as any).objectId()
    }).or('date', 'firm', 'comment',  "inventoryItem", "amont", "amountMU").required()
})

const removeSchema = filterSchema;

const confirmationSchema = Joi.object<methodsData.ConfirmationOptions<InventorisationProperties>>().keys({
    confirm: Joi.boolean().required(),
    filter: filterSchema
});

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