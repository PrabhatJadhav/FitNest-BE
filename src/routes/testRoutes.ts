const express = require("express");
const testRouter = express.Router();
import { authenticateToken } from "../middleware/verifyTokens";

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

testRouter.get("/test-api", (req: any, res: any) => {
  res
    .status(200)
    .send({ data: "Hello, this is test api welcome to port 8080" });
});

testRouter.get(
  "/test-auth-access-api",
  authenticateToken,
  (req: any, res: any) => {
    console.log("auth req.body", req.body);
    console.log("auth req.user", req.user);
    res.status(200).send({ data: "Access Provided!" });
  }
);

export { testRouter };
