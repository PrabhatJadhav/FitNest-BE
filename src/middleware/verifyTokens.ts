import { JwtTokenPayload } from "../model/jwtTokenPayload.model";
import { ApiResponse } from "../utils/apiResponse";
import { verifyToken } from "../utils/authUtils";

const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    res
      .status(401)
      .json(
        ApiResponse.failure("Token is required to access this resource!", 401)
      );
    return;
  }

  const decoded: JwtTokenPayload | null = verifyToken(token);

  if (!decoded?.userId) {
    res.status(401).json(ApiResponse.failure("Unauthorized Access!", 401));
    return;
  }

  req.user = decoded;
  next();
};

export { authenticateToken };
