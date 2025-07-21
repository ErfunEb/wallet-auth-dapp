import { NextResponse } from "next/server";
import { isAddress } from "viem";
import crypto from "crypto";

import redis from "../../../lib/redis";

export async function POST(request: Request) {
  const { address } = await request.json();

  if (!isAddress(address)) {
    return NextResponse.json(
      { message: "Address is not valid!" },
      { status: 200 },
    );
  }

  const rawNonce = crypto.randomBytes(16).toString("hex");
  const nonce = `Sign this message to login to the App: ${rawNonce}`;
  await redis.set(address.toLowerCase(), nonce, "EX", 300);

  return NextResponse.json({ nonce }, { status: 200 });
}
