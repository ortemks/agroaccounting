const {body} = require('express-validator');

class requestParsers {
    constructor (termModel, basedOnFirm) {
        this.termModel = termModel;
        this.basedOnFirm = basedOnFirm;

        this.creation = this.creation.bind(this);
        this.changing = this.changing.bind(this);
        this.disabling = this.disabling.bind(this);
        this.deletion = this.deletion.bind(this);
    }
    creation () {
        let validators = [];

        let nameValidator = body('name')
            .notEmpty().withMessage(`field must be fulfilled`).bail()
            .toLowerCase().trim();

        validators.push(nameValidator);

        if (this.basedOnFirm) {
            let firmValidator = body('firm')
                .notEmpty().withMessage(`field must be fulfielled`).bail()
                .isMongoId().withMessage(`field must be fulfilled`);

            validators.push(firmValidator)
        }

        return validators;
    }
    changing () {
        let validators = [];

        let idValidator = body('_id')
            .notEmpty().withMessage(`field must be fulfilled`)
            .isMongoId().withMessage(`field must be mongoId`)
            .custom( async ( value, {req} ) => {
                let termChanged = await this.termModel.findOne( { _id: value} );
                if (!termChanged) throw new Error(`${this.termModel.modelName} doesn't exist`);

                req.locals = {}
                req.locals.termChanged = termChanged;
            });
        
        validators.push(idValidator);

        let nameValidator = body('name')
            .optional()
            .toLowerCase().trim();

        validators.push(nameValidator);

        if (this.basedOnFirm) {
            let firmValidator = body('firm')
                .optional()
                .isMongoId().withMessage('field must be mongoId');

            validators.push(firmValidator);
        }

        return validators;
    }
    disabling () {
        let idValidator = body('_id')
            .notEmpty().withMessage()
            .isMongoId().withMessage('field must be fulfilled')
            .custom( async ( value, {req} ) => {
                let termDisabled = this.termModel.findOne( { _id: value} );
                if (!termDisabled) throw new Error(`${this.termModel.modelName} doesn't exist`);

                req.locals.termDisabled = termDisabled;
            });

        return idValidator;
    }

    deletion() {
        let idValidator = body('_id')
            .notEmpty().withMessage()
            .isMongoId().withMessage('field must be fulfilled')
            .custom( async ( value, {req} ) => {
                let termDeleted = this.termModel.findOne( { _id: value} );
                if (!termDeleted) throw new Error(`${this.termModel.modelName} doesn't exist`);

                req.locals.termDeleted = termDeleted;
            });

        return idValidator;
    }
}

module.exports = requestParsers;