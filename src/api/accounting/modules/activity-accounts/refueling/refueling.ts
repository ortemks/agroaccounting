import { ObjectId } from "../../../../suport-modules/types/primitive-types";

import { Schema } from "joi";
import { methodsData } from "../../account-modules/interface";

import ActivityAccount from "../activity-account";
import RefuelingInterface, { RefuelingProperties } from "./modules/interface";
import RefuelingModel from "./modules/mongoose-model";
import setRouter from "./modules/router";
import getValidationSchema from "./modules/validation-schemas";
import { setEntitesReferences } from "../../account";

export default class Refueling extends ActivityAccount<RefuelingProperties> implements RefuelingInterface{

    private static instance: Refueling

    model = RefuelingModel;
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

        if (Refueling.instance) return Refueling.instance;

        setRouter.call(this, this.router);
        setEntitesReferences('Refueling', this.model.schema);
    }


    public async confirmDocs (confirmationFilter: methodsData.ConfirmationOptions<RefuelingProperties>["filter"], options: { firmRestrictions?: ObjectId[] }): Promise<void> {
        this.setQueryFilter(confirmationFilter);

        let firmRestrictions = options.firmRestrictions;
        if (firmRestrictions?.length) this.firmRestrictions.onFind(confirmationFilter, firmRestrictions);

        await this.model.updateMany(confirmationFilter, { confirmed: true });
    }

    public async disConfirmDocs (confirmationFilter: methodsData.ConfirmationOptions<RefuelingProperties>["filter"], options: { firmRestrictions?: ObjectId[] }): Promise<void> {
        this.setQueryFilter(confirmationFilter);

        let firmRestrictions = options.firmRestrictions;
        if (firmRestrictions?.length) this.firmRestrictions.onFind(confirmationFilter, firmRestrictions);

        await this.model.updateMany(confirmationFilter, { confirmed: false});
    }
}