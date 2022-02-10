import { Router } from "express";
import Inventorisation from "./interface";

import userService from "../../../../user-service/user-service";
import { ObjectId } from "../../../../suport-modules/types/primitive-types";
import { UserRole } from "../../../../user-service/modules/user-interface";

const auth = new userService.Auth();

export default function setRouter(this: Inventorisation, router: Router) {
    router.route('/inventoristation')
        .get( async (req, res, next) => {
            try {
                let userFirms = res.locals.user.firms as ObjectId[];

                let validData = this.dataValidation.get(req.body);
                let remainderDocs = this.getDocs(validData, { firmRestrictions: userFirms, returnRaw: true } );

                res.status(200).json(remainderDocs);
            } catch (error) {
                next(error)
            }
        })
        .post( async (req, res, next) => {
            try { 
                let userFirms = res.locals.user.firms as ObjectId[];
                let userRole = res.locals.user.role as UserRole; 

                let validData = this.dataValidation.create(req.body);
                let newDoc = await this.createDoc(validData, { firmRestrictions: userFirms, disConfirmedOnly: (userRole === 'Checkman') });

                res.status(200).send(newDoc);
            } catch (error) {
                next(error)
            }
        })
        .patch( async (req, res, next) => {
            try {
                let userFirms = res.locals.user.firms as ObjectId[];
                let userRole = res.locals.user.role as UserRole; 

                let validData = this.dataValidation.update(req.body);
                await this.updateDocs(validData, { firmRestrictions: userFirms, disConfirmedOnly: (userRole === 'Checkman') });

                res.status(200).send(`documents succesfuly updated!`);
            } catch (error) {
                next(error)
            }
        })
        .delete( async (req, res, next) => {
            try {
                let userFirms = res.locals.user.firms as ObjectId[];
                let userRole = res.locals.user.role as UserRole; 

                let validData = this.dataValidation.remove(req.body);
                await this.removeDocs(validData, { firmRestrictions: userFirms, disConfirmedOnly: (userRole === 'Checkman') });
                
                res.status(200).send(`documents succesfuly deleted!`);
            } catch (error) {
                next(error)
            }
        })
    router.route('/inventorisation/confirmation')
        .all( auth.middlewares.authorize(['Checkman']) )
        .patch( async (req, res, next) => {
            try {
                let userFirms = res.locals.user.firms;

                let validData = this.dataValidation.confirmation(req.body);
                if (validData.confirm) { 
                    await this.confirmDocs(validData.filter, { firmRestrictions: userFirms })
                } else {
                    await this.disConfirmDocs(validData.filter, { firmRestrictions: userFirms })
                };

                res.status(200).send(`documents succesfuly ${validData.confirm ? '' : 'dis'}confirmed!`);
            } catch (error) {
                next(error)
            }
        })
}