import { objectIdValidator, findProperty } from "../../../../../suport-modules/functions/validation-schemas";

import Joi from "joi";
(Joi as any).objectId = objectIdValidator;

import { WorkProperties } from "./interface";
import { methodsData } from "../../../account-modules/interface";


//inventory item change schemas
const inventoryItemChangeFilterSchema = Joi.object().keys({
    _id: findProperty((Joi as any).objectId()),

    inventoryItem: findProperty((Joi as any).objectId()),
    amountMU: findProperty((Joi as any).objectId()),
    amount: findProperty(Joi.number(), { quantitative: true, optional: false})
}).oxor('_id', 'inventoryItem', 'amountMU', 'amount'); 
const inventoryItemChangeCreateSchema = Joi.object().keys({
    inventoryItem: (Joi as any).objectId().required(),
    amountMU: (Joi as any).objectId().required(),
    amount: Joi.number().required(),
})
const inventoryItemChangeUpdateSchema = Joi.alternatives(
    Joi.object().keys({
        add: Joi.array().min(1).items(inventoryItemChangeCreateSchema),
        remove: inventoryItemChangeFilterSchema,
    }).or('add', 'remove'),

    Joi.array().min(1).items({
        _id: (Joi as any).objectId().required(),
        update: Joi.object().keys({
            inventoryItem: (Joi as any).objectId(),
            amountMU: (Joi as any).objectId(),
            amount: Joi.number(), 
        }).or('inventoryItem', 'measureUnit', 'amount').required()
    }), 
    
    Joi.object().keys({
        propertyFilter: Joi.object().keys({
            inventoryItem: findProperty((Joi as any).objectId()),
            amountMU: findProperty((Joi as any).objectId()),
            amount: findProperty(Joi.number(), { quantitative: true, optional: false}),
        }).required(),
        update: Joi.object().keys({
            inventoryItem: (Joi as any).objectId(),
            amountMU: (Joi as any).objectId(),
            amount: Joi.number(), 
        }).or('inventoryItem', 'measureUnit', 'amount').required()
    })
)


//main schemas
const filterSchema = Joi.object<methodsData.FindFilter<WorkProperties>>().keys({
    _id: findProperty((Joi as any).objectId()),
    date: findProperty(Joi.date(), { quantitative: true, optional: false }),
    firm: findProperty((Joi as any).objectId()),
    comment: findProperty(Joi.string(), { quantitative: false, optional: true }),
    confirmed: findProperty(Joi.boolean()),
    
    workType: findProperty((Joi as any).objectId()),
    workDone: findProperty(Joi.number(), { quantitative: true, optional: false}),
    workDoneMU: findProperty((Joi as any).objectId()),

    arrival: Joi.alternatives( Joi.object().keys({
        contains: Joi.array().min(1).items(inventoryItemChangeFilterSchema),
        nContains: Joi.array().min(1).items(inventoryItemChangeFilterSchema)
    }).xor('contains', 'nContains'), Joi.object().keys({
            exists: Joi.boolean().required()
    }) ).optional(),
    spending: Joi.alternatives( Joi.object().keys({
        contains: Joi.array().min(1).items(inventoryItemChangeFilterSchema),
        nContains: Joi.array().min(1).items(inventoryItemChangeFilterSchema)
    }).xor('contains', 'nContains'), Joi.object().keys({
            exists: Joi.boolean().required()
    }) ).optional(),

    worker: findProperty((Joi as any).objectId()),
    employeePrice: Joi.object<{amount: number, currency: string}>().keys({
        amount: findProperty(Joi.number(), { quantitative: true, optional: false }),
        currency: findProperty(Joi.string().pattern(/\p{Sc}/))
    }).or('amount', 'currency').optional(),
    fieldNum: findProperty((Joi as any).objectId()),

    mechanism: findProperty((Joi as any).objectId(), { quantitative: false, optional: true}),
    innerNum: findProperty((Joi as any).objectId(), { quantitative: false, optional: true }),
    outfit: findProperty((Joi as any).objectId(), { quantitative: false, optional: true }),
    
    fuelType: findProperty((Joi as any).objectId()),
    fuelSpent: findProperty(Joi.number(), { quantitative: true, optional: false}),
    fuelSpentMU: findProperty((Joi as any).objectId())
});

const createSchema = Joi.object<methodsData.CreateOptions<WorkProperties>>().keys({
    date: Joi.date().required(),
    firm: (Joi as any).objectId().required(),
    comment: Joi.string().optional(),
    confirmed: Joi.boolean().optional(),
    
    workType: (Joi as any).objectId().required(),
    workDone: Joi.number().required(),
    workDoneMU: (Joi as any).objectId().required(),

    arrival: Joi.array().min(1).items(inventoryItemChangeCreateSchema).optional(),
    spending: Joi.array().min(1).items(inventoryItemChangeCreateSchema).optional(),

    worker: findProperty((Joi as any).objectId()).required(),
    employeePrice: Joi.object<{amount: number, currency: string}>().keys({
        amount: Joi.number().required(),
        currency: findProperty(Joi.string().pattern(/\p{Sc}/)).required()
    }).optional(),
    fieldNum: (Joi as any).objectId().optional(),

    mechanism: (Joi as any).objectId(),
    innerNum: (Joi as any).objectId(),
    outfit: (Joi as any).objectId().optional(),

    fuelType: (Joi as any).objectId().required(),
    fuelSpent: Joi.number().required(),
    fuelSpentMU: (Joi as any).objectId().required()
}).xor('mechanism', 'innerNum')

const updateSchema = Joi.object<methodsData.UpdateOptions<WorkProperties>>().keys({
    filter: filterSchema.required(),
    update: Joi.object<methodsData.UpdateOptions<WorkProperties>["update"]>().keys({
        date: Joi.date(),
        firm: (Joi as any).objectId(),
        comment: Joi.string(),
 
        workType: (Joi as any).objectId(),
        workDone: Joi.number(),
        workDoneMU: (Joi as any).objectId(),

        arrival: inventoryItemChangeUpdateSchema,
        spending: inventoryItemChangeUpdateSchema,

        worker: Joi.when('firm', { is: Joi.exist(), then: (Joi as any).objectId().required(), otherwise: (Joi as any).objectId() }),
        employeePrice: Joi.object<{amount: number, currency: string}>().keys({
            amount: Joi.number(),
            currency: Joi.string().pattern(/\p{Sc}/),
        }).or('amount', 'currency'),
        fieldNum: Joi.when('firm', { is: Joi.exist(), then: (Joi as any).objectId().required(), otherwise: (Joi as any).objectId() }),

        mechanism: (Joi as any).objectId(),
        innerNum: Joi.when('firm', { is: Joi.exist(), then: (Joi as any).objectId().required(), otherwise: (Joi as any).objectId() }),
        outfit: (Joi as any).objectId(),
    
        fuelType: (Joi as any).objectId(),
        fuelSpent: Joi.number(),
        fuelSpentMU: (Joi as any).objectId(),
    }).oxor('mechanism', 'innerNum')
    .or('date', 'firm', 'comment', 'confirmed', 'workType', 'workDone', 'workDoneMU',  'arrival', 'spending', 'worker', 'employeePrice', 'fieldNum', 'outfit', 'fuelType', 'fuelSpent', 'fuelSpentMU').required()
})

const removeSchema = filterSchema;

const confirmationSchema = Joi.object<methodsData.ConfirmationOptions<WorkProperties>>().keys({
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