import { Request, RequestHandler, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Create a new Wave with default and custom WaveParameters
 */
export const createWave: RequestHandler = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const {
            name,
            heartRate,
            pixelsPerMv,
            defaultPWavesPerQrs,
            enableRWavePattern,
            rWavesInPattern,
            applyRWaveAfterNQrs,
            enablePWavePattern,
            pWavesInPattern,
            applyPWaveAfterNQrs,
            enableCustomBeatSequence,
            normalBeatsBeforeRepeat,
            waveParameters, // Array of WaveParameter objects
        } = req.body;

        if (!name || !heartRate || !pixelsPerMv || !waveParameters || !Array.isArray(waveParameters)) {
            res.status(400).json({
                message: "Missing required fields",
            });
            return;
        }

        const newWave = await prisma.wave.create({
            data: {
                name,
                heartRate,
                pixelsPerMv,
                defaultPWavesPerQrs,
                enableRWavePattern,
                rWavesInPattern,
                applyRWaveAfterNQrs,
                enablePWavePattern,
                pWavesInPattern,
                applyPWaveAfterNQrs,
                enableCustomBeatSequence,
                normalBeatsBeforeRepeat,
                waveParameters: {
                    create: waveParameters,
                },
            },
            include: {
                waveParameters: true,
            },
        });

        res.status(201).json(newWave);
    } catch (error) {
        console.error("Error creating wave:", error);
        res.status(500).json({
            message: "Internal server error",
        });
    }
};

/**
 * Get a Wave by ID with its WaveParameters
 */
export const getWaveById: RequestHandler = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { id } = req.params;

        const wave = await prisma.wave.findUnique({
            where: { id },
            include: {
                waveParameters: {
                    orderBy: { ordinal: "asc" },
                },
            },
        });

        if (!wave) {
            res.status(404).json({ message: "Wave not found" });
            return;
        }

        res.status(200).json(wave);
    } catch (error) {
        console.error("Error fetching wave:", error);
        res.status(500).json({
            message: "Internal server error",
        });
    }
};

/**
 * List all Waves
 */
export const listWaves: RequestHandler = async (
    _req: Request,
    res: Response
): Promise<void> => {
    try {
        const waves = await prisma.wave.findMany({
            include: {
                waveParameters: true,
            },
            orderBy: { name: "asc" },
        });
        res.status(200).json(waves);
    } catch (error) {
        console.error("Error listing waves:", error);
        res.status(500).json({
            message: "Internal server error",
        });
    }
};

/**
 * Update a Wave and its parameters
 */
export const updateWave: RequestHandler = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { id } = req.params;
        const {
            name,
            heartRate,
            pixelsPerMv,
            defaultPWavesPerQrs,
            enableRWavePattern,
            rWavesInPattern,
            applyRWaveAfterNQrs,
            enablePWavePattern,
            pWavesInPattern,
            applyPWaveAfterNQrs,
            enableCustomBeatSequence,
            normalBeatsBeforeRepeat,
            waveParameters, // full replacement array of WaveParameters
        } = req.body;

        // Check if wave exists
        const existingWave = await prisma.wave.findUnique({
            where: { id },
        });
        if (!existingWave) {
            res.status(404).json({ message: "Wave not found" });
            return;
        }

        // Update Wave
        const updatedWave = await prisma.wave.update({
            where: { id },
            data: {
                name,
                heartRate,
                pixelsPerMv,
                defaultPWavesPerQrs,
                enableRWavePattern,
                rWavesInPattern,
                applyRWaveAfterNQrs,
                enablePWavePattern,
                pWavesInPattern,
                applyPWaveAfterNQrs,
                enableCustomBeatSequence,
                normalBeatsBeforeRepeat,
            },
        });

        // Replace all parameters (for simplicity)
        if (waveParameters && Array.isArray(waveParameters)) {
            await prisma.waveParameter.deleteMany({
                where: { waveId: id },
            });

            await prisma.waveParameter.createMany({
                data: waveParameters.map((param: any) => ({
                    ...param,
                    waveId: id,
                })),
            });
        }

        const waveWithParams = await prisma.wave.findUnique({
            where: { id },
            include: { waveParameters: { orderBy: { ordinal: "asc" } } },
        });

        res.status(200).json(waveWithParams);
    } catch (error) {
        console.error("Error updating wave:", error);
        res.status(500).json({
            message: "Internal server error",
        });
    }
};

/**
 * Delete a Wave and its parameters
 */
export const deleteWave: RequestHandler = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { id } = req.params;

        // Check if exists
        const existingWave = await prisma.wave.findUnique({
            where: { id },
        });
        if (!existingWave) {
            res.status(404).json({ message: "Wave not found" });
            return;
        }

        await prisma.wave.delete({
            where: { id },
        });

        res.status(200).json({ message: "Wave deleted successfully" });
    } catch (error) {
        console.error("Error deleting wave:", error);
        res.status(500).json({
            message: "Internal server error",
        });
    }
};
