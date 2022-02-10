import mongoose from 'mongoose';
import Joi from 'joi'; 
import express from 'express';

import { ObjectId } from '../../suport-modules/types/primitive-types';
import firmRestrictions from '../../suport-modules/functions/firm-restrictions';
import bindMethods from '../../suport-modules/functions/bind-methods';

import setRouter from './entity-modules/entity-class/router';
import EntityInterface, { entityDocsMethods, entitySpecs, EntityBaseProperties }  from './entity-modules/entity-class/entity-interface';
import getValidationSchema from "./entity-modules/entity-class/validation-schema";
import EntityBaseModel, { FirmDependentEntityModel, firmDependentEntitySchema } from './entity-modules/entity-class/mongoose-model';


export default class Entity<T extends EntityBaseProperties> implements EntityInterface<T>{
    // Entity class static fields:
    public static readonly EntityBaseModel = EntityBaseModel;
    public static readonly FirmDependentEntityModel = FirmDependentEntityModel;
    
    // Entity instance fields:
    public readonly entityName;
    public readonly entitySpecs: entitySpecs = {
        referencePathesInEntities: {},
        referencePathesInAccounts: {},
        isFirmDependent: false
    };
    public readonly model: mongoose.Model<T>;
    public readonly router: express.Router = express.Router();

    private entitiesArrayReference: string[] = [];

