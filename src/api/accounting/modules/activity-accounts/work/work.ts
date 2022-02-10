import { ObjectId } from "../../../../suport-modules/types/primitive-types";

import { Schema } from "joi";
import mongoose from "mongoose";
import { methodsData } from "../../account-modules/interface";

import ActivityAccount from "../activity-account";
import WorkInterface, { InventoryItemChange, WorkProperties } from "./modules/interface";
import WorkModel from "./modules/mongoose-model";
import setRouter from "./modules/router";
import getValidationSchema from "./modules/validation-schemas";
import { setEntitesReferences } from "../../account";


export default class Work extends ActivityAccount<WorkProperties> implements WorkInterface{
    private static instance: Work

    model = WorkModel;
    entitySpecs = {
        subDocumentProps: ['employeePrice']
    }

    validationSchemas: { 
        get: Schema<any>; 
        create: Schema<any>; 
        update: Schema<any>; 
        remove: Schema<any>; 
        confirmation: Schema<any>; 
    } = {
        get: getValidationSchema('get'),
        create: getValidationSchema('create'),
        update: getValidationSchema('update'),
        remove: getValidationSchema('remove'),
        confirmation: getValidationSchema('confirmation')
    };

    constructor () {
        super()

        if (Work.instance) return Work.instance;

        setRouter.call(this, this.router);
        setEntitesReferences('Work', this.model.schema);
    }

    public async confirmDocs (confirmationFilter: methodsData.ConfirmationOptions<WorkProperties>["filter"], options: { firmRestrictions?: ObjectId[] } = { firmRestrictions: [] }): Promise<void> {
        this.setQueryFilter(confirmationFilter);

        let firmRestrictions = options.firmRestrictions;
        if (firmRestrictions?.length) this.firmRestrictions.onFind(confirmationFilter, firmRestrictions);

        await this.model.updateMany(confirmationFilter, { confirmed: true });
    }

    public async disConfirmDocs (confirmationFilter: methodsData.ConfirmationOptions<WorkProperties>["filter"], options: { firmRestrictions?: ObjectId[] } = { firmRestrictions: [] }): Promise<void> {
        this.setQueryFilter(confirmationFilter);

        let firmRestrictions = options.firmRestrictions;
        if (firmRestrictions?.length) this.firmRestrictions.onFind(confirmationFilter, firmRestrictions);

        await this.model.updateMany(confirmationFilter, { confirmed: false});
    }

