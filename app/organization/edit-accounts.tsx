"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { User } from "@prisma/client"
import axios from "axios"
import {
  Bell,
  Contact,
  ContactIcon,
  Copy,
  Key,
  Pencil,
  User as UserIcon,
} from "lucide-react"
import {
  Field,
  FieldValues,
  SubmitHandler,
  useForm,
  useWatch,
} from "react-hook-form"
import { toast } from "react-hot-toast"

import "react-phone-number-input/style.css"
import { isPossiblePhoneNumber } from "react-phone-number-input"
import PhoneInput from "react-phone-number-input/react-hook-form-input"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Icons } from "@/components/icons"

function generateRandomString(length: number) {
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  var randomString = ""
  for (var i = 0; i < length; i++) {
    var randomIndex = Math.floor(Math.random() * characters.length)
    randomString += characters.charAt(randomIndex)
  }
  return randomString
}

function capitalizeText(text: string) {
  const words = text.trim().split(/\s+/)
  const capitalizedWords = words.map((word) => {
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  })

  const capitalizedText = capitalizedWords.join(" ")

  return capitalizedText
}

const EditEmployee = ({ user }: { user: User }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [pageNumber, setPageNumber] = useState(0)
  const [createdUser, setCreatedUser] = useState<User>()
  const router = useRouter()
  const [formattedUsername, currentOrganization] = user.username.split("@")
  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FieldValues>({
    defaultValues: {
      name: user.name,
      username: formattedUsername,
      email: user.email,
      phoneNumber: user.phone,
    },
  })

  const oldUsername = user.username

  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    setIsLoading(true)

    const user = {
      name: capitalizeText(data.name),
      username: `${data.username.toLowerCase()}@${currentOrganization.toLowerCase()}`,
      email: data.email,
      phoneNumber: data.phoneNumber,
      password: data.password,
      currentOrganization: capitalizeText(currentOrganization),
      oldUsername: oldUsername,
    }

    axios
      .post("/api/auth/organization/updateemployee", user)
      .then((response) => {
        if (response.status !== 200) throw new Error("Employee Not Updated")
        toast.success("Employee Updated")
        reset()
        setCreatedUser(response.data.user)
        setPageNumber(1)
        router.refresh()
      })
      .catch((error) => {
        toast.error(error.response.data.msg)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  const username = useWatch({
    control,
    name: "username",
    defaultValue: formattedUsername,
  })

  const handleChooseContent = () => {
    if (pageNumber === 0) {
      return (
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className=" mb-4">
              Add An Employee
            </AlertDialogTitle>
            <div className="flex flex-col gap-8">
              <div className="flex flex-col gap-2">
                <Label htmlFor="name">Employee Name</Label>
                <Input
                  className="capitalize"
                  {...register("name", { required: "Name is required" })}
                  type="text"
                  id="name"
                  placeholder="Name"
                  disabled={isLoading}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  disabled={isLoading}
                  {...register("username", {
                    required: "Username is required",
                    pattern: {
                      value: /^[^\s]+$/,
                      message: "Spaces are not allowed in the username",
                    },
                  })}
                  className="lowercase"
                  type="text"
                  id="username"
                  placeholder="Username"
                />
                <div className="text-sm text-muted-foreground">
                  {`${username.toLowerCase()}@${currentOrganization.toLowerCase()}`}
                </div>
                <div className="text-sm lowercase text-rose-500">
                  {errors["username"]?.message?.toString() ===
                    "Spaces are not allowed in the username" && (
                    <div>{errors["username"]?.message.toString()}</div>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  className="capitalize"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /\S+@\S+\.\S+/,
                      message: "Entered value does not match email format",
                    },
                  })}
                  type="email"
                  id="email"
                  placeholder="Email"
                  disabled={isLoading}
                />
              </div>

              <PhoneInput
                withCountryCallingCode
                placeholder="Phone Number"
                className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                name="phoneNumber"
                control={control}
                rules={{ required: true, validate: isPossiblePhoneNumber }}
              />

              <div className="flex flex-col gap-2">
                <Label htmlFor="password">Password</Label>
                <div className="flex gap-2">
                  <Input
                    disabled={isLoading}
                    {...register("password", {
                      required: "Password is required",
                    })}
                    type="text"
                    id="password"
                    placeholder="Password"
                  />
                  <Button
                    disabled={isLoading}
                    onClick={() => {
                      const randomString = generateRandomString(15)
                      setValue("password", randomString)
                    }}
                    type="submit"
                  >
                    Random
                  </Button>
                </div>
                <div className="text-sm text-muted-foreground">
                  Enter text to be hased into password
                </div>
              </div>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>

            <Button onClick={handleSubmit(onSubmit)} disabled={isLoading}>
              {isLoading && (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              )}
              Update Employee
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      )
    }
    if (pageNumber === 1) {
      if (!createdUser) return
      return (
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>User</AlertDialogTitle>
            <div className="flex flex-col gap-2">
              <div
                onClick={() => navigator.clipboard.writeText(createdUser.name)}
                className="flex items-center justify-between space-x-4 rounded-md p-2 hover:bg-accent hover:text-accent-foreground"
              >
                <div className="flex items-center space-x-4">
                  <UserIcon className="h-5 w-5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">Name</p>
                    <p className="text-sm text-muted-foreground">
                      {createdUser.name}
                    </p>
                  </div>
                </div>
                <Copy className=" mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
              </div>

              <div
                onClick={() =>
                  navigator.clipboard.writeText(createdUser.username)
                }
                className="flex items-center justify-between  space-x-4 rounded-md  p-2 hover:bg-accent hover:text-accent-foreground"
              >
                <div className="flex items-center space-x-4">
                  <Contact className="h-5 w-5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">Username</p>
                    <p className="text-sm text-muted-foreground">
                      {createdUser.username}
                    </p>
                  </div>
                </div>
                <Copy className=" mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
              </div>

              <div
                onClick={() =>
                  createdUser.hashedPassword &&
                  navigator.clipboard.writeText(createdUser.hashedPassword)
                }
                className="flex items-center justify-between space-x-4 rounded-md p-2 hover:bg-accent hover:text-accent-foreground"
              >
                <div className="flex items-center space-x-4">
                  <Key className="h-5 w-5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">Password</p>
                    <p className="text-[10px] text-muted-foreground">
                      {createdUser.hashedPassword}
                    </p>
                  </div>
                </div>
                <Copy className=" mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
              </div>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPageNumber(0)}>
              Close
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      )
    } else {
      return <div></div>
    }
  }

  return (
    <div className="flex items-center space-x-2">
      <AlertDialog>
        <AlertDialogTrigger className=" relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent focus:bg-accent  focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
          <Pencil className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
          Edit
        </AlertDialogTrigger>
        {handleChooseContent()}
      </AlertDialog>
    </div>
  )
}

export default EditEmployee
