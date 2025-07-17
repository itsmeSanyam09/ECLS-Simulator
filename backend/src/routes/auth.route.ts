import { RequestHandler, Router } from "express";
import { Login, Signup } from "../controllers/auth.controller";

export const AuthRouter = Router();

AuthRouter.post('/signup', Signup);
AuthRouter.post('/login', Login);