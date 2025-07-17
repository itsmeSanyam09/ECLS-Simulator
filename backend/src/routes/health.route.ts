import { Router } from "express";
import { HealthCheck } from "../controllers/health.controller";

export const HealthRouter = Router();

HealthRouter.get('/', HealthCheck);