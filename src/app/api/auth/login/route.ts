import { NextRequest, NextResponse } from "next/server"; // narzędzie do obsługi ządań i odpowiedzi
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"; // biblioteka do tworzenia i weryfikowania tokenów
import pool from "@/lib/db"; // połączenie z bazą danych

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    const result = await pool.query(`SELECT * FROM users WHERE email = $1`, [
      email,
    ]);

    if (!result.rows[0]) {
      return NextResponse.json(
        { error: "Nieprawidłowy email lub hasło" },
        { status: 401 },
      );
    }

    const passwordMatch = await bcrypt.compare(
      password,
      result.rows[0].password,
    );
    if (!passwordMatch) {
      return NextResponse.json(
        { error: "Nieprawidłowy email lub hasło" },
        { status: 401 },
      );
    }

    const token = jwt.sign(
      { id: result.rows[0].id, role: result.rows[0].role },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" },
    );

    return NextResponse.json({ token });
  } catch (error) {
    return NextResponse.json({ error: "Błąd serwera" }, { status: 500 });
  }
}
