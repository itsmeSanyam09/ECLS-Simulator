import { Request, RequestHandler, Response } from "express";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const HealthCheck : RequestHandler = async (req : Request, res : Response) => {
    try {
        await prisma.$connect(); // Ensure the database connection is healthy
        await prisma.$disconnect(); // Disconnect after the check

        res.status(200).json({ status: "OK", message: "Service is healthy" });
    } catch (error) {
        console.error("Health check failed:", error);
        res.status(500).json({ status: "ERROR", message: "Service is unhealthy" });
    }
}