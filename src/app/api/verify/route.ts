import { NextResponse } from "next/server";
import { isAddress } from "viem";
import { recoverMessageAddress } from "viem";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import redis from "../../../lib/redis";
import { parseDurationToSeconds } from "../../../helper/time";

export async function POST(request: Request) {
  const { address, signature } = await request.json();

  if (!isAddress(address)) {
    return NextResponse.json(
      { message: "Address is not valid!" },
      { status: 400 },
    );
  }

  const nonce = await redis.get(address.toLowerCase());
  if (!nonce) {
    return NextResponse.json({ message: "Nonce not found" }, { status: 400 });
  }

  try {
    const recoveredAddress = await recoverMessageAddress({
      message: nonce,
      signature,
    });

    const authTokenDuration = process.env.AUTH_TOKEN_DURATION ?? "15m";
    const refreshTokenDuration = process.env.REFRESH_TOKEN_DURATION ?? "1d";

    if (recoveredAddress.toLowerCase() === address.toLowerCase()) {
      const accessToken = jwt.sign({ address }, process.env.JWT_SECRET, {
        expiresIn: authTokenDuration,
      });
      const refreshToken = jwt.sign(
        { address },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: refreshTokenDuration },
      );

      await redis.set(
        `refresh:${address.toLowerCase()}`,
        refreshToken,
        "EX",
        parseDurationToSeconds(refreshTokenDuration),
      );

      const cookie = await cookies();
      cookie.set("auth_token", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: parseDurationToSeconds(authTokenDuration),
      });

      cookie.set("refresh_token", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: parseDurationToSeconds(refreshTokenDuration),
      });

      await redis.del(address.toLowerCase());

      return NextResponse.json({ success: true }, { status: 200 });
    } else {
      return NextResponse.json(
        { success: false, message: "Signature mismatch" },
        { status: 401 },
      );
    }
  } catch (error) {
    console.log({ error });
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
