import express from "express";
import Management from "./interface";

export default function setRouter(this: Management, router: express.Router) {
    router
        .get('/', async (req, res, next) => {
            let userFirms = res.locals.user.firms;
            try {
                let users = await this.methods.getUsers({ firmRestrictions: userFirms, returnRaw: true });
                res.status(200).json(users);
            } catch (error) {
                next(error)
            }
        })
        .post('/register', async (req, res, next) => {
            let userFirms = res.locals.user.firms;
            try {
                let validData = this.dataValidation.register(req.body);
                let newUser = await this.methods.register(validData, { firmRestrictions: userFirms });
                res.status(202).send(newUser)
            } catch (error) {
                next(error)
            }
        })
        .patch('/', async (req, res, next) => {
            let userFirms = res.locals.user.firms;
            try {
                let validData = this.dataValidation.updateUser(req.body);
                await this.methods.updateUser(validData, { firmRestrictions: userFirms });
                res.status(200).send('user succesfully updated')
            } catch (error) {
                next(error)
            }
        })
        .delete('/', async (req, res, next) => {
            let userFirms = res.locals.user.firms;
            try {
                let validData = this.dataValidation.removeUser(req.body);
                await this.methods.removeUser(validData, { firmRestrictions: userFirms });
                res.status(200).send('user succesfully deleted')
            } catch (error) {
                next(error)
            }
        })
}