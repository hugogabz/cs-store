import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export const ADMIN_SESSION_COOKIE = "cs-store-admin"

export function isValidAdminPassword(password: string) {
  const adminPassword = process.env.ADMIN_PASSWORD

  return Boolean(adminPassword) && password === adminPassword
}

export function getAdminSessionSecret() {
  return process.env.ADMIN_SESSION_SECRET
}

export function shouldUseSecureAdminCookie() {
  return (
    process.env.NODE_ENV === "production" &&
    process.env.VERCEL_ENV === "production"
  )
}

export async function isAdminAuthenticated() {
  const sessionSecret = getAdminSessionSecret()

  if (!sessionSecret) return false

  const cookieStore = await cookies()
  return cookieStore.get(ADMIN_SESSION_COOKIE)?.value === sessionSecret
}

export function unauthorizedResponse() {
  return NextResponse.json(
    {
      message: "Nao autorizado",
    },
    {
      status: 401,
    }
  )
}
