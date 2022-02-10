import { ObjectId } from '../../suport-modules/types/primitive-types';

import mongoose from 'mongoose';
import express from 'express';

export interface FirmProperties {
    name: string,
    disabled: boolean
}

export namespace firmDocsMethods {
    export namespace dbMethodsData {
        export type create = FirmProperties;
        export type update = { _id: ObjectId, update: Partial<FirmProperties> };
        export type remove = { _id: ObjectId };
    }
    
    export interface dbInteraction {
        get( options?: { returnRaw?: boolean, firmRestrictions?: ObjectId[] } ): Promise<Array<mongoose.HydratedDocument<FirmProperties> | FirmProperties>>;
        create(createOptions: dbMethodsData.create, options?: { firmRestrictions?: ObjectId[] }): Promise<FirmProperties>;
        update(data: dbMethodsData.update, options?: { firmRestrictions?: ObjectId[] }): Promise<void>;
        remove(data: dbMethodsData.remove, options?: { firmRestrictions?: ObjectId[] }): Promise<void>;
    }
    
    export interface CRUDdataValidation {
        create(data: object): dbMethodsData.create;
        update(data: object): dbMethodsData.update;
        remove(data: object): dbMethodsData.remove;
    }
}

export default interface Firm {
    readonly model: mongoose.Model<FirmProperties>;
    readonly router: express.Router;

    dbInteraction: firmDocsMethods.dbInteraction;

    dataValidation: firmDocsMethods.CRUDdataValidation;

}

