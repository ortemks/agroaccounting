const TermModel = require("../../reference-book_models/term_model");

async function uniqueName (value) {
    let termFirm = this.firm;
    let termType = this.termType;

    let termWithSameName = await TermModel.exists({ termType: termType, firm: termFirm, name: value}); 
    if (termWithSameName) throw new Error(`${termType} with name ${value} already exists on firm ${termFirm}`);
}

module.exports = uniqueName;