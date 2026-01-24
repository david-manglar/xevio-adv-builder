import { Check } from "lucide-react"

interface StepIndicatorProps {
  currentStep: number
}

const steps = [
  { number: 1, title: "Campaign Setup", description: "Define your campaign parameters" },
  { number: 2, title: "Product Info", description: "Add reference pages" },
  { number: 3, title: "Building Blocks", description: "Structure your advertorial" },
  { number: 4, title: "Insights", description: "Select key insights & USPs" },
  { number: 5, title: "Review", description: "Confirm and generate" },
]

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-around gap-2">
      {steps.map((step) => (
        <div key={step.number} className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
              currentStep > step.number
                ? "border-[#0dadb7] bg-[#0dadb7] text-white"
                : currentStep === step.number
                  ? "border-[#4644B6] bg-[#4644B6] text-white"
                  : "border-border bg-card text-muted-foreground"
            }`}
          >
            {currentStep > step.number ? (
              <Check className="h-5 w-5" />
            ) : (
              <span className="text-sm font-semibold">{step.number}</span>
            )}
          </div>
          <div className="hidden md:block min-w-0">
            <p
              className={`text-sm font-medium whitespace-nowrap ${
                currentStep >= step.number ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {step.title}
            </p>
            <p className="text-xs text-muted-foreground whitespace-nowrap">{step.description}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
