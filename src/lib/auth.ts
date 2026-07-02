import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export function verifyToken(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.split(" ")[1];

    if (!token) {
      return null;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
      role: string;
    };

    return decoded;
  } catch (error) {
    return null;
  }
}
