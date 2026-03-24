# Test Data for Xevio v2

Use these examples to test the full workflow end-to-end. Each includes data for both Full Mode and Lazy Mode.

---

## Example 1: UK — Dental Insurance Plan

### Full Mode

**Step 1 — Campaign Brief**
| Field | Value |
|-------|-------|
| Topic | Write an advertorial about Denplan Essentials, a dental insurance plan that covers routine check-ups and hygiene visits for a low monthly fee. Highlight that it requires no health questionnaires, covers the whole family, and is accepted at over 6,500 UK dental practices. Target adults 30-55 who struggle to find NHS dentists. |
| Campaign Type | Advertorial |
| Niche | Health & Insurance |
| Country | United Kingdom |
| Language | English |
| Length | 1500 |
| Paragraph Length | Medium (3-4 sentences) |
| Guidelines | ERGO |
| Custom Guidelines | Do not make claims about curing dental conditions. Do not compare negatively to NHS services by name. All pricing must include "from" qualifier. |

**Step 2 — Reference URLs**
| URL | Description |
|-----|-------------|
| https://www.denplan.co.uk/patients/plans/denplan-essentials | Main product page — pricing, plan details, benefits |
| https://www.moneysavingexpert.com/insurance/dental-insurance/ | Competitor comparison and general dental insurance advice |
| https://www.bbc.co.uk/news/health-67890123 | News context — NHS dentist shortage across UK regions |

**Step 4 — Suggested Structure**
1. Lede (Journalistic)
2. Problem Awareness Paragraph
3. Authority — "Dr. Sarah Mitchell, NHS and Private Dentist with 15 years experience"
4. Solution (Product Introduction)
5. Bullet Points (Benefits)
6. Social Proof (Reviews)
7. Price Explainer
8. Killing Concerns
9. FAQ
10. Call to Urgency
11. CTA
12. Conclusion

### Lazy Mode

| Field | Value |
|-------|-------|
| Advertorial URL | https://www.denplan.co.uk/patients/plans/denplan-essentials |
| Instructions | Rewrite this into an advertorial targeting UK adults who can't find an NHS dentist. Focus on affordability (plans from £7.50/month), no health questionnaires needed, and the 6,500+ practice network. Use a journalistic angle — lead with the NHS dentist crisis, then position Denplan as the accessible solution. |
| Campaign Type | Advertorial |
| Niche | Health & Insurance |
| Country | United Kingdom |
| Language | English |
| Length | 1500 |
| Paragraph Length | Medium (3-4 sentences) |
| Guidelines | ERGO |

**Additional Reference URLs**
| URL | Description |
|-----|-------------|
| https://www.moneysavingexpert.com/insurance/dental-insurance/ | Competitor pricing landscape |

---

## Example 2: Germany — Anti-Hair Loss Serum

### Full Mode

**Step 1 — Campaign Brief**
| Field | Value |
|-------|-------|
| Topic | Schreibe ein Advertorial über das Laduti Hair Growth Serum, ein biotechnologisches Haarwuchsserum ohne Minoxidil und Hormone. Es stoppt Haarausfall und fördert neues Haarwachstum innerhalb von 3 Monaten. Klinisch getestet, 100% vegan, made in Germany. Zielgruppe: Männer und Frauen 25-55 mit beginnendem Haarausfall. |
| Campaign Type | Advertorial |
| Niche | Beauty & Personal Care |
| Country | Germany |
| Language | German |
| Length | 1800 |
| Paragraph Length | Medium (3-4 sentences) |
| Guidelines | None |

**Step 2 — Reference URLs**
| URL | Description |
|-----|-------------|
| https://laduti.de/ | Offizielle Produktseite — Inhaltsstoffe, Vorher/Nachher, Preise |
| https://www.elle.de/beauty-pflege/haare/haarausfall | Redaktioneller Kontext — Haarausfall Ursachen und Behandlungen |
| https://www.trustpilot.com/review/laduti.de | Echte Kundenbewertungen auf Trustpilot |

