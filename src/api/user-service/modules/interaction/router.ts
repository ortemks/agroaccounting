import express from "express";
import { UserProperties } from "../user-interface";
import Interaction from "./interface";

export default function setRouter(this: Interaction, router: express.Router) {
    router
        .post('/login', async (req, res, next) => {
            try {
                console.log(1, req.body);
                const validData = this.dataValidation.login(req.body);
                console.log(2)
                const {tokens, userProperties, availableUsers} = await this.methods.login(validData);
                res.cookie('refresh_token', tokens.refreshToken, { httpOnly: true, sameSite: 'strict', path: '/api/users/interactions/refresh'});
                res.cookie('user_id', userProperties.id, { httpOnly: true, sameSite: 'strict' });
                res.status(200).json({access_token: tokens.accessToken, userProperties, availableUsers});
            } catch (error) {
                next(error)
            }
        })
        .get('/refresh', async (req, res, next) => {
            try {
                let validData = this.dataValidation.refresh({ refreshToken: req.cookies.refresh_token, userId: req.cookies.user_id });
                let newTokens = await this.methods.refresh(validData);

                res.cookie('refresh_token', newTokens.refreshToken, { httpOnly: true, sameSite: 'strict', path: '/api/users/interactions/refresh'});
                res.status(200).json({access_token: newTokens.accessToken});
            } catch (error) {
                next(error)
            }
        })
        .patch('/crdentials-update', async(req, res, next) => {
            try {
                let validData = this.dataValidation.credentialsUpdate(req.body);
                await this.methods.credentialsUpdate(validData);
            } catch (error) {
                next(error)
            }
        })
}
