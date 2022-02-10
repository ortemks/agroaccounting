import { Router } from "express";
import { HydratedDocument } from "mongoose";
import EntityInterface, { EntityBaseProperties } from "./entity-interface"

export default function setRouter<EntityProperties extends EntityBaseProperties>(this: EntityInterface<any>, router: Router, isFirmDependent: boolean): Router {
    if (isFirmDependent) {
        router.route('/')
            .get( async ( req, res, next) => {
                try {
                    let userFirms = res.locals.user.firms;
    
                    let validData = this.dataValidation.get(req.body);

                    let entities: HydratedDocument<EntityProperties>[] = await this.dbInteraction.get(validData, {returnRaw: true, firmRestrictions: userFirms}) as HydratedDocument<EntityProperties>[];
                    res.status(200).json(entities);
                } catch (error) {
                    next(error);
                }
            })
            .post( async (req, res, next) => {
                try {
                    let userFirms = res.locals.user.firms;
                    
                    req.body.changedBy = res.locals.user._id.toString();
                    let validData = this.dataValidation.create(req.body);

                    let createdEntity = await this.dbInteraction.create(validData, {firmRestrictions: userFirms} )
                    res.status(202).json(createdEntity);
                } catch (error) {
                    next(error)
                }
            })
            .patch( async (req, res, next) => {
                try {
                    let userFirms = res.locals.user.firms;
                    
                    req.body.update.changedBy = res.locals.user._id.toString();
                    let validData = this.dataValidation.update(req.body);

                    await this.dbInteraction.update(validData, {firmRestrictions: userFirms} );
                    res.status(200).json(`${this.entityName}'s succesfully updated!`);
                } catch (error) {
                    next(error)
                }
            })
            .delete( async (req, res, next) => {
                try {
                    let userFirms = res.locals.user.firms;
                    
                    let validData = this.dataValidation.remove(req.body);
                    let references = await this.dbInteraction.remove(validData, { firmRestrictions: userFirms, onlyConfirmedStatus: res.locals.user.role === 'checkman' ? 'false' : undefined } );
                    if (references) return res.status(200).json(references);

                    res.status(200).send(`${this.entityName}'s succesfully removed!`)
                } catch (error) {
                    next(error)
                }
            })
    } else {
        router.route('/')
        .get( async ( req, res, next) => {
            try {
                let validData = this.dataValidation.get(req.body);

                let entities: HydratedDocument<EntityProperties>[] = await this.dbInteraction.get(validData) as HydratedDocument<EntityProperties>[];
                res.status(200).json(entities);
            } catch (error) {
                next(error);
            }
        })
        .post( async (req, res, next) => {
            try {
                console.log(999)
                req.body.changedBy = res.locals.user._id.toString();
                let validData = this.dataValidation.create(req.body);
     ;
                let createdEntity = await this.dbInteraction.create(validData)
                res.status(202).json(createdEntity);
            } catch (error) {
                next(error)
            }
        })
        .patch( async (req, res, next) => {
            try {
                req.body.update.changedBy = res.locals.user._id.toString();
                let validData = this.dataValidation.update(req.body);

                await this.dbInteraction.update(validData);
                res.status(200).json(`${this.entityName}'s succesfully updated!`);
            } catch (error) {
                next(error)
            }
        })
        .delete( async (req, res, next) => {
            try {
                let userFirms = res.locals.user.firms;
                
                let validData = this.dataValidation.remove(req.body);
                let references = await this.dbInteraction.remove(validData, { firmRestrictions: userFirms, onlyConfirmedStatus: res.locals.user.role === 'checkman' ? 'false' : undefined } );
                console.log(references)
                if (references) return res.status(200).json(references);

                res.status(200).send(`${this.entityName}'s succesfully removed!`)
            } catch (error) {
                next(error)
            }
        })
    }

    router.route('/')
        .delete( async (req, res, next) => {
            try {
                let userFirms = res.locals.user.firms;

                let validData = this.dataValidation.remove(req.body);
                
                await this.dbInteraction.remove(validData, { firmRestrictions: userFirms });
            } catch (error) {
                next(error);
            }
        }) 
    return router
}