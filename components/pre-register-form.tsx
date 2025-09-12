"use client"

import type React from "react"

import { useState } from "react"
import { X, Loader2, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useCyberpunkTheme } from "@/contexts/cyberpunk-theme-context"
import styled from "@emotion/styled"
import { keyframes } from "@emotion/react"

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`

const CyberDialog = styled.div`
  position: fixed;
  inset: 0;
  z-index: 10000;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
  animation: ${fadeIn} 0.3s ease-out;
  padding-bottom: 2rem;
  
  @media (min-width: 640px) {
    align-items: center;
    padding-bottom: 0;
  }
`

const CyberForm = styled.div`
  background: linear-gradient(135deg, rgba(16, 16, 48, 0.95) 0%, rgba(32, 16, 64, 0.95) 100%);
  border: 2px solid rgba(0, 255, 255, 0.3);
  border-radius: 12px;
  padding: 2rem;
  width: 90%;
  max-width: 400px;
  position: relative;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  margin-bottom: 6rem;
  
  @media (min-width: 640px) {
    margin-bottom: 0;
  }
  
  &::before {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    background: linear-gradient(45deg, #0ff, #f0f, #0ff, #f0f);
    border-radius: 12px;
    z-index: -1;
    opacity: 0.3;
  }
`

const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  transition: color 0.2s ease;
  
  &:hover {
    color: white;
  }
`

interface PreRegisterFormProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function PreRegisterForm({ isOpen, onClose, onSuccess }: PreRegisterFormProps) {
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState("")
  const { styleMode } = useCyberpunkTheme()
  const isCyberpunk = styleMode === "cyberpunk"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!username.trim() || !email.trim()) {
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
          firstName: username.trim(),
          email: email.trim(),
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setIsSuccess(true)
        setUsername("")
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
      setUsername("")
      setEmail("")
      setError("")
    }
  }

  if (!isOpen) return null

  if (isSuccess) {
    return (
      <CyberDialog>
        {isCyberpunk ? (
          <CyberForm>
            <div className="text-center">
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">Success!</h3>
              <p className="text-cyan-300 mb-4">
                Thank you for signing up! You're now registered for the airdrop and in-app rewards.
              </p>
              <p className="text-sm text-gray-300">Closing automatically...</p>
            </div>
          </CyberForm>
        ) : (
          <div className="bg-slate-800 border border-slate-600 rounded-lg p-8 w-90 max-w-md text-center mb-24 sm:mb-0">
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">Success!</h3>
            <p className="text-slate-300 mb-4">
              Thank you for signing up! You're now registered for the airdrop and in-app rewards.
            </p>
            <p className="text-sm text-slate-400">Closing automatically...</p>
          </div>
        )}
      </CyberDialog>
    )
  }

  return (
    <CyberDialog>
      {isCyberpunk ? (
        <CyberForm>
          <CloseButton onClick={handleClose} aria-label="Close form">
            <X size={24} />
          </CloseButton>

          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">Join the Airdrop</h2>
            <p className="text-cyan-300 text-sm">
              Sign up to receive free tokens when we launch plus exclusive in-app rewards!
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="username" className="text-white font-medium">
                Username
              </Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                maxLength={40}
                className="mt-1 bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-cyan-400 focus:ring-cyan-400"
                placeholder="Enter your username"
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
                className="mt-1 bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-cyan-400 focus:ring-cyan-400"
                placeholder="Enter your email"
                disabled={isSubmitting}
              />
            </div>

            {error && (
              <div className="text-red-400 text-sm bg-red-900/20 border border-red-800 rounded p-2">{error}</div>
            )}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-600 hover:to-pink-600 text-white font-bold py-2 px-4 rounded transition-all duration-200"
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
        </CyberForm>
      ) : (
        <div className="bg-slate-800 border border-slate-600 rounded-lg p-8 w-90 max-w-md relative mb-24 sm:mb-0">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white"
            aria-label="Close form"
          >
            <X size={24} />
          </button>

          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">Join the Airdrop</h2>
            <p className="text-slate-300 text-sm">
              Sign up to receive free tokens when we launch plus exclusive in-app rewards!
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="username" className="text-white font-medium">
                Username
              </Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                maxLength={40}
                className="mt-1 bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-blue-400 focus:ring-blue-400"
                placeholder="Enter your username"
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
                className="mt-1 bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-blue-400 focus:ring-blue-400"
                placeholder="Enter your email"
                disabled={isSubmitting}
              />
            </div>

            {error && (
              <div className="text-red-400 text-sm bg-red-900/20 border border-red-800 rounded p-2">{error}</div>
            )}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-all duration-200"
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
      )}
    </CyberDialog>
  )
}
