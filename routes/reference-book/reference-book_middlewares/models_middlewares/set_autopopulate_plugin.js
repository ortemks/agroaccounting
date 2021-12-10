function getTermName (schema) {
    schema.eachPath( (pathName, schemaType) => {
        if (schemaType.options.ref) {
            schemaType.options.autopopulate = {select: 'name'};
        }
    });
}
module.exports = getTermName