export const blockDescriptions: Record<string, { description: string; promptPreview?: string }> = {
  // Opening
  "lede-journalistic": {
    description: "A tabloid-style opening that hooks the reader by focusing on a specific problem. Attention-grabbing and newsworthy. No product mention yet.",
    promptPreview: "Write a journalistic-style opening paragraph. Focus clearly on a specific problem based on the TOPIC and SELECTED INSIGHTS. The tone should be attention-grabbing, similar to how a tabloid would open a story. Do not mention the product.",
  },
  "lede-story": {
    description: "A first-person personal introduction where the narrator describes a relatable problem or experience typical for the target audience. Authentic and personal. No product mention yet.",
    promptPreview: "Write a personal introduction in first-person perspective. The narrator describes a problem or experience typical for the target audience. Keep it authentic and relatable. Do not mention the product yet.",
  },
  "lede-product": {
    description: "A direct, product-focused opening that immediately highlights what the product solves especially well. Clear and concrete without being overly promotional.",
    promptPreview: "Write a direct, product-focused introduction. Immediately highlight what the product solves especially well, without sounding overly promotional. Clear, precise, concrete.",
  },
  "teaser": {
    description: "A short, click-driving line that triggers the main curiosity or problem. Pulls the reader in without giving away the answer.",
    promptPreview: "Write a short, click-driving teaser that triggers the main curiosity or problem.",
  },
  "subheadline": {
    description: "An attention-grabbing supporting line that increases interest and mentally guides the reader through the advertorial.",
    promptPreview: "Write an attention-grabbing subheadline that increases interest and guides the reader mentally through the advertorial.",
  },
  "authority": {
    description: "Introduces a credible authority figure to establish expertise. Input the authority's name and role.",
    promptPreview: "Include a brief section introducing {X}. Establish this person's credibility or expertise without exaggeration.",
  },

  // Authority & Credibility
  "expert-testimonial": {
    description: "A short, credible quote from a User, Founder, or Expert perspective. Choose the role via dropdown. The quote explains why the product is helpful or trustworthy.",
    promptPreview: "Write a short, credible quote from the perspective of a {ROLE}. The quote should explain why the product is helpful or trustworthy.",
  },
  "trust-elements": {
    description: "A trust block referencing independent seals, media mentions (e.g. 'Seen on'), or ratings (e.g. Trustpilot). Only uses elements from the selected insights. No invented claims.",
    promptPreview: "Create a short trust block with independent seals, media mentions, or ratings. Do not invent fake claims. Use only elements from the SELECTED INSIGHTS.",
  },
  "social-proof": {
    description: "2-3 short, believable customer reviews. Each highlights a different angle: effect, feeling, or result.",
    promptPreview: "Write 2–3 short, believable customer reviews. Each review should highlight a different angle (effect, feeling, result).",
  },
  "studies-research": {
    description: "References a credible scientific study to back up claims. Input a study URL, description, or topic. The AI will locate and present the findings.",
    promptPreview: "Reference a credible scientific study based on the input. Present: key finding in plain language, source citation, connection to the product. Never invent or fabricate studies.",
  },
  "diary": {
    description: "A diary-style timeline entry (1 day, 7 days, 1 month, 3 months) describing the author's experience with the product. Starts realistic, ends very positive.",
    promptPreview: "Like a diary, describe the experience with the product across 4 date entries. Start realistic, end with very positive results and a bright future.",
  },

  // Problem & Solution
  "x-reasons": {
    description: "A numbered list of clear, logical reasons why the topic, product, or problem matters. Input how many reasons to generate.",
    promptPreview: "Create a list with {X} clear, logical, short reasons why this topic/product/problem matters. Each reason should be concise and easy to understand.",
  },
  "problem-awareness": {
    description: "Explains the core problem(s) the target audience faces using concrete, relatable situations. No solutions mentioned, pure problem awareness.",
    promptPreview: "Write a paragraph explaining the core problem the target audience faces. Use concrete, relatable situations. Do not mention any solutions.",
  },
  "listicle-intro": {
    description: "A short introduction for a listicle format. Explains what was tested, compared, or reviewed, and includes invented test categories that make sense for the topic.",
    promptPreview: "Write a short introduction for a listicle. Explain what was tested, compared, or reviewed, and include test categories you invent that make sense for the topic.",
  },
  "listicle-comparison": {
    description: "A structured product comparison where the focus product ranks #1. Input the number of competitors. Real competitors are identified and graded across test categories.",
    promptPreview: "Search online for competitors. Grade them across invented test categories. The focus product always ranks #1 with better grades and a more convincing conclusion.",
  },
  "solution": {
    description: "Introduces the product as the solution to the problem. Explains its purpose and benefits clearly and in a structured way, without exaggeration.",
    promptPreview: "Describe the solution to the problem by introducing the product. Explain its purpose and benefits clearly, without exaggeration.",
  },
  "unique-mechanism": {
    description: "Explains the product's unique mechanism or core functional principle. What makes it different from existing solutions. Logical, easy to understand, and convincing.",
    promptPreview: "Explain the product's unique mechanism or core functional principle. Make clear why it differs from existing solutions. Must be logical, easy to understand, and convincing.",
  },
  "killing-concerns": {
    description: "Lists common audience objections and counters them one by one. Uses real user objections found online for similar products.",
    promptPreview: "List the audience's common objections and counter them one by one. Search online for real user objections related to similar products.",
  },

  // Benefits & Features
  "bullet-benefits": {
    description: "Bullet list of clear, tangible benefits. Each starts with a leading keyword followed by a short explanation.",
    promptPreview: "Create a bullet list of tangible benefits. Start each with a leading keyword (e.g. 'Completely pain-free: The device leaves no pressure marks or irritation.').",
  },
  "bullet-problems": {
    description: "Bullet list of current problems the target audience faces. Short, sharp, and relatable. Each starts with a leading keyword.",
    promptPreview: "Create a bullet list of current problems. Keep it short, sharp, relatable. Start each with a leading keyword (e.g. 'Constant discomfort: Everyday movements feel tiring.').",
  },
  "future-me": {
    description: "Describes how the reader's future self feels after using the product. Purely emotional and psychological benefits. No technical details.",
    promptPreview: "Describe how the reader's future self feels after using the product. Focus entirely on emotional relief and positive life changes. Good: 'I can play soccer with my grandkids again.' Bad: 'The cream reduced the inflammation.'",
  },

  // Urgency & CTA
  "call-to-urgency": {
    description: "A single sentence creating urgency without being manipulative. Emphasizes timing, opportunity, or benefits of acting early.",
    promptPreview: "Write a single sentence that creates urgency without being manipulative. Emphasize timing, opportunity, limited availability, or benefits of acting early.",
  },
  "scarcity": {
    description: "A short, factual scarcity message explaining why the offer is limited (stock, time window, production capacity). Based on selected insights.",
    promptPreview: "Write a short, factual scarcity message. Explain why the offer is limited. Base this on the SELECTED INSIGHTS.",
  },
  "discount": {
    description: "Presents the available discount, how much, how long it's valid, and how to redeem it. Input the discount value.",
    promptPreview: "Explain the available discount of {X}. Clarify how long it is valid and how the user can redeem it.",
  },
  "price-explainer": {
    description: "Explains the price in a clear, understandable way. Justifies why it's fair and why it may be a better choice than cheaper competitors.",
    promptPreview: "Explain the price clearly. Describe why it's fair and a better choice than cheaper competitors. Be creative with valid reasons — do not invent claims.",
  },
  "next-steps": {
    description: "Describes what happens after the user clicks. The full path to purchase or lead completion in numbered steps. Based on selected insights.",
    promptPreview: "Describe what happens after the user clicks. Show the full path to purchase or lead completion using numbered steps.",
  },
  "conclusion": {
    description: "Wraps up the advertorial by focusing on positive changes and reiterating why people should act now. Adapts to 1st person or journalistic tone.",
    promptPreview: "Conclude by focusing on positive changes the product brought. Reiterate why people should buy now and show the consequences if they don't.",
  },
  "cta": {
    description: "A direct, clear call-to-action. Maximum 60 characters (ideally around 30). Must contain a specific action.",
    promptPreview: "Write a direct, clear call-to-action. Maximum 60 characters, ideally around 30. Must contain a specific action.",
  },

  // Other
  "faq": {
    description: "3-6 frequently asked questions with clear, helpful answers. Questions reflect real concerns derived from the selected insights.",
    promptPreview: "Create 3–6 frequently asked questions with clear, helpful answers. Questions should reflect real concerns from the SELECTED INSIGHTS.",
  },
  "placeholder-image": {
    description: "A placeholder marking where a visual element (image, GIF, chart) should be inserted. Add notes about the desired content.",
    promptPreview: "Insert placeholder text for Image / GIF / Chart. Attach any additional notes provided by the user.",
  },
}
