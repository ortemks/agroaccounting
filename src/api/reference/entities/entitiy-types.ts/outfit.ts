import { Schema } from 'mongoose';
import Entity from '../entity';
import { EntityBaseProperties } from "../entity-modules/entity-class/entity-interface";

// Outfit Schema
interface Outfit extends EntityBaseProperties {}

const outfitSchema = new Schema<Outfit>( {}, { versionKey: false } );

// creating Outfit entity
const Outfit: Entity<Outfit> = new Entity('Outfit', outfitSchema);

export default Outfit