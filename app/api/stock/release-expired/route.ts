import { NextResponse } from "next/server"
import { releaseExpiredStockReservations } from "@/backend/services/stock-reservations"

export async function POST() {
  const removed = await releaseExpiredStockReservations()

  return NextResponse.json({
    removed,
  })
}

export async function GET() {
  return POST()
}
