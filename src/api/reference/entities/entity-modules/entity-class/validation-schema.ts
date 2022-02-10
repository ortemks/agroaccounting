import Joi from "joi";
import { objectIdValidator } from "../../../../suport-modules/functions/validation-schemas";
(Joi as any).objectId = objectIdValidator;
import mongoose from "mongoose";


export default function getValidationSchema( schema: mongoose.Schema, methodType: 'get' | 'create' | 'update' | 'remove' ): Joi.Schema {
    let propertyKeys: { [key: string]: Joi.Schema } = {};

    function setPropertyIfGet(property: Joi.Schema, isArray = false): Joi.Schema {
        if (isArray) {
            return Joi.alternatives(Joi.array().items(property), Joi.object().keys({
                contains: Joi.array().min(1).items(property),
                nContains: Joi.array().min(1).items(property),
            }).xor('contains', 'nContains'))
        }
        
        return Joi.alternatives(property, Joi.object().keys({
            in: Joi.array().items(property),
            nin: Joi.array().items(property)
        }).xor('in', 'nin'))
    }

    for (let path in schema.paths ) {
        let pathName = path;
        if (pathName === '_id' || pathName === 'entityName') continue;

        let pathType: any = schema.paths[path];

        let newProperty: Joi.Schema = Joi.any();
        switch (Object.getPrototypeOf(pathType).constructor) {
            case mongoose.SchemaTypes.String:
                newProperty = Joi.string();
                if (methodType === 'get') newProperty = setPropertyIfGet(newProperty)
                
                break;
            case mongoose.SchemaTypes.Number:
                newProperty = Joi.number()
                if (methodType === 'get') newProperty = setPropertyIfGet(newProperty)
                break;
            case mongoose.SchemaTypes.ObjectId:
                if (pathName === 'standardMeasureUnit' && methodType === 'create') {
                    newProperty = Joi.string();
                    break
                }

                newProperty = (Joi as any).objectId();
                if (methodType === 'get') newProperty = setPropertyIfGet((Joi as any).objectId());
                break;
            case mongoose.SchemaTypes.Boolean:
                newProperty = Joi.boolean();
                if (methodType === 'get') newProperty = setPropertyIfGet(newProperty)
                break;
            case mongoose.SchemaTypes.Array:
                let arrayItemType: Joi.Schema = Joi.any();

                switch (Object.getPrototypeOf(pathType.caster).constructor) {
                    case mongoose.SchemaTypes.String:
                        arrayItemType = Joi.string()
                        break;
                    case mongoose.SchemaTypes.Number:
                        arrayItemType = Joi.number()
                        break;
                    case mongoose.SchemaTypes.Boolean:
                        arrayItemType = Joi.boolean()
                        break;
                    case mongoose.SchemaTypes.ObjectId:
                        arrayItemType = (Joi as any).objectId()
                        break;
                }
                if (methodType === 'update') {
                    newProperty = Joi.object().keys({
                        add: Joi.array().min(1).items(arrayItemType),
                        remove: Joi.array().min(1).items(arrayItemType)
                    }).or('add', 'remove')
                } else if (methodType === 'get') {
                    newProperty = setPropertyIfGet(arrayItemType, true)
                } else {
                    newProperty = Joi.array().items(arrayItemType)
                }
                break;
        } 

        if (methodType === 'create' && (pathType.isRequired || pathType.caster?.isRequired) ) {
            propertyKeys[pathName] = newProperty.required();
            if (pathType.caster) propertyKeys[pathName] = (newProperty as Joi.ArraySchema).min(1).required()
        } else if (methodType === 'get') {
            propertyKeys[pathName] = newProperty.optional()
        } else {
            propertyKeys[pathName] = newProperty
        }
    }

    switch (methodType) {
        case 'get':
            return Joi.object().keys(Object.assign( { _id: (Joi as any).objectId().optional() }, propertyKeys ));
        case 'create':
            return Joi.object().keys(propertyKeys);
        case 'update':
            return Joi.object().keys(propertyKeys).or(...Object.keys(propertyKeys));
        case 'remove':
            return Joi.object().keys({ _id: (Joi as any).objectId().required() });
    } 
}