    public readonly dbInteraction: entityDocsMethods.dbInteraction<T> = {
        get: async function (this: Entity<T>, filter, options = { returnRaw: true }) {
            let queryFilter = filter as mongoose.FilterQuery<T>;
            for (let key in filter) {
                
                if (this.entitiesArrayReference.includes(key)) {
                    let field = queryFilter[key];
                    if (typeof field === 'object' && !(field instanceof mongoose.Types.ObjectId)) {
                        if (field.includes) {
                            field.$all = field.includes;
                            delete field.includes;
                        }
                        if (field.nIncludes) {
                            field.$not = { $all: field.nIncludes } 
                            delete field.nIncludes
                        }
                    }
                };

                let field = queryFilter[key];
                if (typeof field === 'object' && !(field instanceof mongoose.Types.ObjectId)) {
                    if (field.in) {
                        field.$in = field.in;
                        delete field.in;
                    }
                    if (field.nIn) {
                        field.$nin = field.nIn 
                        delete field.nIn
                    }
                }

            }

            let firmRestrictions = options.firmRestrictions;
            if (firmRestrictions && firmRestrictions.length > 0) this.firmRestrictions.onFind(queryFilter, firmRestrictions);

            return await this.model.find(queryFilter, {}, { lean: options.returnRaw }) as Array<mongoose.HydratedDocument<T> | T>;
        },

        create: async function (this: Entity<T>, createOptions, options = {} ) {
            let firmRestrictions = options.firmRestrictions;
            if (firmRestrictions && firmRestrictions.length > 0) this.firmRestrictions.onSet(createOptions, firmRestrictions);

            return await this.model.create(createOptions);
        },

        update: async function (this: Entity<T>, updateOptions, options = {} ) {
            let queryFilter = updateOptions.filter as mongoose.FilterQuery<T>;
            let queryUpdate = updateOptions.update as mongoose.UpdateQuery<T>;

            this.entitiesArrayReference.forEach( (entityName) => {
                let field: { add?: Array<any>, remove?: Array<any>, [key : string]: any } | undefined = queryUpdate[entityName];
                if (field) {
                    if (field.add) {
                        field.$addToSet = { $each: field.add };
                        delete field.add;
                    }
                    if (field.remove) {
                        field.$pull = { $each: field.remove }
                        delete field.remove
                    }
                }
            });
            
            let firmRestrictions = options.firmRestrictions;
            if (firmRestrictions && firmRestrictions.length > 0) {
                this.firmRestrictions.onFind(queryFilter, firmRestrictions);
                this.firmRestrictions.onSet(queryUpdate, firmRestrictions)
            }

            await this.model.updateMany( queryFilter, updateOptions.update, { runValidators: true } )
        },

        remove: async function (this: Entity<T>, removeOptions, options ) {
            let firmRestrictions = options.firmRestrictions;
            if (firmRestrictions?.length > 0) this.firmRestrictions.onFind(removeOptions, firmRestrictions);

            let entityDeleted = await this.model.findOne(removeOptions, { _id: 1 });
            if (!entityDeleted) throw { value: removeOptions._id, name: `${this.entityName} with passed id doesn't exist`, type: `BAD ID`} 

            let referencePathsInEntities = this.entitySpecs.referencePathesInEntities;
            if (Object.keys(referencePathsInEntities).length > 0) {
                console.log(referencePathsInEntities)
                let dependentEntitiesSearches: Promise<any>[] = [];

                for ( let entityName in referencePathsInEntities ) {
                    let entityReferenceInf = referencePathsInEntities[entityName];

                    let dependentEntityFilter: { entityName: string, [ pathName: string ]: ObjectId} = { entityName: entityName };
                    entityReferenceInf.paths.forEach( pathName => dependentEntityFilter[pathName] = (entityDeleted as any)._id );

                    dependentEntitiesSearches.push( new Promise( async function (resolve, reject) {
                        let entities = await EntityBaseModel.find(dependentEntityFilter, { _id: 1, firm: 1 } );

                        if (firmRestrictions?.length > 0 && entityReferenceInf.isFirmDependent) {
                            let forbiddenFirmEntity = entities.find( ( entity: any ) => !firmRestrictions.includes(entity.firm) )
                            if (forbiddenFirmEntity) reject( { value: (entityDeleted as any)._id, name: `entity with id: ${forbiddenFirmEntity._id} which refers to deleted entity depends to forbidden firm`, type: `FIRM RESTRICTIONS ERROR`} )
                        }

                        resolve( { [entityName]: entities.map( entity => entity._id ) } )
                    } ) )
                }

                let dependentEntities: { [ entityName: string]: ObjectId[] } = {};
                ( await Promise.all(dependentEntitiesSearches) ).forEach( entityData => {
                    console.log(entityData);
                    for ( let entityName in entityData ) {
                        let dependentEntityReferencedDocs: ObjectId[] = entityData[entityName];
                        if (dependentEntityReferencedDocs.length > 0) dependentEntities[entityName] = entityData[entityName];
                    }
                });

                if (Object.keys(dependentEntities).length > 0) return { entities: dependentEntities }
            }

            let referencePathsInAccounts = this.entitySpecs.referencePathesInAccounts;
            if ( Object.keys(referencePathsInAccounts).length > 0 ) {
                let dependentAccountsSearches: Promise<any>[] = [];
                console.log(referencePathsInAccounts)
                
                for ( let accountName in referencePathsInAccounts ) {
                    let accountReferencePaths = referencePathsInAccounts[accountName];
                    let AccountModel = mongoose.models[accountName];

                    let dependentAccountFilter: { [ pathName: string ]: ObjectId } = {};
                    accountReferencePaths.forEach( pathName => dependentAccountFilter[pathName] = (entityDeleted as any)._id );

                    dependentAccountsSearches.push( new Promise( async function (resolve, reject) {
                        let dependentAccounts = await AccountModel.find(dependentAccountFilter, { _id: 1, firm: 1, confirmed: 1 }).lean();
                        
                        if ( options.onlyConfirmedStatus || firmRestrictions?.length > 0 ) {
                            dependentAccounts.forEach( dependentAccount => {
                                if ( firmRestrictions?.length > 0 ? !firmRestrictions.includes(dependentAccount.firm) : false ) 
                                    reject( { value: (entityDeleted as any)._id, name: `entity with passed id already referenced in account belongs to forbidden firm`, type: 'FIRM RESTRICTIONS ERROR' });
                                if ( options.onlyConfirmedStatus ? dependentAccount.confirmed.toString !== options.onlyConfirmedStatus : false )
                                    reject( { value: (entityDeleted as any)._id, name: `entity with passed id already referenced in account with confirmed status that doesn't equal to ${options.onlyConfirmedStatus}`, type: 'ACCOUNT CONFIRMATION ERROR' });
                            } ) 
                        }

                        resolve( { [accountName]: dependentAccounts.map( account => account._id ) })
                    } ) )
                }

                let dependentAccounts: { [accontName: string]: ObjectId[] } = {};
                ( await Promise.all(dependentAccountsSearches) ).forEach( accountData => {
                    for ( let accountName in accountData ) {
                        let dependentAccountReferencedDocs: ObjectId[] = accountData[accountName];
                        if (dependentAccountReferencedDocs.length > 0) dependentAccounts[accountName] = dependentAccountReferencedDocs;
                    }
                } );

                if (Object.keys(dependentAccounts).length > 0) return { accounts: dependentAccounts };
            }

            await entityDeleted.delete();
        }
    };

