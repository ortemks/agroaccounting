import mongoose from 'mongoose';
import express from 'express';
import Joi from 'joi';

import FirmInterface, { FirmProperties, firmDocsMethods } from './firm_modules/interface';
import FirmModel from './firm_modules/mongoose-model';
import getValidationSchemas from './firm_modules/validation-schemas';
import setRouter from './firm_modules/router';

import firmRestrictions from '../suport-modules/functions/firm-restrictions';
import bindMethods from '../suport-modules/functions/bind-methods';

import Reference from '../reference/reference';
const reference = new Reference();

import accounting from '../accounting/accounting';
const work = new accounting.Work();
const refueling = new accounting.Refueling();
const arrival = new accounting.Arrival();
const inventorisation = new accounting.Inventorisation();

export default class Firm implements FirmInterface {
    private static FirmInstance: Firm;

    public readonly model: mongoose.Model<FirmProperties> = FirmModel
    public readonly router: express.Router = express.Router();

    public readonly dbInteraction: firmDocsMethods.dbInteraction = {
        get: async function (this: Firm, options = { returnRaw: true, firmRestrictions: [] } ) {
            let filter = {};

            let firmRestrictions = options.firmRestrictions;
            if (firmRestrictions?.length) this.firmRestrictions.onFind(filter, firmRestrictions);

            return await this.model.find(filter, {}, { lean: options.returnRaw });
        },
        create: async function (this: Firm, createOptions, options = { firmRestrictions: [] }) {
            let firmRestrictions = options.firmRestrictions;
            if (firmRestrictions?.length) this.firmRestrictions.onSet(createOptions, firmRestrictions);

            let newFirm = await this.model.create(createOptions);
            return newFirm
        },
        update: async function (this: Firm, updateOptions, options = { firmRestrictions: [] }) {
            let filter = { _id: updateOptions._id };
            let update = updateOptions.update;

            let firmRestrictions = options.firmRestrictions;
            if (firmRestrictions?.length) { 
                this.firmRestrictions.onSet(updateOptions.update, firmRestrictions);
                this.firmRestrictions.onFind(filter, firmRestrictions);
            };

            let updateData = await this.model.updateOne( filter, update );
            if (!updateData.matchedCount) throw { value: updateOptions._id, name: "firm with passed id dosen't exist", type: 'BAD ID' }
        },
        remove: async function (this: Firm, removeOptions, options = { firmRestrictions: [] }) {
            let firmId = removeOptions._id;
            let filter = { _id: firmId };

            let firmRestrictions = options.firmRestrictions;
            if (firmRestrictions?.length) this.firmRestrictions.onFind(filter, firmRestrictions);

            let firmDeletedExist = await this.model.exists(filter);
            if (!firmDeletedExist) throw { value: firmId, name: "firm with passed id dosen't exist", type: 'BAD ID'}

            function existsingConfirmedAccountName(accountModel: mongoose.Model<any>) {
                return new Promise( async (resolve, reject) => {
                    let isConfirmedAccountExist = await accountModel.exists({ firm: firmId, confirmed: true });
                    if (isConfirmedAccountExist) resolve(accountModel.modelName);

                    console.log(isConfirmedAccountExist)

                    reject({})
                } )
            }

            await Promise.all([
                new Promise( async (resolve, reject) => {
                    let isFirmEntityExist = await reference.FirmDependentEntityModel.exists({ firm: firmId });
                    if (isFirmEntityExist) reject( { value: firmId, name: 'entity belongs to passed firm already exist', type: 'BAD ID'} );
                    resolve({})
                } ),
                new Promise( async (resolve, reject) => { 
                    let existingConfirmedAccountsNames = ( await Promise.allSettled([
                        existsingConfirmedAccountName(work.model),
                        existsingConfirmedAccountName(refueling.model),
                        existsingConfirmedAccountName(arrival.model),
                        existsingConfirmedAccountName(inventorisation.model)
                    ]) ).map( promiseResult => (promiseResult as any).value ).filter(Boolean);

                    if (existingConfirmedAccountsNames.length) {
                        reject( { value: firmId, name: `${existingConfirmedAccountsNames.join(', ')} belongs to passed firm already exist`, type: 'BAD ID'} );
                    }

                    resolve({})
                } )
            ])
        }
    };

    public readonly dataValidation: firmDocsMethods.CRUDdataValidation = {
        create: function (this: Firm, data) {
            return Joi.attempt(data, this.validationSchemas.create, { stripUnknown: true})
        },
        update: function (this: Firm, data) {
            return Joi.attempt(data, this.validationSchemas.update, { stripUnknown: true})
        },
        remove: function (this: Firm, data) {
            return Joi.attempt(data, this.validationSchemas.remove, { stripUnknown: true})
        }
    };

    private validationSchemas: { 
        create: Joi.Schema<any>; 
        update: Joi.Schema<any>; 
        remove: Joi.Schema<any>; 
    } = {
        create: getValidationSchemas('create'),
        update: getValidationSchemas('update'),
        remove: getValidationSchemas('remove'),
    };


    private firmRestrictions = firmRestrictions;

    constructor () {
        if (Firm.FirmInstance) return Firm.FirmInstance;

        bindMethods.call(this, this.dbInteraction);
        bindMethods.call(this, this.dataValidation);
        bindMethods.call(this, this.firmRestrictions)

        setRouter.call(this, this.router);

        Firm.FirmInstance = this;
    }
}