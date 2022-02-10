import { Router } from "express";
import Reference from "./interface";
import Entity from "../entities/entity";

export default function setRouter (this: Reference, router : Router) {
    router.route('/')
    .get( async ( req, res, next) => {
        let userFirms = res.locals.user.firms;

        try {
            let validData = this.dataValidation.findAllEntities(req.body);
            let entities = await this.getAllEntitiesDocs(validData, { firmRestrictions: userFirms });
            
            res.status(200).json(entities);
        } catch (error) {
            next(error);
        }
    })
    
    for (let entityName in this.entities) {
        let entity: Entity<any> = (this.entities as { [key: string]: Entity<any> })[entityName]
        let resourseName = entity.entityName.replace(/([A-Z])/g, function(match) {
            return '-' + match.toLowerCase()
        } );
        if ( resourseName[resourseName.length - 1] === 'y' ) {
            resourseName = resourseName.slice(0, resourseName.length - 1) + 'ies'
        } else {
            resourseName += 's'
        }
        let url = '/' + resourseName.slice(1);

        this.router.use(url, entity.router);
    }
}