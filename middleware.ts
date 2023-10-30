import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { system } from "./connections/redis";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  if (request.cookies.has("ip")) {
    return response;
  }

  const ip = await system.get<string>("ip");
  if (!ip) {
    return Response.json({
      success: false,
      message: "Please restart the server ... ",
    }, {
      status: 500,
    });
  }

  response.cookies.set("ip", ip, {
    path: "/",
    httpOnly: false,
    secure: false,
    expires: Date.now() + 86400000,
  });

  return response;
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: "/",
};
