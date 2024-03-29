import { NextResponse } from "next/server"

import prisma from "@/lib/prisma"

export async function POST(request: Request) {
  const body = await request.json()
  const { userId } = body

  if (!userId)
    return NextResponse.json({ msg: "Missing Fields" }, { status: 400 })

  await prisma?.user.delete({
    where: {
      id: userId,
    },
  })

  return NextResponse.json({ msg: "User Deleted" }, { status: 200 })
}
