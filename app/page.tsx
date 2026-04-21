"use client"

import { useState, useEffect } from "react"
import { StepIndicator } from "@/components/step-indicator"
import { StepOne } from "@/components/step-campaign-setup"
import { StepTwo, ScrapeRequest } from "@/components/step-reference-pages"
import { StepThree } from "@/components/step-building-blocks"
import { StepFour } from "@/components/step-insights"
import { StepFive } from "@/components/step-review"
import { StepGenerating } from "@/components/step-generating"
import { ModeSelection } from "@/components/mode-selection"
import { LazyModeSetup } from "@/components/lazy-mode-setup"
import { LazyModeReview } from "@/components/lazy-mode-review"
import { HistoryMenu } from "@/components/history-menu"
import { UserMenu } from "@/components/user-menu"
import { AdminPanel } from "@/components/admin-panel"
import { LoginScreen } from "@/components/login-screen"
import { Clock, User, Loader2, Home, ShieldCheck } from "lucide-react"
import { EditingEnvironment } from "@/components/editor/editing-environment"
import { StepOneState, StepTwoState, StepThreeState, StepFourState, LazyModeState, CampaignData } from "@/lib/types"
import { supabase } from "@/lib/supabase"
import { getSession, signOut, onAuthStateChange } from "@/lib/auth"
import { extractUrls } from "@/lib/url-utils"

