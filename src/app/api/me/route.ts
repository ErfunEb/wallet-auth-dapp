import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function GET() {
  const cookie = await cookies();
  const token = cookie.get("auth_token")?.value;

  try {
    const decoded = jwt.verify(token!, process.env.JWT_SECRET!);
    return NextResponse.json({ success: true, address: decoded.address });
  } catch {
    return NextResponse.json({ success: false }, { status: 401 });
  }
}
