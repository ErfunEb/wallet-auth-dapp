import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import redis from "../../../lib/redis";
import { parseDurationToSeconds } from "../../../helper/time";

export async function POST(request: Request) {
  const cookie = await cookies();
  const refreshToken = cookie.get("refresh_token")?.value;

  if (!refreshToken) {
    return NextResponse.json(
      { message: "Missing refresh token!" },
      { status: 401 },
    );
  }

  let decoded;
  try {
    decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as {
      address?: string;
    };
  } catch {
    return NextResponse.json(
      { message: "Invalid refresh token!" },
      { status: 403 },
    );
  }

  const address = decoded?.address?.toLowerCase();

  const storedToken = await redis.get(`refresh:${address}`);
  if (!storedToken || storedToken !== refreshToken) {
    return NextResponse.json(
      { message: "Refresh token mismatch!" },
      { status: 403 },
    );
  }

  const authTokenDuration = process.env.AUTH_TOKEN_DURATION ?? "15m";
  const newAccessToken = jwt.sign({ address }, process.env.JWT_SECRET!, {
    expiresIn: authTokenDuration,
  });

  const response = NextResponse.json({ success: true });
  response.cookies.set("auth_token", newAccessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: parseDurationToSeconds(authTokenDuration),
    path: "/",
    sameSite: "lax",
  });

  return response;
}
