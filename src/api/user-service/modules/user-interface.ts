import mongoose from 'mongoose';

export type UserRole = 'Checkman' | 'Administrator' | 'Chief'

export interface UserProperties {
    email: string,
    password: string,
    role: UserRole,
    firm: Array<mongoose.Types.ObjectId | string>,
    secret: string,
    banned: boolean
}
