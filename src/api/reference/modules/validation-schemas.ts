import Joi from "joi";
import { objectIdValidator } from "../../suport-modules/functions/validation-schemas";
(Joi as any).objectId = objectIdValidator;

import { methodsData } from "./interface";

function findProperty(JoiSchema: Joi.Schema, schemaType = { optional: false, quantitative: false}): Joi.Schema {
    let alternatives = [ Joi.object().keys({
        in: Joi.array().min(1).items(JoiSchema),
        nin: Joi.array().min(1).items(JoiSchema),
    }), JoiSchema ];

    if (schemaType.quantitative) {
       (alternatives[0] as Joi.ObjectSchema).keys({
            gte: JoiSchema,
            lte: JoiSchema
        }).oxor('in', 'nin').oxor('lte', 'in').oxor('gte', 'in').or('in', 'nin', 'gte', 'lte') 
    } else {
        (alternatives[0] as Joi.ObjectSchema).xor('in', 'nin')
    }

    if (schemaType.optional) {
        alternatives.push( Joi.object().keys({
            exists: Joi.boolean().required()
        }))
    }

    return Joi.alternatives(...alternatives).optional();
}

let getAllEntitiesSchema = Joi.object<methodsData.findAllEntitiesFilter>().keys({
    _id: findProperty((Joi as any).objectId()),
    name: findProperty((Joi as any).objectId()),
    firm: findProperty((Joi as any).objectId(), { quantitative: false, optional: true }),
    changedBy: findProperty((Joi as any).objectId()),
    entityName: findProperty(Joi.string())
})

export default function getValidationSchema(schemaType: 'getAllEntities'): Joi.Schema {
    switch (schemaType) {
        case 'getAllEntities':
            return getAllEntitiesSchema
    }
}