import { Request, RequestHandler, Response } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const secret = process.env.JWT_SECRET_KEY;
const prisma = new PrismaClient();

export const Signup: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    let { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({
        message: "Username and password are required",
      });
      return;
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        username,
      },
    });

    if (existingUser) {
      res.status(400).json({
        message: "Username already exists",
      });
      return;
    }

    // Hash the password before saving
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
      },
    });

    const payload = {
      userId: newUser.id,
      username: newUser.username,
    };

    const token = jwt.sign(payload, secret ?? "secret");
    console.log("New user created:", newUser);
    res
      .status(201)
      .cookie("access_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 1 * 24 * 60 * 60 * 1000, // 1 day
      })
      .json({ username: newUser.username, token: token });
    return;
  } catch (error) {
    console.error("Error during signup:", error);
    res.status(500).json({
      message: "Internal server error",
    });
    return;
  }
};

export const Login: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    let { username, password } = req.body;

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ username: username || undefined }],
      },
    });

    if (!existingUser || !existingUser.password) {
      res.status(404).json({
        message: "User not found",
      });
      return;
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      existingUser.password
    );

    if (!isPasswordCorrect) {
      res.status(400).json({
        message: "Invalid username or password",
      });
      return;
    }

    const payload = {
      userId: existingUser.id,
      username: existingUser.username,
    };

    const token = jwt.sign(payload, secret ?? "secret");

    res
      .status(200)
      .cookie("access_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 1 * 24 * 60 * 60 * 1000, // 1 day
        path: "/",
      })
      .json({ username: existingUser.username, token: token });
    return;
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};
