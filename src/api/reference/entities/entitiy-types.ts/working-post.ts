import { Schema } from 'mongoose';
import Entity from '../entity';
import { EntityBaseProperties } from "../entity-modules/entity-class/entity-interface";

// Working-PostSchema
interface WorkingPost extends EntityBaseProperties {}

const workingPostSchema = new Schema<WorkingPost>( {}, { versionKey: false } );

// creating Working-Post entity
const WorkingPost: Entity<WorkingPost> = new Entity('WorkingPost', workingPostSchema);

export default WorkingPost