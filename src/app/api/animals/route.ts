import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { verifyToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { name, type, breed, color, birthDate, identifier, identifierType } =
      await req.json();

    const decoded = verifyToken(req);

    if (!decoded) {
      return NextResponse.json(
        { error: "Musisz być zalogowany" },
        { status: 401 },
      );
    }

    if (!name || !type || !color || !identifier || !identifierType) {
      return NextResponse.json(
        { error: "Wypełnij wszystkie wymagane pola" },
        { status: 400 },
      );
    }

    const result = await pool.query(
      `INSERT INTO animals (name, type, breed, color, birth_date, identifier, identifier_type, owner_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        name,
        type,
        breed,
        color,
        birthDate,
        identifier,
        identifierType,
        decoded.id,
      ],
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Błąd serwera" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const identifier = searchParams.get("identifier");

    if (!identifier) {
      return NextResponse.json(
        { error: "Podaj identyfikator (chip)" },
        { status: 400 },
      );
    }

    const result = await pool.query(
      `SELECT * FROM animals WHERE identifier = $1`,
      [identifier],
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Nie znaleziono zwierzęcia" },
        { status: 404 },
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Błąd serwera" }, { status: 500 });
  }
}