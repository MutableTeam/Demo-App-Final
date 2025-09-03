"use client"

import type React from "react"
import { useState } from "react"
import { X, Loader2, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useCyberpunkTheme } from "@/contexts/cyberpunk-theme-context"

interface PreRegisterFormProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function PreRegisterForm({ isOpen, onClose, onSuccess }: PreRegisterFormProps) {
  const [firstName, setFirstName] = useState("")
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState("")
  const { styleMode } = useCyberpunkTheme()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!firstName.trim() || !email.trim()) {
      setError("Please fill in all fields")
      return
    }

    setIsSubmitting(true)
    setError("")

    try {
      const response = await fetch("/api/webtolead", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: firstName.trim(),
          email: email.trim(),
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setIsSuccess(true)
        setFirstName("")
        setEmail("")

        // Auto-close after 2 seconds and trigger success callback
        setTimeout(() => {
          setIsSuccess(false)
          if (onSuccess) {
            onSuccess()
          } else {
            onClose()
          }
        }, 2000)
      } else {
        setError(data.message || "Failed to submit. Please try again.")
      }
    } catch (err) {
      console.error("Submission error:", err)
      setError("Network error. Please check your connection and try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      onClose()
      setIsSuccess(false)
      setFirstName("")
      setEmail("")
      setError("")
    }
  }

  if (!isOpen) return null

  if (isSuccess) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 10000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(0, 0, 0, 0.8)",
          backdropFilter: "blur(8px)",
          padding: "1rem",
        }}
      >
        <div
          style={{
            background:
              styleMode === "cyberpunk"
                ? "linear-gradient(135deg, rgba(16, 16, 48, 0.95) 0%, rgba(32, 16, 64, 0.95) 100%)"
                : "rgb(30, 41, 59)",
            border: styleMode === "cyberpunk" ? "2px solid rgba(0, 255, 255, 0.3)" : "1px solid rgb(71, 85, 105)",
            borderRadius: "12px",
            padding: "2rem",
            width: "90%",
            maxWidth: "400px",
            textAlign: "center",
          }}
        >
          <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-white mb-2">Success!</h3>
          <p className={`mb-4 ${styleMode === "cyberpunk" ? "text-cyan-300" : "text-slate-300"}`}>
            Thank you for signing up! You're now registered for the airdrop and in-app rewards.
          </p>
          <p className="text-sm text-gray-300">Closing automatically...</p>
        </div>
      </div>
    )
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0, 0, 0, 0.8)",
        backdropFilter: "blur(8px)",
        padding: "1rem",
      }}
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div
        style={{
          background:
            styleMode === "cyberpunk"
              ? "linear-gradient(135deg, rgba(16, 16, 48, 0.95) 0%, rgba(32, 16, 64, 0.95) 100%)"
              : "rgb(30, 41, 59)",
          border: styleMode === "cyberpunk" ? "2px solid rgba(0, 255, 255, 0.3)" : "1px solid rgb(71, 85, 105)",
          borderRadius: "12px",
          padding: "2rem",
          width: "90%",
          maxWidth: "400px",
          position: "relative",
        }}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          style={{
            position: "absolute",
            top: "1rem",
            right: "1rem",
            background: "transparent",
            border: "none",
            color: "rgba(255, 255, 255, 0.7)",
            cursor: "pointer",
          }}
          className="hover:text-white transition-colors"
          aria-label="Close form"
        >
          <X size={24} />
        </button>

        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">Join the Airdrop</h2>
          <p className={`text-sm ${styleMode === "cyberpunk" ? "text-cyan-300" : "text-slate-300"}`}>
            Sign up to receive free tokens when we launch plus exclusive in-app rewards!
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="firstName" className="text-white font-medium">
              First Name
            </Label>
            <Input
              id="firstName"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              maxLength={40}
              className={`mt-1 text-white placeholder-slate-400 ${
                styleMode === "cyberpunk"
                  ? "bg-slate-700 border-slate-600 focus:border-cyan-400 focus:ring-cyan-400"
                  : "bg-slate-700 border-slate-600 focus:border-blue-400 focus:ring-blue-400"
              }`}
              placeholder="Enter your first name"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <Label htmlFor="email" className="text-white font-medium">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              maxLength={80}
              className={`mt-1 text-white placeholder-slate-400 ${
                styleMode === "cyberpunk"
                  ? "bg-slate-700 border-slate-600 focus:border-cyan-400 focus:ring-cyan-400"
                  : "bg-slate-700 border-slate-600 focus:border-blue-400 focus:ring-blue-400"
              }`}
              placeholder="Enter your email"
              disabled={isSubmitting}
            />
          </div>

          {error && <div className="text-red-400 text-sm bg-red-900/20 border border-red-800 rounded p-2">{error}</div>}

          <Button
            type="submit"
            disabled={isSubmitting}
            className={`w-full font-bold py-2 px-4 rounded transition-all duration-200 ${
              styleMode === "cyberpunk"
                ? "bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-600 hover:to-pink-600 text-white"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Signing Up...
              </>
            ) : (
              "Sign Up for Airdrop"
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}
