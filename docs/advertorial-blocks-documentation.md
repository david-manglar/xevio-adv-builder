# **Advertorial Blocks Documentation**

*Latest version \- Mar, 2026*

This document contains the most up-to-date version of the building blocks from the advertorial writer. Both their names and prompts are mapped in the UI and n8n workflows, so please don’t make changes without prior notification.

When working on improving these blocks, we should aim to make aggregated changes, instead of small microadjustments.

---

## **1\. Lede (Journalistic)**

**Prompt:** “Write a journalistic-style opening paragraph. Focus clearly on a specific problem you can identify based on the TOPIC and SELECTED INSIGHTS. The tone should be attention-grabbing, similar to how a tabloid would open a story. Do not mention the product.”

---

## **2\. Lede (Story, First Person)**

**Prompt:** “Write a personal introduction in first-person perspective. The narrator describes a problem or experience that is typical for the target audience of the proposed campaign. Keep it authentic and relatable. Do not mention the product yet.”

---

## **3\. Lede (Product-focused)**

**Prompt:** “Write a direct, product-focused introduction. Immediately highlight what the product solves especially well, without sounding overly promotional. Clear, precise, concrete.”

---

## **4\. Authority**

**Input (text)**: Authority Name / Role (X)

**Prompt:** “Include a brief section introducing (X). Establish this person’s credibility or expertise without exaggeration.”

---

## **5\. (X) Reasons For…**

**Input (numeric):** Number of Reasons (X)

**Prompt:** “Create a list with (X) clear, logical, short reasons why this topic/product/problem matters. Each reason should be concise and easy to understand.”

---

## **6\. Problem Awareness Paragraph**

**Prompt:** “Write a paragraph explaining the core problem the target audience faces. Use concrete, relatable situations to make the problem feel real. Do not mention any solutions. If more than one core problem is identifiable, describe them as well.”

---

## **7\. Listicle Intro\*\***

**Prompt:** “Write a short introduction for a listicle. Explain what was tested, compared, or reviewed, and include test categories you invent that make sense for the topic.”

---

## **8\. Listicle (Product Comparison)\*\***

**Input (numeric):** Number of Competitors (X)

**Prompt:** “Search online for competitors of the focus product of the advertorial. Identify (X) competitors. Create a typical product comparison list in which you grade the competitors across the test categories you invented, and include a short conclusion for each competitor. Then create the same evaluation for the product. Ensure it receives better grades and a more comprehensive, more convincing positive conclusion. Rank the product always on \#1. Its competitors are ranked according to their results. At the end, write a general conclusion for all products reviewed. Focus on pushing the USPs and superiority of the advertorial’s focus product.”

---

## **9\. Solution (Product Introduction)**

**Prompt:** “Describe the solution to the problem by introducing the product. Explain its purpose and benefits clearly and in a structured way, without exaggeration.”

---

## **10\. Unique Mechanism**

**Prompt:** “Explain the product’s unique mechanism or core functional principle. Make clear why this mechanism differs from existing solutions. The unique mechanism must be logical, easy to understand, and convincing. Use information from the SELECTED INSIGHTS where helpful.”

---

## **11\. Killing Concerns**

**Prompt:** “List the audience’s common objections and counter them one by one, in a clear and believable way. Search online for real user objections related to products similar to the one from this campaign, and address these objections.”

---

## **12\. Bullet Points (Benefits)**

**Prompt:** “Create a bullet list of clear, tangible benefits of the product. Each benefit should be explained in a very short sentence. Start each bullet point with a leading keyword (Example: ‘Completely pain-free: The device leaves no pressure marks or irritation during use.’).”

---

## **13\. Bullet Points (Current Problems)**

**Prompt:** “Create a bullet list describing the problems the target audience currently experiences. Keep it short, sharp, and relatable. Start each bullet point with a leading keyword (Example: ‘Constant discomfort: Everyday movements feel tiring and stressful.’).”

---

## **14\. Future Me (Psychological Benefits)**

**Prompt:** “Write a paragraph describing how the reader’s future self feels after using the product. Focus entirely on emotional relief and positive life changes. The technical functioning is irrelevant here. Good example: ‘I can play soccer with my grandkids again.’ Bad example: ‘The cream reduced the inflammation in my knee.’”

---