**Step 4 — Suggested Structure**
1. Lede (Story, First Person)
2. Problem Awareness Paragraph
3. Unique Mechanism
4. Studies/Research — "Klinische Studie zur Wirksamkeit von Redensyl bei erblich bedingtem Haarausfall"
5. Bullet Points (Benefits)
6. Diary (1st Person)
7. Social Proof (Reviews)
8. Trust Elements
9. Expert Testimonial (Quote) — Expert
10. Discount — "20% Rabatt mit Code HAAR20"
11. Scarcity
12. FAQ
13. CTA
14. Conclusion

### Lazy Mode

| Field | Value |
|-------|-------|
| Advertorial URL | https://laduti.de/ |
| Instructions | Schreibe dieses Advertorial im Ich-Erzähler-Stil um. Eine Frau Anfang 40 erzählt, wie sie nach der Schwangerschaft unter Haarausfall litt und Laduti entdeckt hat. Fokus auf: keine Hormone/kein Minoxidil, klinisch getestet, Ergebnisse nach 3 Monaten. Persönlich und emotional, nicht zu werblich. Der Erzähler beschreibt den Weg von Verzweiflung zu neuem Selbstvertrauen. |
| Campaign Type | Advertorial |
| Niche | Beauty & Personal Care |
| Country | Germany |
| Language | German |
| Length | 1800 |
| Paragraph Length | Medium (3-4 sentences) |
| Guidelines | None |

**Additional Reference URLs**
| URL | Description |
|-----|-------------|
| https://www.trustpilot.com/review/laduti.de | Echte Kundenstimmen für Social Proof |
| https://www.elle.de/beauty-pflege/haare/haarausfall | Hintergrund zu Haarausfall-Thematik |

---

## Example 3: UK — Smart Home Security (Bonus)

### Lazy Mode Only

| Field | Value |
|-------|-------|
| Advertorial URL | https://www.ring.com/en-gb/doorbell-cameras |
| Instructions | Write a listicle-style comparison advertorial for the Ring Video Doorbell. Compare it against 3 competitors (Arlo, Google Nest, Eufy). Position Ring as the best value for UK homeowners. Highlight the integration with Alexa, neighbourhood alerts feature, and the affordable Ring Protect plan. Target audience: homeowners 30-50 concerned about parcel theft and break-ins. |
| Campaign Type | Listicle |
| Niche | Technology & Smart Home |
| Country | United Kingdom |
| Language | English |
| Length | 1300 |
| Paragraph Length | Short (1-2 sentences) |
| Guidelines | None |

**Additional Reference URLs**
| URL | Description |
|-----|-------------|
| https://www.which.co.uk/reviews/smart-doorbells | Independent UK reviews of smart doorbells |
| https://www.ons.gov.uk/peoplepopulationandcommunity/crimeandjustice | ONS crime statistics for context |

---

## LLM Model Testing Matrix

Test each example with different models to compare output quality:

| Model | Example to Test |
|-------|----------------|
| Sonnet 4.6 (default) | UK Dental — Full Mode |
| Opus 4.6 | Germany Hair Loss — Full Mode |
| GPT-5.4 | UK Dental — Lazy Mode |
| Gemini 3 Flash | Germany Hair Loss — Lazy Mode |
| DeepSeek V3.2 | UK Smart Home — Lazy Mode |

## What to Verify

- [ ] Scraper extracts relevant insights from all reference URLs
- [ ] Insights are context-aware (aligned with campaign brief)
- [ ] Building block tooltips display correctly in Step 4
- [ ] LLM model selector works in both Step 5 (Full) and Step 2 (Lazy)
- [ ] Selected model is sent to n8n webhook payload
- [ ] n8n uses the selected model for generation
- [ ] Generated HTML is stored in `generated_html` column
- [ ] TipTap editor loads with the generated content
- [ ] AI rewrite works within the editor
- [ ] Copy to clipboard preserves formatting
- [ ] Google Doc link still works
- [ ] German content is 100% in German (no English leaks)
- [ ] Old campaigns (without `generated_html`) still show Google Docs fallback
