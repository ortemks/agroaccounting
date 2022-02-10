import express from "express";
import Interaction from "./interface";

export default function setRouter(this: Interaction, router: express.Router) {
    router
        .get('/login', async (req, res, next) => {
            try {
                let validData = this.dataValidation.login(req.body);
                let authAttributes = await this.methods.login(validData);
                res.cookie('refresh_token', authAttributes.refreshToken, { httpOnly: true, sameSite: 'strict', path: '/api/users/interactions/refresh'});
                res.cookie('user_id', authAttributes.userId, { httpOnly: true, sameSite: 'strict' });
                res.status(200).json({access_token: authAttributes.accessToken});
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
