import mongoose from "mongoose";
import express from "express";
import Joi from "joi";

import Entity from "../entities/entity";
import { EntityBaseProperties, FirmDependentEntity } from "../entities/entity-modules/entity-class/entity-interface";

type unknownEntity = EntityBaseProperties & { [field: string]: any }

export namespace methodsData {
    export type findAllEntitiesFilter = { _id?: mongoose.Types.ObjectId, entityName: string } & Partial<FirmDependentEntity>;
}

export default interface Reference {
    entities: { [ entityName: string ]: Entity<any> }
    router: express.Router;

    validationSchemas: {
        findAllEntities: Joi.Schema
    }

    dataValidation: {
        findAllEntities (data: any ): methodsData.findAllEntitiesFilter;
    }


    getEntity ( entityName: string ): Entity<unknownEntity>
    getAllEntitiesDocs( findFilter: methodsData.findAllEntitiesFilter, options: { firmRestrictions?: Array<mongoose.Types.ObjectId | string>, returnRaw?: boolean } ): Promise<unknownEntity[]> 
}