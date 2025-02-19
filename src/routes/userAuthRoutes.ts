import { sendOtp, getRefreshToken, login } from '../controller/authController';
import { authenticateToken, verifyOtp } from '../utils/authUtils';

const express = require('express');
const userAuthRouter = express.Router();

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

userAuthRouter.get(
  '/test-auth-access-api',
  authenticateToken,
  (req: any, res: any) => {
    console.log('auth req.body', req.body);
    console.log('auth req.user', req.user);
    res.status(200).send({ data: 'Access Provided!' });
  },
);

// User Login endpoints

/**
 * @openapi
 * '/api/v1/register':
 *  post:
 *     tags:
 *     - User Auth Controller
 *     summary: Register A User
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *           schema:
 *            type: object
 *            required:
 *              - username
 *              - email
 *              - password
 *            properties:
 *              username:
 *                type: string
 *                default: johndoe
 *              email:
 *                type: string
 *                default: johndoe@mail.com
 *              password:
 *                type: string
 *                default: johnDoe20!@
 *     responses:
 *      201:
 *        description: Created
 *      409:
 *        description: Conflict
 *      404:
 *        description: Not Found
 *      500:
 *        description: Server Error
 */

// userAuthRouter.post('/register', register);

userAuthRouter.post('/login', login);

userAuthRouter.post('/send-otp', authenticateToken, sendOtp);

userAuthRouter.post('/verify-email-otp', authenticateToken, verifyOtp);

userAuthRouter.post(
  '/generate-refresh-token',
  authenticateToken,
  getRefreshToken,
);

export { userAuthRouter };
