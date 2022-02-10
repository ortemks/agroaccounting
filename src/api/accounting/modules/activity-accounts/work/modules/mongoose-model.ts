import { Schema, model, Types, SchemaTypes } from "mongoose";
import { WorkProperties, InventoryItemChange } from "./interface";

import { baseAccountingScema, convertMeasureUnits, priceSchema } from "../../../account-modules/mongoose-model";
import { schemaReferenceValidation } from "../../../account-modules/mongoose-model";

import Reference from "../../../../../reference/reference";
const reference = new Reference();
const InventoryItemModel = reference.entities.inventoryItem.model;

const inventoryItemChangeSchema = new Schema<InventoryItemChange>({
    inventoryItem: {
        type: SchemaTypes.ObjectId,
        ref: 'InventoryItem',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    amountMU: {
        type: SchemaTypes.ObjectId,
        ref: 'MeasureUnit',
        required: true
    }
}, { versionKey: false } )
schemaReferenceValidation<InventoryItemChange>(inventoryItemChangeSchema, 
    { pathName: "inventoryItem", depndentProperty: { pathName: 'amountMU', sameProperty: { name: 'measurement' } } }, 
    { pathName: 'amountMU', depndentProperty: { pathName: 'inventoryItem', sameProperty: { name: 'measurement' } } } 
)
convertMeasureUnits<InventoryItemChange>( inventoryItemChangeSchema,
    { amountPathName: "amount", measureUnitPathName: "amountMU" }
)

const workSchema = new Schema<WorkProperties>({
    workType: {
        type: SchemaTypes.ObjectId,
        ref: 'WorkType',
        required: true
    },
    workDone: {
        type: SchemaTypes.Number,
        required: true
    },
    workDoneMU: {
        type: SchemaTypes.ObjectId,
        ref: 'MeasureUnit',
        required: true
    },

    arrival: {
        type: [inventoryItemChangeSchema],
        required: false,
        default: undefined
    },
    spending: {
        type: [inventoryItemChangeSchema],
        required: false,
        default: undefined
    },

    worker: {
        type: SchemaTypes.ObjectId,
        ref: 'Worker',
        required: true
    },
    employeePrice: {
        type: priceSchema,
        required: false
    },
    fieldNum: {
        type: SchemaTypes.ObjectId,
        ref: 'FieldNumber',
        required: false
    },

    mechanism: {
        type: SchemaTypes.ObjectId,
        ref: 'Mechanism',
        required: false
    },
    innerNum: {
        type: SchemaTypes.ObjectId,
        ref: 'MechanismInnerNumber',
        required: false
    },
    outfit: {
        type: SchemaTypes.ObjectId,
        ref: 'Outfit',
        required: true
    },

    fuelType: {
        type: SchemaTypes.ObjectId,
        ref: 'InventoryItem',
        validate: {
            validator: async function isFuel(value: string | Types.ObjectId) {
                await InventoryItemModel.exists({ _id: value, consumptionType: 'палива'})
            },
            message: `inventory items's consumption type must be 'палива'`,
            type: 'BAD ID REFERENCE'
        },
        required: true
    },
    fuelSpent: {
        type: SchemaTypes.Number,
        required: true
    },
    fuelSpentMU: {
        type: SchemaTypes.ObjectId,
        ref: 'MeasureUnit',
        required: true
    }
}, { versionKey: false } )
workSchema.add(baseAccountingScema);
schemaReferenceValidation<WorkProperties>(workSchema, 
    { pathName: "workType" , depndentProperty: { pathName: 'workDoneMU', sameProperty: { name: 'measurement', isArray: 'validated' } } },
    { pathName: "workDoneMU" , depndentProperty: { pathName: 'workType', sameProperty: { name: 'measurement', isArray: 'dependent' } } },
    { pathName: 'fuelType', depndentProperty: { pathName: 'fuelSpentMU', sameProperty: { name: 'measurement' } } },
    { pathName: 'fuelSpentMU', depndentProperty: { pathName: 'fuelType', sameProperty: { name: 'measurement' } } },
)
convertMeasureUnits<WorkProperties>( workSchema,
     { amountPathName: "workDone", measureUnitPathName: "workDoneMU" },
     { amountPathName: "fuelSpent", measureUnitPathName: "fuelSpentMU" }
)

function summirizeSameInventoryItems(schema: Schema, ...pathNames: string[] ) {
    pathNames.forEach( pathName => {
        function pointToSummirize (this: { summirizeInventoryItems: { inventoryItem: (string | Types.ObjectId), arrayPathName: string }[] }, value: string | Types.ObjectId) {
            if ( !this.summirizeInventoryItems ) this.summirizeInventoryItems = [];
            this.summirizeInventoryItems.push({inventoryItem: value, arrayPathName: pathName })
        }
    
        (schema.path(pathName) as any).schema.path('inventoryItem').validators.push( { validator: pointToSummirize } )
    })

    schema.post('validate', function (this: { summirizeInventoryItems: { inventoryItem: (string | Types.ObjectId), arrayPathName: string }[] }) {
        if ( !this.summirizeInventoryItems ) return;
        this.summirizeInventoryItems.forEach( inventoryItemData => {
            let inventoryItems = (this as any)[inventoryItemData.arrayPathName] as InventoryItemChange[];

            let sameInventoryItems = inventoryItems.filter( inventoryItemChange => inventoryItemChange.inventoryItem == inventoryItemData.inventoryItem );
            if (sameInventoryItems.length > 1) {
                let summirizedInventoryItem = sameInventoryItems.reduce( ( countedInvntoryItem: InventoryItemChange, inventoryItemChange: InventoryItemChange ) => {
                    countedInvntoryItem.amount += inventoryItemChange.amount;
                    inventoryItems.splice(inventoryItems.indexOf(inventoryItemChange), 1);

                    return countedInvntoryItem
                }, { inventoryItem: inventoryItemData.inventoryItem, amount: 0, amountMU: sameInventoryItems[0].amountMU });

                inventoryItems.push(summirizedInventoryItem);
            }
        })
    })
}

summirizeSameInventoryItems(workSchema, 'arrival', 'spending')

const WorkModel = model('Work', workSchema);
export default WorkModel