export default function AdvertorialBuilder() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [userEmail, setUserEmail] = useState<string>("")
  const [userId, setUserId] = useState<string | null>(null)
  const [appMode, setAppMode] = useState<"selecting" | "full" | "lazy">("selecting")
  const [currentStep, setCurrentStep] = useState(1)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isHistoryMenuOpen, setIsHistoryMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [userName, setUserName] = useState<string>("")
  const [isAdmin, setIsAdmin] = useState(false)
  const [showAdminView, setShowAdminView] = useState(false)

  const [campaignData, setCampaignData] = useState<CampaignData>({})
  const [selectedModel, setSelectedModel] = useState("anthropic/claude-sonnet-4.6")

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

  // Lazy Mode state
  const [lazyModeStep, setLazyModeStep] = useState(1)
  const [lazyModeData, setLazyModeData] = useState<LazyModeState>({
    instructions: "",
    advertorialUrl: "",
    referenceUrls: [],
    campaignType: "",
    niche: "",
    country: "",
    language: "",
    length: "",
    keepOriginalLength: false,
    paragraphLength: "",
    guidelines: "",
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
          setUserName(session.user.user_metadata?.display_name || "")

          // Check admin role (safe — won't break auth if table doesn't exist yet)
          try {
            const { data: role } = await supabase
              .from('user_roles')
              .select('role')
              .eq('user_id', session.user.id)
              .eq('role', 'admin')
              .maybeSingle()
            setIsAdmin(!!role)
          } catch {
            setIsAdmin(false)
          }
        }
      } catch (error) {
        console.error("Error checking session:", error)
      } finally {
        setIsCheckingAuth(false)
      }
    }

    checkSession()

    // Subscribe to auth state changes
    const subscription = onAuthStateChange(async (session) => {
      if (session?.user) {
        setIsLoggedIn(true)
        setUserEmail(session.user.email || "")
        setUserId(session.user.id)
        setUserName(session.user.user_metadata?.display_name || "")

        // Check admin role on sign-in
        try {
          const { data: role } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', session.user.id)
            .eq('role', 'admin')
            .maybeSingle()
          setIsAdmin(!!role)
        } catch {
          setIsAdmin(false)
        }
      } else {
        setIsLoggedIn(false)
        setUserEmail("")
        setUserId(null)
        setUserName("")
        setIsAdmin(false)
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
      setUserName("")
      setIsAdmin(false)
      setShowAdminView(false)
      setAppMode("selecting")
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
    setAppMode("selecting")
    setCurrentStep(1)
    setShowAdminView(false)
    setLazyModeStep(1)
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
    setLazyModeData({
      instructions: "",
      advertorialUrl: "",
      referenceUrls: [],
      campaignType: "",
      niche: "",
      country: "",
      language: "",
      length: "",
      keepOriginalLength: false,
      paragraphLength: "",
      guidelines: "",
    })
    setSelectedModel("anthropic/claude-sonnet-4.6")
  }

  const handleOpenCampaign = async (campaignId: string) => {
    try {
      const response = await fetch(`/api/campaign/${campaignId}`)
      const data = await response.json()

      if (response.ok && data.campaign) {
        const c = data.campaign
        setCampaignData({
          id: c.id,
          mode: c.mode,
          status: c.status,
          generated_content: c.generatedContent,
          generated_html: c.generatedHtml,
          editor_content: c.editorContent,
          doc_name: c.docName,
        })
        setAppMode(c.mode === 'lazy' ? 'lazy' : 'full')
        setIsGenerating(true)
      }
    } catch (error) {
      console.error('Failed to open campaign:', error)
    }
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

  // Handle Step 2 completion - scrape logic lives here (parent never unmounts)
  const handleStep2Complete = async (scrapeRequest: ScrapeRequest | null) => {
    // No scraping needed - just navigate
    if (!scrapeRequest) {
      setCurrentStep(3)
      return
    }

    const { newUrlsOnly, isFullRescrape } = scrapeRequest

    // Reset insights if doing full re-scrape
    if (isFullRescrape) {
      handleResetInsights()
    }

    // Navigate immediately so user can work on Building Blocks
    setCurrentStep(3)

    // Call scrape API (parent stays mounted, so this always completes)
    try {
      const response = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stepOneData,
          stepTwoData,
          userId,
          campaignId: campaignData.id || undefined,
          newUrlsOnly: newUrlsOnly || undefined,
          isFullRescrape: isFullRescrape || undefined,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to start scraping")
      }

      const currentUrls = extractUrls(stepTwoData.referenceUrls)

      setCampaignData(prev => ({
        ...prev,
        id: result.campaignId,
        status: "scraping",
        scrapedUrls: currentUrls,
        scrapedStepOneData: { ...stepOneData },
        scrapingResult: (newUrlsOnly && !isFullRescrape) ? prev.scrapingResult : undefined,
      }))
    } catch (error) {
      console.error("Error starting scrape:", error)
    }
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
          async (payload) => {
            const newStatus = payload.new.status
            const generatedContent = payload.new.generated_content
            const docName = payload.new.doc_name

            // When status changes to drafted or completed, re-fetch full campaign from Supabase
            // because Realtime may not include large text fields (generated_html)
            if (newStatus === 'drafted' || newStatus === 'completed') {
              const { data: freshCampaign } = await supabase
                .from('campaigns')
                .select('generated_html, editor_content, generated_content, doc_name, status')
                .eq('id', campaignData.id)
                .single()

              if (freshCampaign) {
                setCampaignData((prev) => ({
                  ...prev,
                  status: freshCampaign.status,
                  generated_html: freshCampaign.generated_html || prev.generated_html,
                  editor_content: freshCampaign.editor_content || prev.editor_content,
                  generated_content: freshCampaign.generated_content || prev.generated_content,
                  doc_name: freshCampaign.doc_name || prev.doc_name,
                }))
              }
            } else if (newStatus && newStatus !== campaignData.status) {
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

  // Auto-trigger lazy generation when scraping completes
  useEffect(() => {
    if (appMode === 'lazy' && campaignData.status === 'urls_processed' && campaignData.id) {
      const triggerGeneration = async () => {
        try {
          const response = await fetch('/api/lazy-generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ campaignId: campaignData.id, model: selectedModel }),
          })
          if (!response.ok) throw new Error('Failed to trigger generation')
          setCampaignData(prev => ({ ...prev, status: 'generating' }))
        } catch (error) {
          console.error('Auto-trigger lazy generation failed:', error)
        }
      }
      triggerGeneration()
    }
  }, [appMode, campaignData.status, campaignData.id])

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
            <span className="text-lg font-semibold text-foreground">Advertorial Builder v2</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="p-2 rounded-md hover:bg-muted text-muted-foreground"
              onClick={handleStartOver}
              title="Home"
            >
              <Home className="h-5 w-5" />
            </button>
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
            {isAdmin && (
              <button
                className="p-2 rounded-md hover:bg-muted text-muted-foreground"
                onClick={() => setShowAdminView(true)}
                title="Admin Panel"
              >
                <ShieldCheck className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  )

  // Admin view (full-page)
  if (showAdminView && isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        {header}
        <AdminPanel userId={userId} onBack={() => setShowAdminView(false)} />
      </div>
    )
  }

  // Mode selection screen
  if (appMode === "selecting") {
    return (
      <div className="min-h-screen bg-background">
        {header}
        <HistoryMenu isOpen={isHistoryMenuOpen} onClose={() => setIsHistoryMenuOpen(false)} userId={userId} onOpenCampaign={handleOpenCampaign} />
        <UserMenu
          isOpen={isUserMenuOpen}
          onClose={() => setIsUserMenuOpen(false)}
          onLogout={handleLogout}
          userEmail={userEmail}
          userName={userName}
          onUserNameChange={setUserName}
        />
        <main className="mx-auto max-w-7xl px-6">
          <ModeSelection userEmail={userEmail} userName={userName} onSelectMode={setAppMode} />
        </main>
      </div>
    )
  }

  if (isGenerating) {
    const isCompleted = !!(campaignData.generated_content || campaignData.generated_html)
    const hasEditor = !!campaignData.generated_html

    // Show editor when generated_html is available
    if (isCompleted && hasEditor) {
      return (
        <div className="h-screen bg-background flex flex-col">
          {header}
          <HistoryMenu isOpen={isHistoryMenuOpen} onClose={() => setIsHistoryMenuOpen(false)} userId={userId} onOpenCampaign={handleOpenCampaign} />
            <UserMenu
            isOpen={isUserMenuOpen}
            onClose={() => setIsUserMenuOpen(false)}
            onLogout={handleLogout}
            userEmail={userEmail}
            userName={userName}
            onUserNameChange={setUserName}
          />
          <EditingEnvironment
            key={campaignData.id}
            generatedHtml={campaignData.editor_content || campaignData.generated_html!}
            documentUrl={campaignData.generated_content}
            documentName={campaignData.doc_name}
            campaignId={campaignData.id}
            campaignData={campaignData}
            stepOneData={appMode === "full" ? stepOneData : undefined}
            stepThreeData={appMode === "full" ? stepThreeData : undefined}
            lazyModeData={appMode === "lazy" ? lazyModeData : undefined}
            onStartOver={handleStartOver}
          />
        </div>
      )
    }

    // Fallback: show generating spinner or Google Docs link (for old campaigns without generated_html)
    return (
      <div className="min-h-screen bg-background">
        {header}
        <HistoryMenu isOpen={isHistoryMenuOpen} onClose={() => setIsHistoryMenuOpen(false)} userId={userId} onOpenCampaign={handleOpenCampaign} />
        <UserMenu
          isOpen={isUserMenuOpen}
          onClose={() => setIsUserMenuOpen(false)}
          onLogout={handleLogout}
          userEmail={userEmail}
          userName={userName}
          onUserNameChange={setUserName}
        />
        <main className="mx-auto max-w-5xl px-6 py-8">
          <StepGenerating
            onComplete={handleStartOver}
            status={isCompleted ? 'completed' : 'generating'}
            documentUrl={campaignData.generated_content}
            documentName={campaignData.doc_name}
            topic={appMode === "lazy" ? lazyModeData.instructions : stepOneData.topic}
            phase={campaignData.status === 'scraping' ? 'scraping' : 'generating'}
          />
        </main>
      </div>
    )
  }

  // Lazy Mode flow
  if (appMode === "lazy") {
    const lazySteps = [
      { number: 1, title: "Setup", description: "Instructions & reference pages" },
      { number: 2, title: "Review", description: "Confirm and generate" },
    ]

    return (
      <div className="min-h-screen bg-background">
        {header}
        <HistoryMenu isOpen={isHistoryMenuOpen} onClose={() => setIsHistoryMenuOpen(false)} userId={userId} onOpenCampaign={handleOpenCampaign} />
        <UserMenu
          isOpen={isUserMenuOpen}
          onClose={() => setIsUserMenuOpen(false)}
          onLogout={handleLogout}
          userEmail={userEmail}
          userName={userName}
          onUserNameChange={setUserName}
        />
        <div className="border-b border-border bg-card/50 py-6">
          <div className="mx-auto max-w-6xl px-6">
            <StepIndicator currentStep={lazyModeStep} steps={lazySteps} />
          </div>
        </div>
        <main className="mx-auto max-w-5xl px-6 py-8">
          {lazyModeStep === 1 && (
            <LazyModeSetup
              data={lazyModeData}
              updateData={setLazyModeData}
              onNext={() => setLazyModeStep(2)}
              onBack={() => setAppMode("selecting")}
            />
          )}
          {lazyModeStep === 2 && (
            <LazyModeReview
              data={lazyModeData}
              campaignData={campaignData}
              userId={userId}
              onBack={() => setLazyModeStep(1)}
              onGenerate={handleGenerate}
              setCampaignData={setCampaignData}
              selectedModel={selectedModel}
              onModelChange={setSelectedModel}
            />
          )}
        </main>
      </div>
    )
  }

  // Full Builder flow
  return (
    <div className="min-h-screen bg-background">
      {header}
      <HistoryMenu isOpen={isHistoryMenuOpen} onClose={() => setIsHistoryMenuOpen(false)} userId={userId} onOpenCampaign={handleOpenCampaign} />
      <UserMenu
        isOpen={isUserMenuOpen}
        onClose={() => setIsUserMenuOpen(false)}
        onLogout={handleLogout}
        userEmail={userEmail}
        userName={userName}
        onUserNameChange={setUserName}
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
            onBack={() => setAppMode("selecting")}
            campaignData={campaignData}
          />
        )}
        {currentStep === 2 && (
          <StepTwo
            stepOneData={stepOneData}
            data={stepTwoData}
            updateData={setStepTwoData}
            onComplete={handleStep2Complete}
            onBack={handlePrevStep}
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
            selectedModel={selectedModel}
            onModelChange={setSelectedModel}
          />
        )}
      </main>
    </div>
  )
}
