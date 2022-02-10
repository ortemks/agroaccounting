import { ObjectId } from "../../../suport-modules/types/primitive-types";

import mongoose from "mongoose";

import AccountInterface, { BaseAccountProperties, methodsData } from "../account-modules/interface";
import Account from "../account";


export interface ActivityAccountInterface<T extends BaseAccountProperties> extends AccountInterface<T> {};


export default abstract class ActivityAccount<T extends BaseAccountProperties> extends Account<T> implements ActivityAccountInterface<T>{

    public async createDoc (createOptions: methodsData.CreateOptions<T>, options: { firmRestrictions?: ObjectId[], disConfirmedOnly?: boolean } = { firmRestrictions: [], disConfirmedOnly: false } ): Promise<mongoose.Document<T> | T> {
        if (options.disConfirmedOnly && createOptions.confirmed) throw { path: 'confirmed', name: `can't set confirmation status as true`, type: `BAD CREATE OPTIONS` }
        
        let firmRestrictions = options.firmRestrictions;
        if (firmRestrictions?.length) this.firmRestrictions.onSet(createOptions, firmRestrictions);

        return await this.model.create(createOptions);
    }

    public async updateDocs (updateOptions: methodsData.UpdateOptions<T>, options: { firmRestrictions?: ObjectId[], disConfirmedOnly?: boolean } = { firmRestrictions: [], disConfirmedOnly: false } ) {
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

    public async removeDocs (removeOptions: methodsData.RemoveOptions<T>, options: { firmRestrictions?: ObjectId[], disConfirmedOnly?: boolean } = { firmRestrictions: [], disConfirmedOnly: false }): Promise<void> {
        let filter = removeOptions;
        this.setQueryFilter(filter, options.disConfirmedOnly);

        let firmRestrictions = options.firmRestrictions;
        if (firmRestrictions?.length) this.firmRestrictions.onFind(filter, firmRestrictions);
        
        await this.model.deleteMany(filter)
    };

}
