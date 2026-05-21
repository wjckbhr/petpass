import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import pool from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const { email, password, name, role, clinicName } = await req.json()

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, hasło i imię są wymagane' },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const result = await pool.query(
      `INSERT INTO users (email, password, name, role, clinic_name)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, name, role, clinic_name, created_at`,
      [email, hashedPassword, name, role || 'OWNER', clinicName || null]
    )

    return NextResponse.json(result.rows[0], { status: 201 })
  } catch (error: any) {
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'Ten email jest już zajęty' },
        { status: 409 }
      )
    }
    return NextResponse.json(
      { error: 'Błąd serwera' },
      { status: 500 }
    )
  }
}