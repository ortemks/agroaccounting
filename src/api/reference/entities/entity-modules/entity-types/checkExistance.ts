import { ObjectId, Model } from "mongoose";
import Entity from "../../entity";

interface validate { 
    validator: (value: ObjectId) => Promise<boolean>,
    message: string,
    type: string
};

function checkExistnace ( ref: string | Model<unknown> ): validate  {
    let validation: validate;

    let validateFnc: (value: ObjectId) => Promise<boolean>;
    let refName: string;

    if ( typeof ref === 'string' ) {
        refName = ( ref[0].toUpperCase() + ref.slice(1) ).trim();
        const EntityBaseModel = Entity.EntityBaseModel;

        validateFnc = async function( value: ObjectId ): Promise<boolean> {
            return Boolean(await EntityBaseModel.exists({ _id: value, entityName: ref }))
        }
    } else {
        const refModel: Model<unknown> = ref;
        refName = refModel.modelName;

        validateFnc = async function ( value: ObjectId ): Promise<boolean> {
            return Boolean(await refModel.exists( { _id: value } ))
        }
    }

    validation = {
        validator: validateFnc,
        message: `${refName} with id: {VALUE} doesn't exists`,
        type: `BAD ID REFERENCE`
    }

    return validation
}


export default checkExistnace
