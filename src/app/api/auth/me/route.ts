import { NextResponse } from "next/server";

import { getCurrentSession } from "@/lib/auth/session";

export async function GET() {
  const user = await getCurrentSession();

  if (!user) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  return NextResponse.json({ user });
}