    protected setQueryFilter (userFilter: object): void {
        let filter: mongoose.FilterQuery<Work> = userFilter;

        for ( let filterKey in filter ) {
            let filterProperty = (filter as any)[filterKey];
    
            if ( typeof filterProperty === 'object' && !(filterProperty instanceof mongoose.Types.ObjectId) ) {

                if ( ( filterKey === 'arrival' || filterKey === 'consumption' ) && ( filterProperty.contains || filterProperty.nContains )) {
                    let orCondition: { $or: mongoose.FilterQuery<InventoryItemChange> } = { $or: [] }

                    let conditions = filterProperty.contains ? filterProperty.contains : filterProperty.nContains;
                    conditions.forEach( ( condition: Partial<InventoryItemChange> ) => {
                        this.setQueryFilter(condition);
                        orCondition.$or.push(condition);
                    })

                    let elemMatchCondition = { $elemMatch: orCondition };
                    (filter as any)[filterKey] = filterProperty.contains ? elemMatchCondition : { $not: elemMatchCondition };

                    console.log((filter as any)[filterKey]['$elemMatch'])
                    continue
                }

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
    };

    protected setUpdateProperties (doc: mongoose.Document, update: methodsData.UpdateOptions<WorkProperties>['update']): void {
        for (let updateKey in update) {
            let updateProperty = (update as any)[updateKey];

            // inventory item change block
            if ( updateKey === 'arrival' || updateKey === 'spending' ) {
                if (Array.isArray(updateProperty)) {
                    updateProperty.forEach( updateOptions => {
                        let inventoryItemChange = (doc as any)[updateKey].id(updateOptions._id); 
                        for ( let key in updateOptions.update ) {
                            inventoryItemChange[key] = updateOptions.update[key];
                        }
                    })
                } else {
                    function updateDocByFilter (propertyFilter: any) {
                        let filters: Array<(item: any) => boolean> = [];
                        for ( let key in propertyFilter ) {
                            let pathFilter = propertyFilter[key];

                            if ( typeof pathFilter !== 'object' || pathFilter instanceof mongoose.Types.ObjectId) {
                                filters.push( item => item[key] == pathFilter);
                                continue
                            }
                            if (pathFilter.in) filters.push( item => pathFilter.in.includes(item[key]));
                            if (pathFilter.nin) filters.push( item => !pathFilter.in.includes(item[key]));
                            if (pathFilter.gte) filters.push( item => item[key] >= pathFilter.gte );
                            if (pathFilter.lte) filters.push( item => item[key] >= pathFilter.lte );
                        }

                        function filter (item: any) {
                            let result = 0
                            filters.forEach( filter => result + +!filter(item));

                            return !Boolean(result)
                        }

                        (doc as any)[updateKey].forEach( (item: any) => {
                            if (filter(item)) {
                                for (let key in updateProperty.update) {
                                    item[key] = updateProperty.update[key];
                                }
                            }
                        })
                    }

                    let propertyFilter = updateProperty.propertyFilter;
                    if (propertyFilter) {
                        let filters: Array<(item: any) => boolean> = [];
                        for ( let key in propertyFilter ) {
                            let pathFilter = propertyFilter[key];

                            if ( typeof pathFilter !== 'object' || pathFilter instanceof mongoose.Types.ObjectId) {
                                filters.push( item => item[key] == pathFilter);
                                continue
                            }
                            if (pathFilter.in) filters.push( item => pathFilter.in.includes(item[key]));
                            if (pathFilter.nin) filters.push( item => !pathFilter.in.includes(item[key]));
                            if (pathFilter.gte) filters.push( item => item[key] >= pathFilter.gte );
                            if (pathFilter.lte) filters.push( item => item[key] >= pathFilter.lte );
                        }

                        function filter (item: any) {
                            let result = 0
                            filters.forEach( filter => result + +!filter(item));

                            return !Boolean(result)
                        }

                        (doc as any)[updateKey].forEach( (item: any) => {
                            if (filter(item)) {
                                for (let key in updateProperty.update) {
                                    item[key] = updateProperty.update[key];
                                }
                            }
                        })
                    } else {
                        if (updateProperty.add) {
                            updateProperty.add.forEach( (item: any) => (doc as any)[updateKey].push(item) )
                        } 
                        if (updateProperty.remove) {
                            let propertyFilter = updateProperty.remove.propertyFilter;
                            if (propertyFilter) {
                                let filters: Array<(item: any) => boolean> = [];
                                for ( let key in propertyFilter ) {
                                    let pathFilter = propertyFilter[key];
        
                                    if ( typeof pathFilter !== 'object' || pathFilter instanceof mongoose.Types.ObjectId) {
                                        filters.push( item => item[key] == pathFilter);
                                        continue
                                    }
                                    if (pathFilter.in) filters.push( item => pathFilter.in.includes(item[key]));
                                    if (pathFilter.nin) filters.push( item => !pathFilter.in.includes(item[key]));
                                    if (pathFilter.gte) filters.push( item => item[key] >= pathFilter.gte );
                                    if (pathFilter.lte) filters.push( item => item[key] >= pathFilter.lte );
                                }
        
                                function filter (item: any) {
                                    let result = 0
                                    filters.forEach( filter => result + +!filter(item));
        
                                    return !Boolean(result)
                                }
        
                                (doc as any)[updateKey].forEach( (item: any) => {
                                    if (filter(item)) item.remove()
                                })
                            } else {
                                let idFilter = updateProperty.remove._id;
                                if (typeof idFilter === 'string' || idFilter instanceof mongoose.Types.ObjectId ) {
                                    (doc as any)[updateKey].forEach( (item: any) => {
                                        if (item._id == idFilter) item.remove()
                                    });
                                } else {
                                    if (idFilter.in) {
                                        (doc as any)[updateKey].forEach( (item: any) => {
                                            if (idFilter.in.includes(item._id)) item.remove()
                                        });

                                    };
                                    if (idFilter.nin) {
                                        (doc as any)[updateKey].forEach( (item: any) => {
                                            if (!idFilter.in.includes(item._id)) item.remove()
                                        });
                                    }
                                }
                            }
                        }
                    }
                }
            }
            

            if ( typeof updateProperty === 'object' && !(updateProperty instanceof mongoose.Types.ObjectId) ) {
                for (let key in updateProperty) {
                    (doc as any)[updateKey][key] = updateProperty[key]
                }
            }
            (doc as any)[updateKey] = updateProperty;
        }
    }
}