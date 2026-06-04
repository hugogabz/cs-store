import { NextResponse } from "next/server"
import {
  ADMIN_SESSION_COOKIE,
  getAdminSessionSecret,
  isValidAdminPassword,
  shouldUseSecureAdminCookie,
} from "@/backend/services/admin-auth"

export async function POST(request: Request) {
  const { password } = await request.json()

  if (!isValidAdminPassword(String(password ?? ""))) {
    return NextResponse.json(
      {
        message: "Senha incorreta",
      },
      {
        status: 401,
      }
    )
  }

  const sessionSecret = getAdminSessionSecret()

  if (!sessionSecret) {
    return NextResponse.json(
      {
        message: "Sessao admin nao configurada",
      },
      {
        status: 500,
      }
    )
  }

  const response = NextResponse.json({
    ok: true,
  })

  response.cookies.set(ADMIN_SESSION_COOKIE, sessionSecret, {
    httpOnly: true,
    maxAge: 60 * 60 * 8,
    path: "/",
    sameSite: "lax",
    secure: shouldUseSecureAdminCookie(),
  })

  return response
}
