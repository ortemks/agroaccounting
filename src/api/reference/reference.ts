import express from 'express';
import mongoose from 'mongoose';

import ReferenceInterface, { methodsData } from './modules/interface';

import Entity from './entities/entity';
import { EntityBaseProperties } from './entities/entity-modules/entity-class/entity-interface';

import  inventoryItem from './entities/entitiy-types.ts/inventory-item';
import  measureUnit from './entities/entitiy-types.ts/measure-unit';
import  measurement from './entities/entitiy-types.ts/measurement';
import  mechanism from './entities/entitiy-types.ts/mechanism';
import  outfit from './entities/entitiy-types.ts/outfit';
import  provider from './entities/entitiy-types.ts/provider';
import  workType from './entities/entitiy-types.ts/work-type';
import  workingPost from './entities/entitiy-types.ts/working-post';

import fieldNumber from './entities/entitiy-types.ts/firm-dependent_entities/field-number';
import mechanismInnerNumber from './entities/entitiy-types.ts/firm-dependent_entities/meacnahism_inner-number';
import worker from './entities/entitiy-types.ts/firm-dependent_entities/worker';

import setRouter from "./modules/router";
import Joi, { Schema } from 'joi';
import getValidationSchema from './modules/validation-schemas';

type unknownEntity = EntityBaseProperties & { [field: string]: any }


class Reference implements ReferenceInterface {
    private static ReferenceInstance: Reference;

    public readonly router: express.Router = express.Router();

    public readonly EntityBaseModel = Entity.EntityBaseModel;
    public readonly FirmDependentEntityModel = Entity.FirmDependentEntityModel;

    public readonly entities = {
        inventoryItem: inventoryItem,
        measureUnit: measureUnit,
        measurement: measurement,
        mechanism: mechanism,
        outfit: outfit,
        provider: provider,
        workType: workType,
        workingPost: workingPost,
        fieldNumber: fieldNumber,
        mechanismInnerNumber: mechanismInnerNumber,
        worker: worker 
    } 

    validationSchemas: { 
        findAllEntities: Schema<any>; 
    } = {
        findAllEntities: getValidationSchema('getAllEntities')
    };

    dataValidation: { 
        findAllEntities (this: Reference, data: any) : methodsData.findAllEntitiesFilter; 
    } = {
        findAllEntities (this: Reference, data) {
            let validData = Joi.attempt( data, this.validationSchemas.findAllEntities, {stripUnknown: true} );
            return validData;
        }
    };

    constructor () {
        if ( Reference.ReferenceInstance ) return Reference.ReferenceInstance

        let entities = this.entities;
        for (let entityName in entities) {
            let entity = (entities as { [key: string]: Entity<any> })[entityName];

            entity.model.schema.eachPath( (pathName, pathType) => {
                let ref = pathType.options.ref ? pathType.options.ref : (pathType as any).caster?.options.ref;
                if (ref) {
                    try {
                        let entityReferenced = this.getEntity(ref);
                        entityReferenced.addReferencePathInEntity(entity.entityName, entityReferenced.entitySpecs.isFirmDependent, pathName);
                        return
                    } catch (err) {
                        return
                    }
                };
            } )
        }

        setRouter.call(this, this.router);

        Reference.ReferenceInstance = this;
    }

    public getEntity ( entityName: string ): Entity<unknownEntity> {
        entityName = entityName[0].toLowerCase() + entityName.slice(1);
        let requestedEntity = (this.entities as { [key: string]: Entity<any> })[entityName];
        if (!requestedEntity) throw new Error(`entity with name: ${entityName} doesn't exists`);
        return requestedEntity
    }

    public async getAllEntitiesDocs( findFilter: methodsData.findAllEntitiesFilter, options: { firmRestrictions?: Array<mongoose.Types.ObjectId | string>, returnRaw?: boolean } = { returnRaw: true } ): Promise<unknownEntity[]> {
        let filter: mongoose.FilterQuery<methodsData.findAllEntitiesFilter> = findFilter;

        for ( let key in filter ) {
            let filterProperty = filter[key];

            if (typeof filterProperty === 'object' && !(filterProperty instanceof mongoose.Types.ObjectId) ) {
                for ( let key in filterProperty ) {
                    filterProperty[`$${key}`] = filterProperty[key];
                    delete filterProperty[key];
                }
            }
        }
        let firmRestrictions = options.firmRestrictions;
        if (firmRestrictions && firmRestrictions.length > 0) {
            if (filter.firm) {
                filter.$and = [ { firm : { $in: firmRestrictions } }, { firm: findFilter.firm } ];
            } else {
                filter.$or = [ { firm : { $in: firmRestrictions } }, { firm: { $exists: false } } ];
            }
        }

        return await Entity.EntityBaseModel.find(findFilter, {}, { lean: options.returnRaw });
    }
}

export default Reference

