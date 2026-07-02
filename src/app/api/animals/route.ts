import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import pool from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { name, type, breed, color, birthDate, identifier, identifierType } =
      await req.json();

    const authHeader = req.headers.get("authorization");
    const token = authHeader?.split(" ")[1];

    if (!token) {
      return NextResponse.json(
        { error: "Musisz być zalogowany" },
        { status: 401 },
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
      role: string;
    };

    if (!name || !type || !color || !identifier || !identifierType) {
      return NextResponse.json(
        { error: 'Wypełnij wszystkie wymagane pola' },
        { status: 400 },
      );
    }

    const result = await pool.query(
      `INSERT INTO animals (name, type, breed, color, birth_date, identifier, identifier_type, owner_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [name, type, breed, color, birthDate, identifier, identifierType, decoded.id],
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Błąd serwera" }, { status: 500 });
  }
}