    public dataValidation: entityDocsMethods.dataValidation<T> = {
        get: function (this: Entity<T>, data) {
            return Joi.attempt(data, this.validationSchemas.get, { stripUnknown: true } )            
        },
        create: function(this: Entity<T>, data) {
            return Joi.attempt(data, this.validationSchemas.create, { stripUnknown: true } );
        },
        update: function(this: Entity<T>, data) {
            return Joi.attempt(data, this.validationSchemas.update, { stripUnknown: true }  );
        },
        remove: function(this: Entity<T>, data) {
            return Joi.attempt(data, this.validationSchemas.remove, { stripUnknown: true} );
        }
    };

    private validationSchemas: {
        get: Joi.Schema;
        create: Joi.Schema;
        update: Joi.Schema;
        remove: Joi.Schema;
    };

    firmRestrictions = firmRestrictions;

    // Entity Instance constructor:
    constructor (name: string, schema: mongoose.Schema<T>, options = { isFirmDependent: false }) {
        //setting entity name
        let capitalizedName = name[0].toUpperCase() + name.slice(1);
        this.entityName = capitalizedName;


        //setting options
        this.entitySpecs.isFirmDependent = options.isFirmDependent;

  
        if (this.entitySpecs.isFirmDependent) {
            schema.add(firmDependentEntitySchema)
        }

        this.model = Entity.EntityBaseModel.discriminator<T>(this.entityName, schema, this.entityName);

        //setting array fields options and getting referenced entites
        schema.eachPath( (pathName: string, pathType: any) => {
            if (pathType.caster instanceof mongoose.SchemaTypes.ObjectId ) {
                this.entitiesArrayReference.push(pathName);
            }
            if (pathType instanceof mongoose.SchemaTypes.Array && (pathType as any).caster.isRequired) {
                (pathType as any).validators.push( {
                    validator: function (value: Array<any>) {
                        return value.length > 0
                    },
                    message: `Array length can't be less than 0`,
                    type: `BAD VALUE`
                } )
            }
        })

        //seting validation schemas

        this.validationSchemas = {
            get: getValidationSchema(this.model.schema, 'get'),
            create: getValidationSchema(this.model.schema, 'create'),
            update: Joi.object().keys({
                filter: getValidationSchema(this.model.schema, 'get').required(),
                update: getValidationSchema(this.model.schema, 'update').required()
            }),
            remove: getValidationSchema(this.model.schema, 'remove')
        }

        bindMethods.call(this, this.dbInteraction as any);
        bindMethods.call(this, this.dataValidation as any);
        bindMethods.call(this, this.firmRestrictions as any);

        setRouter.call(this, this.router, this.entitySpecs.isFirmDependent);
    }

    public addReferencePathInAccount ( accountName: string, ...referncePathes: string[] ) {
        if (!this.entitySpecs.referencePathesInAccounts[accountName]) this.entitySpecs.referencePathesInAccounts[accountName] = [];

        this.entitySpecs.referencePathesInAccounts[accountName] = this.entitySpecs.referencePathesInAccounts[accountName].concat( referncePathes as string[] );
    }

    public addReferencePathInEntity ( entityName: string, isFirmDependent: boolean, ...referncePathes: string[]  ) {
        if (!this.entitySpecs.referencePathesInEntities[entityName]) { 
            this.entitySpecs.referencePathesInEntities[entityName] = { isFirmDependent, paths: [] };
        }

        this.entitySpecs.referencePathesInEntities[entityName].paths = this.entitySpecs.referencePathesInEntities[entityName].paths.concat( referncePathes as string[] );
    }
}