"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle, XCircle, User, Database } from "lucide-react"

interface AuthResponse {
  success: boolean
  user?: {
    id: string
    email: string
    name: string
    createdAt: string
  }
  token?: string
  error?: string
}

interface DatabaseTestResponse {
  success: boolean
  currentTime?: string
  usersTableColumns?: Array<{ column_name: string; data_type: string }>
  error?: string
  message?: string
}

export function AuthTestPanel() {
  // Registration state
  const [regName, setRegName] = useState("")
  const [regEmail, setRegEmail] = useState("")
  const [regPassword, setRegPassword] = useState("")
  const [regLoading, setRegLoading] = useState(false)
  const [regResult, setRegResult] = useState<AuthResponse | null>(null)

  // Login state
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [loginLoading, setLoginLoading] = useState(false)
  const [loginResult, setLoginResult] = useState<AuthResponse | null>(null)

  // Current user state
  const [currentUser, setCurrentUser] = useState<AuthResponse["user"] | null>(null)

  const [dbTestLoading, setDbTestLoading] = useState(false)
  const [dbTestResult, setDbTestResult] = useState<DatabaseTestResponse | null>(null)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setRegLoading(true)
    setRegResult(null)

    try {
      console.log("[v0] Starting registration with:", { name: regName, email: regEmail })

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: regName,
          email: regEmail,
          password: regPassword,
        }),
      })

      const data = await response.json()
      console.log("[v0] Registration response:", data)

      setRegResult(data)

      if (data.success) {
        setCurrentUser(data.user)
        // Clear form on success
        setRegName("")
        setRegEmail("")
        setRegPassword("")
      }
    } catch (error) {
      console.error("[v0] Registration error:", error)
      setRegResult({ success: false, error: "Network error occurred" })
    } finally {
      setRegLoading(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginLoading(true)
    setLoginResult(null)

    try {
      console.log("[v0] Starting login with:", { email: loginEmail })

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword,
        }),
      })

      const data = await response.json()
      console.log("[v0] Login response:", data)

      setLoginResult(data)

      if (data.success) {
        setCurrentUser(data.user)
        // Clear form on success
        setLoginEmail("")
        setLoginPassword("")
      }
    } catch (error) {
      console.error("[v0] Login error:", error)
      setLoginResult({ success: false, error: "Network error occurred" })
    } finally {
      setLoginLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      setCurrentUser(null)
      setLoginResult(null)
      setRegResult(null)
    } catch (error) {
      console.error("[v0] Logout error:", error)
    }
  }

  const testCurrentUser = async () => {
    try {
      const response = await fetch("/api/auth/me")
      const data = await response.json()
      console.log("[v0] Current user check:", data)

      if (data.success) {
        setCurrentUser(data.user)
      }
    } catch (error) {
      console.error("[v0] Current user check error:", error)
    }
  }

  const testDatabaseConnection = async () => {
    setDbTestLoading(true)
    setDbTestResult(null)

    try {
      console.log("[v0] Testing database connection...")

      const response = await fetch("/api/test-db")
      const data = await response.json()
      console.log("[v0] Database test response:", data)

      setDbTestResult(data)
    } catch (error) {
      console.error("[v0] Database test error:", error)
      setDbTestResult({ success: false, error: "Network error occurred" })
    } finally {
      setDbTestLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Authentication Test Panel</h1>
        <p className="text-muted-foreground">Test user registration and login functionality</p>
      </div>

      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Database className="w-5 h-5" />
            Database Connection Test
          </CardTitle>
          <CardDescription className="text-blue-600">
            Test the Neon database connection before trying authentication
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={testDatabaseConnection} disabled={dbTestLoading} className="mb-4">
            {dbTestLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Testing Connection...
              </>
            ) : (
              <>
                <Database className="w-4 h-4 mr-2" />
                Test Database Connection
              </>
            )}
          </Button>

          {dbTestResult && (
            <Alert className={`${dbTestResult.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}>
              <div className="flex items-center gap-2">
                {dbTestResult.success ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-600" />
                )}
                <AlertDescription className={dbTestResult.success ? "text-green-800" : "text-red-800"}>
                  {dbTestResult.success ? (
                    <div className="space-y-2">
                      <p>{dbTestResult.message}</p>
                      <p>
                        <strong>Current Time:</strong> {dbTestResult.currentTime}
                      </p>
                      <div>
                        <strong>users_sync Table Columns:</strong>
                        <ul className="list-disc list-inside ml-4 mt-1">
                          {dbTestResult.usersTableColumns?.map((col, idx) => (
                            <li key={idx}>
                              {col.column_name} ({col.data_type})
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ) : (
                    dbTestResult.error
                  )}
                </AlertDescription>
              </div>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Current User Status */}
      {currentUser && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <User className="w-5 h-5" />
              Logged In User
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-green-700">
              <p>
                <strong>ID:</strong> {currentUser.id}
              </p>
              <p>
                <strong>Name:</strong> {currentUser.name}
              </p>
              <p>
                <strong>Email:</strong> {currentUser.email}
              </p>
              <p>
                <strong>Created:</strong> {new Date(currentUser.createdAt).toLocaleString()}
              </p>
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={handleLogout} variant="outline" size="sm">
                Logout
              </Button>
              <Button onClick={testCurrentUser} variant="outline" size="sm">
                Check Current User
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="register" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="register">Register</TabsTrigger>
          <TabsTrigger value="login">Login</TabsTrigger>
        </TabsList>

        <TabsContent value="register">
          <Card>
            <CardHeader>
              <CardTitle>User Registration</CardTitle>
              <CardDescription>Create a new user account</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <Label htmlFor="reg-name">Name</Label>
                  <Input
                    id="reg-name"
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Enter your name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="reg-email">Email</Label>
                  <Input
                    id="reg-email"
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="reg-password">Password</Label>
                  <Input
                    id="reg-password"
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Enter password (min 8 characters)"
                    minLength={8}
                    required
                  />
                </div>
                <Button type="submit" disabled={regLoading} className="w-full">
                  {regLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    "Register"
                  )}
                </Button>
              </form>

              {regResult && (
                <Alert
                  className={`mt-4 ${regResult.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}
                >
                  <div className="flex items-center gap-2">
                    {regResult.success ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-600" />
                    )}
                    <AlertDescription className={regResult.success ? "text-green-800" : "text-red-800"}>
                      {regResult.success ? "Account created successfully!" : regResult.error}
                    </AlertDescription>
                  </div>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="login">
          <Card>
            <CardHeader>
              <CardTitle>User Login</CardTitle>
              <CardDescription>Sign in to your account</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                  />
                </div>
                <Button type="submit" disabled={loginLoading} className="w-full">
                  {loginLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Signing In...
                    </>
                  ) : (
                    "Login"
                  )}
                </Button>
              </form>

              {loginResult && (
                <Alert
                  className={`mt-4 ${loginResult.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}
                >
                  <div className="flex items-center gap-2">
                    {loginResult.success ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-600" />
                    )}
                    <AlertDescription className={loginResult.success ? "text-green-800" : "text-red-800"}>
                      {loginResult.success ? "Login successful!" : loginResult.error}
                    </AlertDescription>
                  </div>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Test Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Testing Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <strong>0. Database Test:</strong> Click "Test Database Connection" first to verify setup
          </p>
          <p>
            <strong>1. Register:</strong> Create a new account with name, email, and password (min 8 chars)
          </p>
          <p>
            <strong>2. Login:</strong> Use the same email/password to sign in
          </p>
          <p>
            <strong>3. Check Browser Console:</strong> Debug logs show API responses
          </p>
          <p>
            <strong>4. Database:</strong> Check your Neon dashboard to see user records
          </p>
          <p>
            <strong>5. Cookies:</strong> Auth tokens are stored as HTTP-only cookies
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
