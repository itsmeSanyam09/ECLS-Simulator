import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

const secret = process.env.JWT_SECRET_KEY;

export const ValidateUserMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies.access_token;
  
  if (!token) { 
    res.status(401).json({
      success: false,
      message: "Unauthorized - No token provided",
    });
    return; // Just return after sending response
  }

  try {
    if (!secret) {
      throw new Error(
        "JWT_SECRET_KEY  is not defined in environment variables."
      );
    }
    const decoded = jwt.verify(token, secret);
    //@ts-ignore - Or better, extend Request type
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({
      success: false,
      message: "Unauthorized - Invalid token",
    });
    return; // Just return after sending response
  }
};
