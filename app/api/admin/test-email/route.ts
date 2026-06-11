import { NextResponse } from "next/server"
import { isAdminAuthenticated, unauthorizedResponse } from "@/backend/services/admin-auth"
import { sendTestEmail } from "@/shared/email"

function normalizeEmail(value: unknown) {
  return String(value ?? "").trim()
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return unauthorizedResponse()
  }

  const body = await request.json().catch(() => null)
  const to = normalizeEmail(body?.to)

  if (!to) {
    return NextResponse.json(
      {
        message: "Informe um e-mail para teste.",
      },
      {
        status: 400,
      }
    )
  }

  const result = await sendTestEmail(to)

  if (!result.sent) {
    return NextResponse.json(
      {
        ...result,
        message: result.message,
      },
      {
        status: 400,
      }
    )
  }

  return NextResponse.json(result)
}
