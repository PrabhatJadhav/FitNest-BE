const express = require('express');
const v1Router = express.Router();
import { authenticateToken } from '../middleware/verifyTokens';

// Test endpoints

/**
 * @swagger
 * /test-api:
 *   get:
 *     summary: Test api
 *     responses:
 *       200:
 *         data: Hello, this is test api welcome to port 8080
 */

v1Router.get('/test-api', (req: any, res: any) => {
  res.status(200).send({ data: 'Hello, this is test api in testRouter' });
});

v1Router.get(
  '/test-auth-access-api',
  authenticateToken,
  (req: any, res: any) => {
    console.log('auth req.body', req.body);
    console.log('auth req.user', req.user);
    res.status(200).send({ data: 'Access Provided!' });
  },
);

export { v1Router };
