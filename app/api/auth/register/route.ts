import { NextResponse } from "next/server"
import bcrypt from "bcrypt"

import prisma from "@/lib/prisma"

export async function POST(request: Request) {
  const body = await request.json()
  const { name, type, username, password, latitude, longitude, radius } = body

  if (!name || !type || !password || !username)
    return NextResponse.json({ msg: "Missing Fields" }, { status: 400 })

  if (type === "ORGANIZATION") {
    if (!latitude || !longitude || !radius)
      return NextResponse.json({ msg: "Missing Fields" }, { status: 400 })
    const userWithSameUsername = await prisma.user.findMany({
      where: {
        username: username,
      },
    })

    if (userWithSameUsername.length !== 0)
      return NextResponse.json({ msg: "Username Taken" }, { status: 409 })

    const organizationWithSameName = await prisma.organization.findUnique({
      where: {
        name: name,
      },
    })

    if (organizationWithSameName)
      return NextResponse.json({ msg: "Organization Taken" }, { status: 409 })

    const coordinate = await prisma.coordinate.create({
      data: {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        radius: parseInt(radius),
      },
    })

    const organization = await prisma.organization.create({
      data: {
        name: name,
        coordinateId: coordinate.id,
      },
    })

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: {
        name,
        role: "ORGANIZATION",
        username,
        hashedPassword: hashedPassword,
        organizationId: organization.id,
      },
    })

    return NextResponse.json({ msg: "User Created", user }, { status: 200 })
  } else if (type === "EDUCATIONAL") {
    if (!latitude || !longitude || !radius)
      return NextResponse.json({ msg: "Missing Fields" }, { status: 400 })
    const userWithSameUsername = await prisma.user.findMany({
      where: {
        username: username,
      },
    })

    if (userWithSameUsername.length !== 0)
      return NextResponse.json({ msg: "Username Taken" }, { status: 409 })

    const educationalWithSameName = await prisma.educational.findUnique({
      where: {
        name: name,
      },
    })

    if (educationalWithSameName)
      return NextResponse.json({ msg: "Educational Taken" }, { status: 409 })

    const coordinate = await prisma.coordinate.create({
      data: {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        radius: parseInt(radius),
      },
    })

    const educational = await prisma.educational.create({
      data: {
        name: name,
        coordinateId: coordinate.id,
      },
    })

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: {
        name,
        role: "EDUCATIONAL",
        username,
        hashedPassword: hashedPassword,
        educationalId: educational.id,
      },
    })

    return NextResponse.json({ msg: "User Created", user }, { status: 200 })
  } else
    return NextResponse.json({ msg: "Type Must Be O or E" }, { status: 400 })
}
