import { Router } from "express";

import userService from './user-service/user-service';
import Firm from './firms/firm';
import Reference from './reference/reference';
import accounting from './accounting/accounting';

const api = Router();

// user interface
const userInteraction = new userService.Interaction();
const userManagement = new userService.Management();
const userAuth = new userService.Auth();
api.use('/users/interactions', userInteraction.router);
api.use('/users/management', userAuth.middlewares.authenticate, userAuth.middlewares.authorize(['Checkman']), userManagement.router);

// firms
const firm = new Firm();
api.use('/firms', userAuth.middlewares.authenticate, firm.router);

// reference
const reference = new Reference();
api.use('/reference', userAuth.middlewares.authenticate,  reference.router)

// accounts
const work = new accounting.Work();
const refueling = new accounting.Refueling();
const arrival = new accounting.Arrival();
const invetorisation = new accounting.Inventorisation();
api.use('/accounts', userAuth.middlewares.authenticate, work.router, refueling.router, arrival.router, invetorisation.router);

export default api






