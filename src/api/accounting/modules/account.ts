import Joi from "Joi";
import mongoose from "mongoose";
import express from "express";

import AccountInterface, { BaseAccountProperties, methodsData } from "./account-modules/interface";

import firmRestrictions from "../../suport-modules/functions/firm-restrictions";
import bindMethods from "../../suport-modules/functions/bind-methods";

import Reference from "../../reference/reference";
import { ObjectId } from "../../suport-modules/types/primitive-types";
const reference = new Reference();

export function setEntitesReferences (accountName: string, schema: mongoose.Schema) {
    schema.eachPath( ( pathName: string, pathType: any) => {
        let ref = pathType.options.ref;
        if (ref) {
            try {
                let entityReferenced = reference.getEntity(ref);
                entityReferenced.addReferencePathInAccount(accountName, pathName);
                return
            } catch (err) {
                return
            }
        } 

        let embeddedSchema = pathType.Schema;
        if (embeddedSchema) {
            embeddedSchema.eachPath( ( embeddedPathName: string, pathType: any) => {
                let ref = pathType.options.ref;
                if (ref) {
                    try {
                        let entityReferenced = reference.getEntity(ref);
                        entityReferenced.addReferencePathInAccount(accountName, pathName + '.' + embeddedPathName);
                        return
                    } catch (err) {
                        return
                    }
                } 
            }) 
        }

        let arraySchema = pathType.caster?.schema;
        if (arraySchema) {
            arraySchema.eachPath( ( embeddedPathName: string, pathType: any) => {
                let ref = pathType.options.ref;
                if (ref) {
                    try {
                        let entityReferenced = reference.getEntity(ref);
                        entityReferenced.addReferencePathInAccount(accountName, pathName + '.' + embeddedPathName);
                        return;
                    } catch (err) {
                        return
                    }
                } 
            }) 
        }
    })
}

export default abstract class Account <T extends BaseAccountProperties> implements AccountInterface<T> {
    abstract model: mongoose.Model<any>;
    abstract entitySpecs: { 
        subDocumentProps: string[]
    }

    public router = express.Router()
    protected firmRestrictions = firmRestrictions;

    dataValidation = {
        get: function (this: Account<T>, data: any): methodsData.FindFilter<T> {
            let validData = Joi.attempt( data, this.validationSchemas.get, {stripUnknown: true} );
            return validData;
        },
        create: function (this: Account<T>, data: any): methodsData.CreateOptions<T> {
            let validData = Joi.attempt( data, this.validationSchemas.create, {stripUnknown: true} );
            return validData;
        },
       update: function (this: Account<T>, data: any): methodsData.UpdateOptions<T> {
            let validData = Joi.attempt( data, this.validationSchemas.update, {stripUnknown: true} );
            return validData;
        },
        remove: function (this: Account<T>, data: any): methodsData.RemoveOptions<T> {
            let validData = Joi.attempt( data, this.validationSchemas.remove, {stripUnknown: true} );
            return validData;
        },
        confirmation: function (this: Account<T>, data: any): methodsData.ConfirmationOptions<T> {
            let validData = Joi.attempt( data, this.validationSchemas.confirmation, {stripUnknown: true} );
            return validData;
        }
    }

    abstract validationSchemas: {
        get: Joi.Schema,
        create: Joi.Schema,
        update: Joi.Schema,
        remove: Joi.Schema,
        confirmation: Joi.Schema
    }
    
    constructor() {
        bindMethods.call(this, this.dataValidation);
        bindMethods.call(this, this.firmRestrictions);
        
        this.getDocs = this.getDocs.bind(this);
        this.createDoc = this.createDoc.bind(this);
        this.updateDocs = this.updateDocs.bind(this);
        this.removeDocs = this.removeDocs.bind(this);
        this.confirmDocs = this.confirmDocs.bind(this);
        this.disConfirmDocs = this.disConfirmDocs.bind(this);
    }

    // interaction with DB / main methods
    abstract createDoc (createOptions: methodsData.CreateOptions<T>, options: { firmRestrictions?: ObjectId[], disCnfirmedOnly?: boolean } ): Promise<mongoose.Document<T> | T>; 
    abstract updateDocs (updateOptions: methodsData.UpdateOptions<T>, options: { firmRestrictions?: ObjectId[], disConfirmedOnly?: boolean } ): Promise<void>;
    abstract removeDocs (removeOptions: methodsData.RemoveOptions<T>, options: { firmRestrictions?: ObjectId[], disCOnfirmedOnly?: boolean  } ): Promise<void>;
    abstract confirmDocs (confirmationFilter: methodsData.ConfirmationOptions<T>["filter"], options: { firmRestrictions?: ObjectId[] }): Promise<void>
    abstract disConfirmDocs (confirmationFilter: methodsData.ConfirmationOptions<T>["filter"], options: { firmRestrictions?: ObjectId[] }): Promise<void>

    public async getDocs(filter: methodsData.FindFilter<T>, options: { returnRaw: boolean | undefined; firmRestrictions?: ObjectId[] } = { returnRaw: true }): Promise<T | mongoose.HydratedDocument<T, {}, {}> | (T | mongoose.HydratedDocument<T, {}, {}>)[]> {
        this.setQueryFilter(filter);

        let firmRestrictions = options.firmRestrictions;
        if (firmRestrictions?.length) this.firmRestrictions.onFind(filter, firmRestrictions);

        let docs = await this.model.find(filter, {}, { lean: options.returnRaw } ).limit(6000).sort({ date: -1 });
        return docs
    }

    // converts user passed data to mongodb - understandable queries (implements firm restriction logic too)
    protected setQueryFilter (userFilter: methodsData.FindFilter<T>, disConfirmedOnly?: boolean): void {
        let filter: mongoose.FilterQuery<T> = userFilter;
        for ( let filterKey in filter ) {
            let filterProperty = (filter as any)[filterKey];
    
            if ( typeof filterProperty === 'object' && !(filterProperty instanceof mongoose.Types.ObjectId) ) {
                if (this.entitySpecs.subDocumentProps.includes(filterKey)) {
                    this.setQueryFilter(filterProperty);
                    for ( let key in filterProperty) {
                        let nestedKey = filterKey + '.' + key;
                        (filter as any)[nestedKey] = filterProperty[key];
    
                        delete filterProperty[key]
                    }
                    
                delete filter[filterKey];
                } else {
                    for ( let key in filterProperty ) {
                        filter[filterKey][`$${key}`] = filterProperty[key];
                        delete filterProperty[key];
                    }
                }
            }
        }

        if (disConfirmedOnly) filter.confirmed = false
    };

    protected setUpdateProperties (doc: mongoose.Document, update: methodsData.UpdateOptions<T>['update']): void {
        for (let updateKey in update) {
            let updatePropery = (update as any)[updateKey];
            if ( typeof updatePropery === 'object' && !(updatePropery instanceof mongoose.Types.ObjectId) ) {
                for (let key in updatePropery) {
                    (doc as any)[updateKey][key] = updatePropery[key]
                }
            }
            (doc as any)[updateKey] = updatePropery;
        }
    }
}