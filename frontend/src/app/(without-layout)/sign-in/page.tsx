"use client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/context/AuthContext"
import Users from "@/services/Users"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"

type FormData = {
  email: string
  password: string
}

const SignIn = () => {
  const { register, handleSubmit } = useForm<FormData>();
  const router = useRouter();
  const { setAuthToken } = useAuth();


  const onSubmit = async (data: FormData) => {
    console.log("Form submitted:", data)
    try {
      const user = new Users()
      const response = await user.signIn(data.email, data.password)
      if (response) {
        console.log("Login success:", response.data.token)
        if (response?.data.token) setAuthToken(response.data.token);
         router.push('/bookings')
      } else {
        console.error("Login failed")
      }
    } catch (error) {
      console.error("Error during login:", error)
    }
  }

  return (
    <div className="h-dvh flex justify-center items-center">
      <Card className="max-w-sm">
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
          <CardAction>
            <Button variant="link" onClick={() => router.push('/sign-up')} asChild>
              <div>Sign Up</div>
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  {...register("email")}
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <a
                    href="#"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  {...register("password")}
                />
              </div>
              <Button type="submit" className="w-full">
                Login
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default SignIn