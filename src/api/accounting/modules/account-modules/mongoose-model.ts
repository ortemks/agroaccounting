import { Model, Schema, SchemaTypes, Types, Document } from "mongoose";
import { BaseAccountProperties } from "../account-modules/interface";
import Reference from "../../../reference/reference";
import { ObjectId } from "../../../suport-modules/types/primitive-types";

// base accounting schema ( implemented via *accounting schmea*.add(baseAccountingSchema) )
export const baseAccountingScema = new Schema<BaseAccountProperties>({
    date: {
        type: SchemaTypes.Date,
        required: true,
    },
    firm: {
        type: SchemaTypes.ObjectId,
        ref: 'Firm',
        required: true
    },
    confirmed: {
        type: SchemaTypes.Boolean,
        required: false,
        default: false
    },
    comment: {
        type: SchemaTypes.String,
        required: false
    }
}, { versionKey: false })

// schema for price properties
interface Price {
    amount: number,
    currency: string
}
export const priceSchema = new Schema<Price>({
    amount: {
        type: SchemaTypes.Number,
        required: true
    },
    currency: {
        type: SchemaTypes.String,
        required: true,
    }
} )

// property and its measure unit's measurement match validation (setted on measure unit path)
const reference = new Reference();


export function schemaReferenceValidation<T> (schema: Schema, ...propertiesValidationOptions: { pathName: keyof T, depndentProperty: { pathName: keyof T, sameProperty?: { name: string, isArray?: 'validated' | 'dependent' } } }[]): void {

    function getValidationFnc (property: { name: string, model: Model<any> }, firmDependent: boolean, dependentProperty?: { name: string, model: Model<any>, sameProperty?: { name: string, isArray?: 'validated' | 'dependent'  } }): (this: any) => Promise<void> {
        if (firmDependent || dependentProperty) {
            let projection: { [key: string]: boolean} = {};
            if (firmDependent) projection.firm = true;
            if (dependentProperty?.sameProperty) projection[dependentProperty.sameProperty.name] = true;

            return async function (this: any) {
                let dependentPropertyValue: any;
                if (dependentProperty) {
                    if (dependentProperty.sameProperty) {
                        dependentPropertyValue = (await dependentProperty.model.findOne( { _id: this[dependentProperty.name]}, projection))[dependentProperty.sameProperty.name];
                    } else {
                        dependentPropertyValue = (await dependentProperty.model.findOne( { _id: this[dependentProperty.name]}, projection))[dependentProperty.name];
                    }
                }
    
                let propertyData = await property.model.findOne( { _id: this[property.name] }, projection);
                if (!propertyData) throw { path: property.name, name: `${property.model.modelName} with id: ${this[property.name]} doesn't exist`, type: 'BAD ID REFERENCE'};
    
                if (firmDependent && this.firm.toString() !== propertyData.firm.toString()) throw { path: property.name, name: `${property.model.modelName} with id: ${this[property.name]} and accounting have different firms`, type: 'BAD ID REFERENCE'};

                if (dependentPropertyValue) {
                    let sameProperty = dependentProperty?.sameProperty;
                    if (sameProperty) {
                        switch (sameProperty.isArray) {
                            case 'validated':
                                if (!propertyData[sameProperty.name].map( (objectId: Types.ObjectId) => objectId.toString()).includes(dependentPropertyValue.toString())) throw { path: property.name, name: `${property.model.modelName}'s ${sameProperty.name} doesn't include ${dependentProperty?.model.modelName}'s ${sameProperty.name}`, type: 'BAD ID REFERENCE' }
                                break;
                            case 'dependent':
                                if (!dependentPropertyValue.map( (objectId: Types.ObjectId) => objectId.toString()).includes(propertyData[sameProperty.name]).toString()) throw { path: property.name, name: `${dependentProperty?.model.modelName}'s ${sameProperty.name}  doesn't include $${property.model.modelName}'s ${sameProperty.name}`, type: 'BAD ID REFERENCE' }
                                break;
                            case undefined:
                                if (propertyData[sameProperty.name].toString() !== dependentPropertyValue.toString()) throw { path: property.name, name: `${property.name} and ${dependentProperty?.name} have different ${sameProperty.name}`, type: 'BAD ID REFERENCE'}
                                break;
                        }
                    }
                }
            }
        } 
        return async function (this: any) {
            let propertyExists = await property.model.exists( { _id: this[property.name] } );
            if (!propertyExists) throw { path: property.name, name: `${property.model.modelName} with id: ${this[property.name]} doesn't exist`, type: 'BAD ID REFERENCE'};
        }
    }

    schema.eachPath( (pathName, pathType) => {
        let pathRef = pathType.options.ref;
        if (pathRef) {
            if (pathRef === 'Firm') return;
            let propertiesEntity = reference.getEntity(pathRef);
            let propertiesModel = propertiesEntity.model;

            let dependentPropertyInf;

            let additionalConditions = propertiesValidationOptions.find( property => property.pathName === pathName );
            if( additionalConditions ) {
                let dependentProperty = additionalConditions.depndentProperty;

                let dependentPropertyEntityName = schema.path(dependentProperty.pathName as string).options.ref;
                let depndentPropertyEntityModel = reference.getEntity(dependentPropertyEntityName).model;

                dependentPropertyInf = { name: dependentProperty.pathName as string, sameProperty: dependentProperty.sameProperty, model: depndentPropertyEntityModel}
            }

            let validationFnc = getValidationFnc( { name: pathName, model: propertiesModel }, propertiesEntity.entitySpecs.isFirmDependent, dependentPropertyInf );
            function pointToValidate ( this: { validationToExecute: Function[] } ) {
                if ( !this.validationToExecute ) this.validationToExecute = [];
                this.validationToExecute.push(validationFnc.bind(this))
            }
            (pathType as any).validators.push( { validator: pointToValidate } );
        }
    });

    schema.post('validate', async function ( this: { validationToExecute: Function[] } ) {
        await Promise.all(this.validationToExecute.map( validator => validator() ));
    });
}


export function convertMeasureUnits<T>(schema: Schema, ...propertiesToConvert: { amountPathName: keyof T, measureUnitPathName: keyof T}[] ) {
    let MeasureUnitModel = reference.entities.measureUnit.model;

    function getConverterFnc (amountPathName: keyof T, measureUnitPathName: keyof T): () => Promise<void> {
        return async function (this: T) {
            let measureUnit = await MeasureUnitModel.findOne( { _id: this[measureUnitPathName] }, { measurement: 1, ratio: 1 } ).populate('measurement', 'standardMeasureUnit') as any;
            let standardMeasureUnit = await MeasureUnitModel.findOne( { _id: (measureUnit.measurement).standardMeasureUnit}, { ratio: 1 } );
            
            (this[amountPathName] as unknown as number) *= measureUnit?.ratio;
            (this[measureUnitPathName] as unknown as ObjectId) = standardMeasureUnit?._id as ObjectId;
        }
    }

    propertiesToConvert.forEach( property => {
        let converterFnc = getConverterFnc(property.amountPathName, property.measureUnitPathName);
        (schema.path(property.amountPathName as string) as any).validators.push( { validator: function ( this: { convertionToExecute: Function[] } ) {
            if (!this.convertionToExecute) this.convertionToExecute = [];
            this.convertionToExecute.push(converterFnc.bind(this));
        } } )
    })

    schema.post('validate', async function (this: { convertionToExecute: Function[] }) {
        await Promise.all(this.convertionToExecute.map( converter => converter() ))
    })
}