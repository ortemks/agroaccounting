import mongoose from 'mongoose';

export namespace methodsData {
    export type login = {email: string, password: string}
    export type refresh = {refreshToken: string, userId: mongoose.Types.ObjectId | string};
    export type credentialsUpdate = {currentCrdentials: login, credentialsUpdate: Partial<login>};
}

export default interface InteractionInterface {
    methods: {
        login(userCredentials: methodsData.login): Promise<{refreshToken: string, accessToken: string, userId: mongoose.Types.ObjectId | string}>;
        refresh(refreshToken: methodsData.refresh): Promise<{refreshToken: string, accessToken: string}>;
        credentialsUpdate(update: methodsData.credentialsUpdate): Promise<void>;
    }
    dataValidation: {
        login(data: any): methodsData.login;
        refresh(data: any): methodsData.refresh;
        credentialsUpdate(data: any): methodsData.credentialsUpdate;
    }
}