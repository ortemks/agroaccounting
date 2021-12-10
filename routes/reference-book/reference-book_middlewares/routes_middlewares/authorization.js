const {validationResult} = require('express-validator');

class Authorization {
    constructor (dependsOnFirm) {
        this.dependsOnFirm = dependsOnFirm;

        this.creation = this.creation.bind(this);
        this.changing = this.changing.bind(this);
        this.disabling = this.disabling.bind(this);
        this.deletion = this.deletion.bind(this);
    }

    async creation (req, res, next) {
        let errors = validationResult(req);
        if ( !errors.isEmpty() ) return res.status(400).json(errors);

        let userRole = res.locals.user.role;
        let requestOptions = {...req.body};

        if (userRole === 'checkman' && this.dependsOnFirm) {
            let userFirms = res.locals.user.firms;
            let declaredFirm = requestOptions.firm;

            if ( !userFirms.includes(declaredFirm) ) return res.status(403).send(`checkman can't create terms on firm they don't work for`);
        }

        next();
    }
    async changing (req, res, next) {
        let errors = validationResult(req);
        if ( !errors.isEmpty() ) return res.status(400).json(errors);

        let userRole = res.locals.user.role;
        let termChanged = req.locals.termChanged;
        let requestOptions = {...req.body};

        if (userRole === 'checkman' && this.dependsOnFirm) {
            let declaredFirm = requestOptions.firm;
            let userFirms = res.locals.user.firms;

            if ( !userFirms.includes(termChanged.firm) ) return res.status(403).send(`checkman can't change terms of firm they don't work for`);
            if ( !userFirms.includes(declaredFirm) ) return res.status(403).send(`checkman can't point firm they don't work for`);
        }

        next();
    }
    async disabling (req, res, next) {
        let errors = validationResult(req);
        if ( !errors.isEmpty() ) return res.status(400).json(errors);

        let userRole = res.locals.user.role;
        let termDisabled = req.locals.termDisabled;

        if (userRole === 'checkman') {
            if (!this.dependsOnFirm) return res.status(403).send(`checkmans can't disable terms which don't depends on firm`);

            let userFirms = res.locals.user.firms;
            if ( !userFirms.includes(termDisabled.firm) ) return res.status(403).send(`checkman can't disable terms belongig to firm they don't work for`);
        }

        next()
    }
    async deletion (req, res, next) {
        let errors = validationResult(req);
        if ( !errors.isEmpty() ) return res.status(400).json(errors);

        let userRole = res.locals.userRole;
        let termDeleted = req.locals.termDeleted;

        if (userRole === 'checkman') {
            let userFirms = res.locals.userFirms;

            if ( !userFirms.includes(termDeleted.firm) ) return res.status(403).send(`checkman can't delete terms belonging to firm they don't work for`);
        }

        next();
    }
}
module.exports = Authorization