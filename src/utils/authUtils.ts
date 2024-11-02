import jwt from "jsonwebtoken";
import { JwtTokenPayload } from "../model/jwtTokenPayload.model";
require("dotenv").config();

export const generateToken = (payload: JwtTokenPayload) => {
  if (process.env.ACCESS_TOKEN_SECRET) {
    try {
      return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: process.env.TOKEN_EXPIRY,
      });
    } catch (err) {
      throw err;
    }
  }
};

export const generateRefreshToken = (payload: JwtTokenPayload) => {
  if (process.env.REFRESH_TOKEN_SECRET) {
    try {
      return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
      });
    } catch (err) {
      throw err;
    }
  }
};

export const verifyToken = (token: string): JwtTokenPayload | null => {
  if (process.env.ACCESS_TOKEN_SECRET) {
    try {
      let decodedResult: JwtTokenPayload = jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET
      ) as JwtTokenPayload;

      if (decodedResult?.userId) {
        return decodedResult;
      } else {
        return null;
      }
    } catch (err) {
      console.log("verifyToken catch", err);
      return null;
    }
  } else {
    return null;
  }
};
