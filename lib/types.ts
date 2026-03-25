export interface StepOneState {
  topic: string
  campaignType: string
  niche: string
  country: string
  language: string
  length: string
  paragraphLength: string
  guidelines: string
  customGuidelines?: string
}

export interface ReferenceUrl {
  url: string
  description?: string
}

export interface StepTwoState {
  referenceUrls: ReferenceUrl[]
}

// Step 3: Editable insight item
export interface EditableItem {
  id: string
  text: string
  selected: boolean
  isCustom: boolean
}

// Step 3: Selected insights state
export type CategoryKey = 'usps' | 'pricing' | 'mainAngle' | 'toneOfVoice' | 'keyHooks'

export interface StepThreeState {
  data: Record<CategoryKey, EditableItem[]>
  initialized: boolean // Track if data has been set (to distinguish empty from uninitialized)
}

// Step 4: Added block in structure
export interface AddedBlock {
  uid: string
  blockId: string
  name: string
  category: string
  inputValue?: string
  selectValue?: string
  hasInput?: boolean
  inputLabel?: string
  hasSelect?: boolean
  selectLabel?: string
  selectOptions?: string[]
}

export interface StepFourState {
  blocks: AddedBlock[]
  initialized: boolean
}

export interface CampaignData {
  id?: string
  mode?: 'full' | 'lazy'
  status?: 'draft' | 'scraping' | 'urls_processed' | 'analyzing' | 'generating' | 'drafted' | 'completed' | 'failed'
  scrapingResult?: any
  scrapedUrls?: string[]
  scrapedStepOneData?: StepOneState
  generated_content?: string
  generated_html?: string
  editor_content?: string
  doc_name?: string
  llm_model?: string
}

// LLM model options for generation
export interface LLMModelOption {
  id: string
  name: string
  provider: 'Anthropic' | 'OpenAI' | 'Google' | 'Mistral' | 'DeepSeek'
}

export const LLM_MODELS: LLMModelOption[] = [
  { id: 'anthropic/claude-sonnet-4.6', name: 'Sonnet 4.6', provider: 'Anthropic' },
  { id: 'anthropic/claude-opus-4.6', name: 'Opus 4.6', provider: 'Anthropic' },
  { id: 'openai/gpt-5.4', name: 'GPT-5.4', provider: 'OpenAI' },
  { id: 'openai/gpt-5.4-mini', name: 'GPT-5.4 Mini', provider: 'OpenAI' },
  { id: 'google/gemini-3-flash-preview', name: 'Gemini 3 Flash', provider: 'Google' },
  { id: 'google/gemini-3.1-flash-lite-preview', name: 'Gemini 3.1 Flash Lite', provider: 'Google' },
  { id: 'mistralai/mistral-small-2603', name: 'Mistral Small 4', provider: 'Mistral' },
  { id: 'deepseek/deepseek-v3.2', name: 'DeepSeek V3.2', provider: 'DeepSeek' },
]

export interface LazyModeState {
  instructions: string
  advertorialUrl: string
  referenceUrls: ReferenceUrl[]
  campaignType: string
  niche: string
  country: string
  language: string
  length: string
  keepOriginalLength: boolean
  paragraphLength: string
  guidelines: string
  customGuidelines?: string
}
