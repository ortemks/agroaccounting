import { ObjectId } from "../../../suport-modules/types/primitive-types";

import Joi from "joi";
import mongoose from "mongoose";
import { methodsData } from "../account-modules/interface";
import Account from "../account";

import { InventorisationProperties } from "./modules/interface";
import InventorisationModel from "./modules/mongoose-model";
import getValidationSchema from "./modules/validation-schemas";
import setRouter from "./modules/router";
import { setEntitesReferences } from "../account";

export default class Inventorisation extends Account<InventorisationProperties> {
    private static instance: Inventorisation;

    model = InventorisationModel;
    entitySpecs: { subDocumentProps: (keyof InventorisationProperties)[]; } = { subDocumentProps: [] };

    validationSchemas: { 
        get: Joi.Schema<any>;
        create: Joi.Schema<any>;
        update: Joi.Schema<any>; 
        remove: Joi.Schema<any>; 
        confirmation: Joi.Schema<any>;
    } = {
        get: getValidationSchema('get'),
        create: getValidationSchema('create'),
        update: getValidationSchema('update'),
        remove: getValidationSchema('remove'),
        confirmation: getValidationSchema('confirmation')
    };

    constructor () {
        super()

        if (Inventorisation.instance) return Inventorisation.instance;

        setRouter.call(this, this.router);
        setEntitesReferences('Inventorisation', this.model.schema);
    }

    public async createDoc (createOptions: methodsData.CreateOptions<InventorisationProperties>, options: { firmRestrictions?: ObjectId[], disConfirmedOnly?: boolean } = {} ): Promise<mongoose.Document<InventorisationProperties> | InventorisationProperties> {
        if (options.disConfirmedOnly && createOptions.confirmed) throw { path: 'confirmed', name: `can't set confirmed as true on create`, type: `BAD CREATE OPTIONS`};

        let firmRestrictions = options.firmRestrictions;
        if (firmRestrictions && firmRestrictions.length > 0) this.firmRestrictions.onSet(createOptions, firmRestrictions);

        return await this.model.create(createOptions);
    }

    async updateDocs(updateOptions: methodsData.UpdateOptions<InventorisationProperties>, options: { firmRestrictions?: ObjectId[], disConfirmedOnly?: boolean }): Promise<void> {
        let filter = updateOptions.filter;
        this.setQueryFilter(filter, options.disConfirmedOnly);
        let update = updateOptions.update;

        let firmRestrictions = options.firmRestrictions;
        if (firmRestrictions?.length) {
            this.firmRestrictions.onSet(update, firmRestrictions);
            this.firmRestrictions.onFind(filter, firmRestrictions)
        }

        await this.model.find(filter).cursor().eachAsync( async (doc) => {
            this.setUpdateProperties(doc, update);
            await doc.save({ validateModifiedOnly: true});
        });
    }

    async removeDocs(removeOptions: methodsData.RemoveOptions<InventorisationProperties>, options: { firmRestrictions?: ObjectId[], disConfirmedOnly?: boolean }): Promise<void> {
        let filter = removeOptions;
        this.setQueryFilter(filter, options.disConfirmedOnly);

        let firmRestrictions = options.firmRestrictions;
        if (firmRestrictions?.length) this.firmRestrictions.onFind(filter, firmRestrictions);
        
        await this.model.deleteMany(filter);
    }

    public async confirmDocs (confirmationFilter: methodsData.ConfirmationOptions<InventorisationProperties>["filter"], options: { firmRestrictions?: ObjectId[] }): Promise<void> {
        this.setQueryFilter(confirmationFilter);

        let firmRestrictions = options.firmRestrictions;
        if (firmRestrictions?.length) this.firmRestrictions.onFind(confirmationFilter, firmRestrictions);

        await this.model.updateMany(confirmationFilter, { confirmed: true });
    }

    public async disConfirmDocs (confirmationFilter: methodsData.ConfirmationOptions<InventorisationProperties>["filter"], options: { firmRestrictions?: ObjectId[] }): Promise<void> {
        this.setQueryFilter(confirmationFilter);

        let firmRestrictions = options.firmRestrictions;
        if (firmRestrictions?.length) this.firmRestrictions.onFind(confirmationFilter, firmRestrictions);

        await this.model.updateMany(confirmationFilter, { confirmed: false});
    }
}
