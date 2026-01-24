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
  status?: 'draft' | 'scraping' | 'urls_processed' | 'analyzing' | 'generating' | 'completed' | 'failed'
  scrapingResult?: any
  scrapedUrls?: string[]  // Track which URLs have been scraped
  scrapedStepOneData?: StepOneState  // Track Step 1 data used during scraping
  generated_content?: string
  doc_name?: string
}
