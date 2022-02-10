import mongoose from 'mongoose';

import { ObjectId } from '../../../../suport-modules/types/primitive-types';
import { DataFilter, DataCreation, DataUpdate } from '../../../../suport-modules/types/db-operations';

export interface EntityBaseProperties {
    name: string;
    changedBy: mongoose.Types.ObjectId | string;
    description?: string
}

export interface FirmDependentEntity extends EntityBaseProperties {
    firm: mongoose.Types.ObjectId
}

export namespace entityDocsMethods {
    namespace dbMethodsData {
        export type get<EntityType> = DataFilter<EntityType>;
        export type create<EntityType> = DataCreation<EntityType>;
        export type update<EntityType> = DataUpdate<EntityType>;
        export type remove = { _id: ObjectId };
    }
    
    export interface dbInteraction <EntityProperties> {
        get(filter: dbMethodsData.get<EntityProperties>, options?: {returnRaw: boolean, firmRestrictions?: ObjectId[]}): Promise<(mongoose.HydratedDocument<EntityProperties> | EntityProperties)[]>;
        create(createOptions: dbMethodsData.create<EntityProperties>, options?: {firmRestrictions?: ObjectId[]}): Promise<mongoose.Document<any, any, EntityProperties>>;
        update(updateOptions: dbMethodsData.update<EntityProperties>, options?: {firmRestrictions?: ObjectId[]} ): Promise<void>;
        remove(RemoveOptions: dbMethodsData.remove, options: {firmRestrictions: ObjectId[], onlyConfirmedStatus?: 'false' | 'true' }): 
            Promise<{ accounts : { [accountName: string]: ObjectId[] } } | { entities: { [entitytName: string]: ObjectId[] } } | void>;
    }
    
    export interface dataValidation <EntityProperties> {
        get(data: any): dbMethodsData.get<EntityProperties>;
        create(data: any): dbMethodsData.create<EntityProperties>;
        update(data: any): dbMethodsData.update<EntityProperties>;
        remove(data: any): dbMethodsData.remove;
    }
}


export interface entitySpecs {
    isFirmDependent: boolean;
    referencePathesInEntities: { [ enttityName: string ]: { isFirmDependent: boolean, paths: string[] } };
    referencePathesInAccounts: { [ accountName: string ]: string[] };
}

export default interface Entity<EntityProperties extends EntityBaseProperties> {
    readonly entityName: string;
    readonly entitySpecs: entitySpecs;
    readonly model: mongoose.Model<EntityProperties>;

    readonly dbInteraction: entityDocsMethods.dbInteraction<EntityProperties>;

    readonly dataValidation: entityDocsMethods.dataValidation<EntityProperties>;
}
