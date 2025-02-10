const express = require('express');
const v1Router = express.Router();
import { userAuthRouter } from '../routes/userAuthRoutes';

// Auth routes

v1Router.use('/auth', userAuthRouter);

export { v1Router };
