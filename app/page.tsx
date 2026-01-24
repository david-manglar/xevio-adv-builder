"use client"

import { useState, useEffect } from "react"
import { StepIndicator } from "@/components/step-indicator"
import { StepOne } from "@/components/step-campaign-setup"
import { StepTwo } from "@/components/step-reference-pages"
import { StepThree } from "@/components/step-building-blocks"
import { StepFour } from "@/components/step-insights"
import { StepFive } from "@/components/step-review"
import { StepGenerating } from "@/components/step-generating"
import { HistoryMenu } from "@/components/history-menu"
import { UserMenu } from "@/components/user-menu"
import { LoginScreen } from "@/components/login-screen"
import { Clock, User, Loader2 } from "lucide-react"
import { StepOneState, StepTwoState, StepThreeState, StepFourState, CampaignData } from "@/lib/types"
import { supabase } from "@/lib/supabase"
import { getSession, signOut, onAuthStateChange } from "@/lib/auth"

export default function AdvertorialBuilder() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [userEmail, setUserEmail] = useState<string>("")
  const [userId, setUserId] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isHistoryMenuOpen, setIsHistoryMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)

  const [campaignData, setCampaignData] = useState<CampaignData>({})

  const [stepOneData, setStepOneData] = useState<StepOneState>({
    topic: "",
    campaignType: "",
    niche: "",
    country: "",
    language: "",
    length: "",
    paragraphLength: "",
    guidelines: "",
  })

  const [stepTwoData, setStepTwoData] = useState<StepTwoState>({
    referenceUrls: [{ url: "", description: "" }],
  })

  const [stepThreeData, setStepThreeData] = useState<StepThreeState>({
    data: { usps: [], pricing: [], mainAngle: [], toneOfVoice: [], keyHooks: [] },
    initialized: false,
  })

  const [stepFourData, setStepFourData] = useState<StepFourState>({
    blocks: [],
    initialized: false,
  })

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const session = await getSession()
        if (session?.user) {
          setIsLoggedIn(true)
          setUserEmail(session.user.email || "")
          setUserId(session.user.id)
        }
      } catch (error) {
        console.error("Error checking session:", error)
      } finally {
        setIsCheckingAuth(false)
      }
    }

    checkSession()

    // Subscribe to auth state changes
    const subscription = onAuthStateChange((session) => {
      if (session?.user) {
        setIsLoggedIn(true)
        setUserEmail(session.user.email || "")
        setUserId(session.user.id)
      } else {
        setIsLoggedIn(false)
        setUserEmail("")
        setUserId(null)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const handleLogin = (email: string) => {
    setUserEmail(email)
    setIsLoggedIn(true)
  }

  const handleLogout = async () => {
    try {
      await signOut()
      setIsLoggedIn(false)
      setUserEmail("")
      setUserId(null)
      setCurrentStep(1)
      setIsUserMenuOpen(false)
      // Reset all form data
      setCampaignData({})
      setStepOneData({
        topic: "",
        campaignType: "",
        niche: "",
        country: "",
        language: "",
        length: "",
        paragraphLength: "",
        guidelines: "",
      })
      setStepTwoData({ referenceUrls: [{ url: "", description: "" }] })
      setStepThreeData({
        data: { usps: [], pricing: [], mainAngle: [], toneOfVoice: [], keyHooks: [] },
        initialized: false,
      })
      setStepFourData({ blocks: [], initialized: false })
      setIsGenerating(false)
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  const handleNextStep = () => {
    if (currentStep < 5) {
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
    setCampaignData({})
    // Reset form data for new campaign
    setStepOneData({
      topic: "",
      campaignType: "",
      niche: "",
      country: "",
      language: "",
      length: "",
      paragraphLength: "",
      guidelines: "",
    })
    setStepTwoData({ referenceUrls: [""] })
    setStepThreeData({
      data: { usps: [], pricing: [], mainAngle: [], toneOfVoice: [], keyHooks: [] },
      initialized: false,
    })
    setStepFourData({ blocks: [], initialized: false })
  }

  const handleJumpToStep = (step: number) => {
    setCurrentStep(step)
  }

  // Reset insights data when a full re-scrape is triggered
  const handleResetInsights = () => {
    setStepThreeData({
      data: { usps: [], pricing: [], mainAngle: [], toneOfVoice: [], keyHooks: [] },
      initialized: false,
    })
    // Clear the cached scraping result so Step 3 will wait for new data
    setCampaignData(prev => ({ 
      ...prev, 
      scrapingResult: undefined,
      status: undefined,
    }))
  }

  // Listen for campaign updates when generating
  useEffect(() => {
    if (isGenerating && campaignData.id) {
      const channel = supabase
        .channel(`campaign-generating-${campaignData.id}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'campaigns',
            filter: `id=eq.${campaignData.id}`,
          },
          (payload) => {
            const newStatus = payload.new.status
            const generatedContent = payload.new.generated_content
            const docName = payload.new.doc_name
            
            // Update local state if status changed or content arrived
            if (newStatus && newStatus !== campaignData.status) {
              setCampaignData((prev) => ({
                ...prev,
                status: newStatus,
                generated_content: generatedContent || prev.generated_content,
                doc_name: docName || prev.doc_name,
              }))
            } else if (generatedContent && generatedContent !== campaignData.generated_content) {
               setCampaignData((prev) => ({
                ...prev,
                generated_content: generatedContent,
                doc_name: docName || prev.doc_name,
              }))
            }
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }
  }, [isGenerating, campaignData.id, campaignData.status, campaignData.generated_content])

  // Show loading spinner while checking auth
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-[#4644B6]" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
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
        <HistoryMenu isOpen={isHistoryMenuOpen} onClose={() => setIsHistoryMenuOpen(false)} userId={userId} />
        <UserMenu
          isOpen={isUserMenuOpen}
          onClose={() => setIsUserMenuOpen(false)}
          onLogout={handleLogout}
          userEmail={userEmail}
        />
        <main className="mx-auto max-w-5xl px-6 py-8">
          <StepGenerating 
            onComplete={handleStartOver} 
            status={campaignData.generated_content ? 'completed' : 'generating'}
            documentUrl={campaignData.generated_content}
            documentName={campaignData.doc_name}
            topic={stepOneData.topic}
          />
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {header}
      <HistoryMenu isOpen={isHistoryMenuOpen} onClose={() => setIsHistoryMenuOpen(false)} userId={userId} />
      <UserMenu
        isOpen={isUserMenuOpen}
        onClose={() => setIsUserMenuOpen(false)}
        onLogout={handleLogout}
        userEmail={userEmail}
      />
      <div className="border-b border-border bg-card/50 py-6">
        <div className="mx-auto max-w-6xl px-6">
          <StepIndicator currentStep={currentStep} />
        </div>
      </div>
      <main className="mx-auto max-w-5xl px-6 py-8">
        {currentStep === 1 && (
          <StepOne 
            data={stepOneData} 
            updateData={setStepOneData} 
            onNext={handleNextStep}
            campaignData={campaignData}
          />
        )}
        {currentStep === 2 && (
          <StepTwo
            stepOneData={stepOneData}
            data={stepTwoData}
            updateData={setStepTwoData}
            onNext={handleNextStep}
            onBack={handlePrevStep}
            isLoading={isLoading}
            onCampaignCreated={(data) => setCampaignData(prev => ({ ...prev, ...data }))}
            onResetInsights={handleResetInsights}
            userId={userId}
            campaignData={campaignData}
          />
        )}
        {currentStep === 3 && (
          <StepFour 
            onBack={handlePrevStep} 
            onNext={handleNextStep} 
            campaignData={campaignData}
            stepOneData={stepOneData}
            data={stepFourData}
            updateData={setStepFourData}
          />
        )}
        {currentStep === 4 && (
          <StepThree 
            onBack={handlePrevStep} 
            onNext={handleNextStep}
            campaignData={campaignData}
            updateCampaignData={setCampaignData}
            data={stepThreeData}
            updateData={setStepThreeData}
          />
        )}
        {currentStep === 5 && (
          <StepFive 
            onBack={handlePrevStep} 
            onGenerate={handleGenerate} 
            onJumpToStep={handleJumpToStep}
            stepOneData={stepOneData}
            stepTwoData={stepTwoData}
            stepThreeData={stepThreeData}
            stepFourData={stepFourData}
            campaignData={campaignData}
          />
        )}
      </main>
    </div>
  )
}
