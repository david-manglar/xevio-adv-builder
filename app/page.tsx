"use client"

import { useState } from "react"
import { StepIndicator } from "@/components/step-indicator"
import { StepOne } from "@/components/step-one"
import { StepTwo } from "@/components/step-two"
import { StepThree } from "@/components/step-three"
import { StepFour } from "@/components/step-four"
import { StepFive } from "@/components/step-five"
import { StepGenerating } from "@/components/step-generating"
import { HistoryMenu } from "@/components/history-menu"
import { UserMenu } from "@/components/user-menu"
import { LoginScreen } from "@/components/login-screen"
import { Clock, User } from "lucide-react"

export default function AdvertorialBuilder() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isHistoryMenuOpen, setIsHistoryMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)

  const handleLogin = () => {
    setIsLoggedIn(true)
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setCurrentStep(1)
    setIsUserMenuOpen(false)
  }

  const handleNextStep = () => {
    if (currentStep === 2) {
      setIsLoading(true)
      setTimeout(() => {
        setIsLoading(false)
        setCurrentStep(3)
      }, 2000)
    } else if (currentStep < 5) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleGenerate = () => {
    setIsGenerating(true)
  }

  const handleStartOver = () => {
    setIsGenerating(false)
    setCurrentStep(1)
  }

  const handleJumpToStep = (step: number) => {
    setCurrentStep(step)
  }

  // Show login screen if not logged in
  if (!isLoggedIn) {
    return <LoginScreen onLogin={handleLogin} />
  }

  const header = (
    <header className="border-b border-border bg-card">
      <div className="mx-auto max-w-6xl px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/images/xevio-color.svg" alt="Xevio" className="h-8 w-8" />
            <span className="text-lg font-semibold text-foreground">Advertorial Builder</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="p-2 rounded-md hover:bg-muted text-muted-foreground"
              onClick={() => setIsHistoryMenuOpen(true)}
              title="Request History"
            >
              <Clock className="h-5 w-5" />
            </button>
            <button
              className="p-2 rounded-md hover:bg-muted text-muted-foreground"
              onClick={() => setIsUserMenuOpen(true)}
              title="Account"
            >
              <User className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  )

  if (isGenerating) {
    return (
      <div className="min-h-screen bg-background">
        {header}
        <HistoryMenu isOpen={isHistoryMenuOpen} onClose={() => setIsHistoryMenuOpen(false)} />
        <UserMenu
          isOpen={isUserMenuOpen}
          onClose={() => setIsUserMenuOpen(false)}
          onLogout={handleLogout}
          userEmail="demo@xevio.com"
        />
        <main className="mx-auto max-w-5xl px-6 py-8">
          <StepGenerating onComplete={handleStartOver} />
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {header}
      <HistoryMenu isOpen={isHistoryMenuOpen} onClose={() => setIsHistoryMenuOpen(false)} />
      <UserMenu
        isOpen={isUserMenuOpen}
        onClose={() => setIsUserMenuOpen(false)}
        onLogout={handleLogout}
        userEmail="demo@xevio.com"
      />
      <div className="border-b border-border bg-card/50 py-6">
        <div className="mx-auto max-w-6xl px-6">
          <StepIndicator currentStep={currentStep} />
        </div>
      </div>
      <main className="mx-auto max-w-5xl px-6 py-8">
        {currentStep === 1 && <StepOne onNext={handleNextStep} />}
        {currentStep === 2 && <StepTwo onNext={handleNextStep} onBack={handlePrevStep} isLoading={isLoading} />}
        {currentStep === 3 && <StepThree onBack={handlePrevStep} onNext={handleNextStep} />}
        {currentStep === 4 && <StepFour onBack={handlePrevStep} onNext={handleNextStep} />}
        {currentStep === 5 && (
          <StepFive onBack={handlePrevStep} onGenerate={handleGenerate} onJumpToStep={handleJumpToStep} />
        )}
      </main>
    </div>
  )
}
