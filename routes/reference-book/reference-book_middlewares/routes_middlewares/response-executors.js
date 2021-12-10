const TermModel = require("../../reference-book_models/term_model");

class executionFunctions {
    constructor(termModel, dependsOnFirm) {
        this.termModel = termModel;
        this.dependsOnFirm = dependsOnFirm;

        this.query = this.query.bind(this);
        this.creation= this.creation.bind(this);
        this.changing = this.changing.bind(this);
        this.disabling = this.disabling.bind(this);
        this.deletion = this.deletion.bind(this);
    }
    async query (req, res) {
        let termModel = this.termModel;
        let terms;
        let query;

        // making query depending on user role
        let userRole = res.locals.user.role;
        if (userRole === 'checkman') {
            let userFirms = res.locals.userFirms;

            query = (this.dependsOnFirm) ? { firm: { $in: userFirms }} : {};
        }

        if (userRole === 'administrator' || 'shef') {
            query = {};
        }

        terms = await termModel.find(query);
        res.status(200).json(terms);
    }
    async creation (req, res) {
        let termModel = this.termModel;
        let requestOptions = {...req.body};
        let newTerm;

        try { 
            newTerm = new termModel(requestOptions);
            await newTerm.save();
        } catch (errors) {
            return res.status(400).json(errors)
        }

        res.status(201).send(`new ${newTerm.termType} added to referenceb book`);
    }
    async changing (req, res) {
        let termChanged = req.locals.termChanged;
        let requestOptions = {...req.body};
        
        try {
            await termChanged.set(requestOptions);
            await termChanged.save();
        } catch ( errors) {
            return res.status(400).json(errors);
        } 

        res.status(200).send(`${termChanged.termType} witd id: ${requestOptions._id} changed`)
    }  
    async disabling (req, res) {
        let termToDisable = req.locals.termToDisable;
        let userRole = res.locals.user.role;

        if (userRole === 'checkman') {
            await TermModel.updateOne( { _id: termToDisable._id }, { disabled: true });
            res.status(200).json(termToDisable._id);
        }
        let termsToDisale = await TermModel.aggregate([ {
            $match: {
                $and: [ {    
                    $expr: {           
                        $anyElementTrue: [ {
                            $map: {
                                input: { $objectToArray: "$$ROOT" },
                                in: { $eq: [ { $toString: "$$this.v"}, termToDisable._id ] }
                            }
                        } ] 
                    }
                }, { 
                    disabled: false 
                } ]
            } 
        }, { 
            $project: { "_id": 1 }
        } ]);

        await TermModel.updateMany( { _id: { $in: termsToDisale} }, { disabled: true} )

        res.status(200).json(termsToDisale);
    }
    async deletion(req, res) {
        let termToDelete = req.locals.termToDelete;
        let termsToDelete = await TermModel.aggregate([ {
            $match: {  
                $expr: {           
                    $anyElementTrue: [ {
                        $map: {
                            input: { $objectToArray: "$$ROOT" },
                            in: { $eq: [ { $toString: "$$this.v"}, termToDelete._id ] }
                        }
                    } ] 
                }
            } 
        }, { 
            $project: { "_id": 1 }
        } ]);

        let userRole = res.locals.user.role;
        if (userRole === 'checkman') {
            let userFirms = res.locals.user.firms
            let accountingForbidingDeletion = Accounting.findOne({
                $match: {
                    $and: [ {
                        $expr: {           
                            $anyElementTrue: [ {
                                $map: {
                                    input: { $objectToArray: "$$ROOT" },
                                    in: { $in: [ { $toString: "$$this.v"}, termsToDelete ] }
                                }
                            } ] 
                        } 
                    }, {
                        $or: [ { confirmed: true }, { firm: {$nin: userFirms} } ]
                    } ]
                }
            })

            if (accountingForbidingDeletion) {
                if (accountingForbidingDeletion.confirmed) return res.status(403).send(`confirmed accounting using this term already exists`);
                return res.status(403).send(`accounting belonging to firm chekman doesn't work for already exists`);
            }
        }

        let accountingsToDelete = await Accounting.aggregate([ {
            $match: {  
                $expr: {           
                    $anyElementTrue: [ {
                        $map: {
                            input: { $objectToArray: "$$ROOT" },
                            in: { $in: [ { $toString: "$$this.v"}, termsToDelete ] }
                        }
                    } ] 
                }
            } 
        }, { 
            $project: { "_id": 1 }
        } ]);
    }
}

module.exports = executionFunctions;