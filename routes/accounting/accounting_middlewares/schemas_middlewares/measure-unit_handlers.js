class measureUnitHandlers {
    async validation (value) {
        await this.populate('inventoryItem', 'measurement');

        if ( value !== this.inventoryItem.measurement ) throw new Error(`Measure Unit's measurement must be the same as Inventory Item's`)
    }
    async conversion (value) {
        await this.populate('measureUnit', 'ratio');
    
        return value * this.measureUnit.ratio
    }
}

module.exports = measureUnitHandlers;