import { NextResponse } from "next/server"
import { isAdminAuthenticated, unauthorizedResponse } from "@/services/admin-auth"

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return unauthorizedResponse()
  }

  return NextResponse.json({
    ok: true,
  })
}
