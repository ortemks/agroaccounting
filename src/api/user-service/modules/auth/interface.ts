import mongoose from 'mongoose';
import { Request, Response, NextFunction} from "express";
import { UserProperties, UserRole } from '../user-interface';

export namespace methodsData {
    export type authenticate = {accessToken: string, userId: mongoose.Types.ObjectId};
    export type authorize =  UserProperties;
}

export default interface Auth {
    methods: {
        authenticate(authAttributes: methodsData.authenticate): Promise<UserProperties>;
        authorize(user: methodsData.authorize, restrictions?: UserRole[] ): void;
    };
    middlewares: {
        authenticate(req: Request, res: Response, next: NextFunction ): Promise<void>;
        authorize(restrictions?: UserRole[]): (req: Request, res: Response, next: NextFunction ) => void;
    };
    dataValidation: {
        authenticate(data: any): methodsData.authenticate;
        authorize(data: any): methodsData.authorize;
    };
}

