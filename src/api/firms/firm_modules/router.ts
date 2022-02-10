import { Router } from 'express';
import FirmInterface from './interface';

export default function setRouter(this: FirmInterface, router: Router) {
    router.route('/')
        .get( async (req, res, next) => {
            let userFirms = res.locals.user.firms;
            try {
                let firms = await this.dbInteraction.get({ returnRaw: true, firmRestrictions: userFirms });
                res.status(200).json(firms);
            } catch (error) {
                next(error)
            }
        })
        .post( async (req, res, next) => {
            let userFirms = res.locals.user.firms;
            try {
                let validData = this.dataValidation.create(req.body);
                let firm = await this.dbInteraction.create(validData, { firmRestrictions: userFirms });
                res.status(200).json(firm);
            } catch (error) {
                next(error)
            }
        })
        .patch( async (req, res, next) => {
            let userFirms = res.locals.user.firms;
            try {
                let validData = this.dataValidation.update(req.body);
                let firm = await this.dbInteraction.update(validData, { firmRestrictions: userFirms });
                res.status(200).json(firm);
            } catch (error) {
                next(error)
            }
        })
        .delete( async (req, res, next) => {
            let userFirms = res.locals.user.firms;
            try {
                let validData = this.dataValidation.remove(req.body);
                await this.dbInteraction.remove(validData, { firmRestrictions: userFirms });
                res.status(200).send('firm succesfully deleted!');
            } catch (error) {
                next(error)
            }
        })
}