## **15\. Trust Elements (Seals / Seen On / Trustpilot)**

**Prompt:**  
 “Create a short trust block that explains which independent seals, media mentions (e.g. seen on), or ratings (e.g. Trustpilot) build credibility. Do not invent fake claims. Use only elements available from the SELECTED INSIGHTS or specified somewhere else in the brief.”

---

## **16\. Social Proof (Reviews)**

**Prompt:** “Write 2–3 short, believable customer reviews. Each review should highlight a different angle (effect, feeling, result).”

---

## **17\. Call to Urgency**

**Prompt:** “Write a single sentence that creates urgency without being manipulative. Emphasize timing, opportunity, limited availability, or the benefits of acting early. Use inspiration from the SELECTED INSIGHTS where appropriate.”

---

## **18\. Scarcity**

**Prompt:** “Write a short, factual scarcity message. Explain why the offer is limited (e.g., stock, time window, production capacity). Base this on information from the SELECTED INSIGHTS.”

---

## **19\. Discount**

**Input (text):** Discount Value

**Prompt:** “Explain the available discount of (X percent/amount). Clarify how long it is valid and how the user can redeem it.”

---

## **20\. Price Explainer**

**Prompt:** “Explain the product’s or service price in a clear, understandable way. Describe why the price is fair and why it may be a better choice than a cheaper competitor. Do not invent claims, but be creative in shaping valid reasons.”

---

## **21\. Next Steps Explainer**

**Prompt:** “Describe, in simple terms, what happens after the user clicks. Show the full path to purchase or lead completion using numbered bullet points (steps). Base this on the SELECTED INSIGHTS.”

---

## **22\. FAQ**

**Prompt:** “Create 3–6 frequently asked questions with clear, helpful answers. The questions should reflect real concerns the target audience might have, derived from the SELECTED INSIGHTS.”

---

## **23\. Placeholder for Image / GIF / Chart**

**Input (text):** Additional notes.

**Prompt:** “Insert this placeholder text: Placeholder for Image / GIF / Chart. If the user indicated additional notes or comments, attach them as well”.

---

## **24\. Teaser**

**Prompt:** “Write a short, click-driving teaser that triggers the main curiosity or problem.”

---

## **25\. Subheadline**

**Prompt:** “Write an attention-grabbing subheadline that increases interest and guides the reader mentally through the advertorial.”

---

## **26\. CTA**

**Prompt:** “Write a direct, clear call-to-action. Maximum 60 characters, ideally around 30\. Must contain a specific action.”

---

## **27\. Expert Testimonial (Quote)**

**Input (dropdown):** User | Founder | Expert 

**Prompt:** “Write a short, credible quote from the perspective of a {ROLE}. The quote should explain why the product is helpful or trustworthy.”

---

## **28\. Studies/Research**

**Input (text):** Study URL / Description / Topic

**Prompt:**

"Reference a credible scientific study based on this input: {STUDY URL / DESCRIPTION / TOPIC}.

If a URL was provided: Use that specific study and explain its findings.

If a study description was provided: Search online to locate that specific study, then reference it.

If only a topic/claim was provided: Search online for a credible study from authoritative sources (peer-reviewed journals, university research, medical institutions, government agencies) that supports the topic.

Present the study in this structure:

1. State the key finding in plain, accessible language  
2. Cite the source (institution, journal, or organization)  
3. Connect the finding to the product/service

Keep the tone credible but accessible. Never invent or fabricate studies. If no credible study exists, state this clearly rather than forcing a connection.

---

## **29\. Diary (1st Person)**

**Prompt:** “Like in a diary, the author describes his/her experience with the product or service in a certain timeline. Focus on 4 date entries. Start with After 1 Day. Then After 7 Days. Then After 1 Month. Then After 3 Months. Adjust these dates according to the product's mechanism of action. Start off with realistic results for the first 2 dates, then end up with very positive results for the latter 2 dates. Focus on a bright future without having the original problem anymore in the last date's entry.”

---

## **30\. Conclusion**

**Prompt:** “Conclude a first person text or a journalistic/listicle approach with a conclusion. Focus on the positive changes the product did to the life of the author (1st person) or to other peoples lives (journalistic/listicle). Reiterate, why people should buy it now and show up the consequences, if they don't.”