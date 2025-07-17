import { Router } from "express";
import * as waveController from "../controllers/wave.controller";

export const WaveRouter = Router();

WaveRouter.post("/", waveController.createWave);
WaveRouter.get("/", waveController.listWaves);
WaveRouter.get("/:id", waveController.getWaveById);
WaveRouter.put("/:id", waveController.updateWave);
WaveRouter.delete("/:id", waveController.deleteWave);