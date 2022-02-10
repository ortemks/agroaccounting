import mongoose from "mongoose";
import express from "express";
import Joi from "joi";

import { ObjectId } from "../../../suport-modules/types/primitive-types";
import { DataFilter, DataUpdate, DataCreation } from "../../../suport-modules/types/db-operations";

export interface BaseAccountProperties {
    date: Date,
    firm: ObjectId,
    confirmed: boolean,
    comment?: string
}

export namespace methodsData {
    export type FindFilter<T extends BaseAccountProperties> = DataFilter<T>
    
    export type CreateOptions<T extends BaseAccountProperties> = DataCreation<T, "_id">;

    export type UpdateOptions<T extends BaseAccountProperties> = DataUpdate<T, "_id" | "confirmed">

    export type RemoveOptions<T extends BaseAccountProperties> = FindFilter<T>;

    export type ConfirmationOptions<T extends BaseAccountProperties> = { 
        confirm: boolean,
        filter: FindFilter<T>
    };
}

export default interface Account <T extends BaseAccountProperties> {
    model: mongoose.Model<any>;
    router: express.Router;
    entitySpecs: { 
        subDocumentProps: string[]
    };

    validationSchemas: {
        get: Joi.Schema,
        create: Joi.Schema,
        update: Joi.Schema,
        remove: Joi.Schema,
        confirmation: Joi.Schema
    }

    dataValidation: {
        get: (data: any) => methodsData.FindFilter<T> ;
        create: (data: any) => methodsData.CreateOptions<T> ;
        update: (data: any) => methodsData.UpdateOptions<T> ;
        remove: (data: any) => methodsData.RemoveOptions<T> ;
        confirmation: (data: any) =>  methodsData.ConfirmationOptions<T> 
    }

    getDocs(filter: methodsData.FindFilter<T>, options: { returnRaw: boolean | undefined; firmRestrictions?: ObjectId[]; }): Promise<T | mongoose.HydratedDocument<T, {}, {}> | (T | mongoose.HydratedDocument<T, {}, {}>)[]>
    createDoc (createOptions: methodsData.CreateOptions<T>, options: { firmRestrictions?: ObjectId[], disConfirmedOnly?: boolean } ): Promise<mongoose.Document<T> | T>; 
    updateDocs (updateOptions: methodsData.UpdateOptions<T>, options: { firmRestrictions?: ObjectId[], disConfirmedOnly?: boolean } ): Promise<void>;
    removeDocs (removeOptions: methodsData.RemoveOptions<T>, options: { firmRestrictions?: ObjectId[], disConfirmedOnly?: boolean } ): Promise<void>;
    confirmDocs (confirmationFilter: methodsData.ConfirmationOptions<T>["filter"], options: { firmRestrictions?: ObjectId[] } ): Promise<void>;
    disConfirmDocs (confirmationFilter: methodsData.ConfirmationOptions<T>["filter"], options: { firmRestrictions?: ObjectId[] } ): Promise<void>
}