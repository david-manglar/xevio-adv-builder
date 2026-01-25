module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/app/api/scrape/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@supabase/supabase-js/dist/index.mjs [app-route] (ecmascript) <locals>");
;
;
async function POST(request) {
    try {
        const body = await request.json();
        const { stepOneData, stepTwoData, userId, campaignId, newUrlsOnly, isFullRescrape } = body;
        // 1. Validate data
        const validUrls = stepTwoData?.referenceUrls?.filter((ref)=>{
            const url = typeof ref === 'string' ? ref : ref?.url;
            return url && url.trim() !== '';
        }) || [];
        if (validUrls.length === 0) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'No reference URLs provided'
            }, {
                status: 400
            });
        }
        // 2. Initialize Supabase client
        const supabaseUrl = ("TURBOPACK compile-time value", "https://fwrbocvmtxkozwradmkb.supabase.co");
        const supabaseKey = ("TURBOPACK compile-time value", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3cmJvY3ZtdHhrb3p3cmFkbWtiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1MTE5NDksImV4cCI6MjA3NjA4Nzk0OX0.ClZYBde_Os4nM4PttgRdfmG2Yl4357GnieAoApxcoqg");
        const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])(supabaseUrl, supabaseKey);
        // Prepare URLs with descriptions
        const urlsWithContext = validUrls.map((ref)=>{
            if (typeof ref === 'string') {
                return {
                    url: ref.trim(),
                    description: null
                };
            }
            return {
                url: ref.url.trim(),
                description: ref.description?.trim() || null
            };
        });
        let finalCampaignId;
        let existingInsights = null;
        // 3. Handle different scraping modes
        if (campaignId && !isFullRescrape && newUrlsOnly && newUrlsOnly.length > 0) {
            // INCREMENTAL SCRAPE: Only scrape new URLs and append to existing
            // Fetch existing campaign to get current scraping_result
            const { data: existingCampaign, error: fetchError } = await supabase.from('campaigns').select('scraping_result').eq('id', campaignId).single();
            if (fetchError) {
                console.error('Error fetching existing campaign:', fetchError);
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    error: 'Failed to fetch existing campaign'
                }, {
                    status: 500
                });
            }
            existingInsights = existingCampaign?.scraping_result || null;
            // Update campaign with new URLs and set status to scraping
            const { error: updateError } = await supabase.from('campaigns').update({
                reference_urls: urlsWithContext,
                status: 'scraping',
                // Update Step 1 data in case it changed (though for incremental it shouldn't)
                topic: stepOneData.topic,
                campaign_type: stepOneData.campaignType,
                niche: stepOneData.niche,
                country: stepOneData.country,
                language: stepOneData.language,
                length: stepOneData.length,
                paragraph_length: stepOneData.paragraphLength,
                guidelines: stepOneData.guidelines
            }).eq('id', campaignId);
            if (updateError) {
                console.error('Supabase Update Error:', updateError);
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    error: 'Failed to update campaign'
                }, {
                    status: 500
                });
            }
            finalCampaignId = campaignId;
        } else if (campaignId && isFullRescrape) {
            // FULL RE-SCRAPE: Clear existing results and scrape all URLs again
            const { error: updateError } = await supabase.from('campaigns').update({
                reference_urls: urlsWithContext,
                scraping_result: null,
                status: 'scraping',
                // Update Step 1 data
                topic: stepOneData.topic,
                campaign_type: stepOneData.campaignType,
                niche: stepOneData.niche,
                country: stepOneData.country,
                language: stepOneData.language,
                length: stepOneData.length,
                paragraph_length: stepOneData.paragraphLength,
                guidelines: stepOneData.guidelines
            }).eq('id', campaignId);
            if (updateError) {
                console.error('Supabase Update Error:', updateError);
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    error: 'Failed to update campaign'
                }, {
                    status: 500
                });
            }
            finalCampaignId = campaignId;
        } else {
            // NEW CAMPAIGN: Create fresh campaign record
            const { data: campaign, error: dbError } = await supabase.from('campaigns').insert({
                user_id: userId,
                topic: stepOneData.topic,
                campaign_type: stepOneData.campaignType,
                niche: stepOneData.niche,
                country: stepOneData.country,
                language: stepOneData.language,
                length: stepOneData.length,
                paragraph_length: stepOneData.paragraphLength,
                guidelines: stepOneData.guidelines,
                reference_urls: urlsWithContext,
                status: 'scraping'
            }).select().single();
            if (dbError) {
                console.error('Supabase Error:', dbError);
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    error: 'Failed to create campaign'
                }, {
                    status: 500
                });
            }
            finalCampaignId = campaign.id;
        }
        // 4. Trigger n8n Webhook
        const n8nWebhookUrl = process.env.N8N_SCRAPE_WEBHOOK_URL;
        const n8nWebhookSecret = process.env.N8N_WEBHOOK_SECRET;
        if (n8nWebhookUrl) {
            const headers = {
                'Content-Type': 'application/json'
            };
            if (n8nWebhookSecret) {
                headers['X-Webhook-Secret'] = n8nWebhookSecret;
            }
            // Determine which URLs to send to n8n
            const urlsToScrape = newUrlsOnly && newUrlsOnly.length > 0 ? urlsWithContext.filter((u)=>newUrlsOnly.includes(u.url.toLowerCase().replace(/\/+$/, ''))) : urlsWithContext;
            // Determine scraping mode for n8n
            const mode = newUrlsOnly && newUrlsOnly.length > 0 && !isFullRescrape ? 'incremental' : 'full';
            // Fire-and-forget: Trigger n8n webhook without blocking the API response
            // This allows the user to proceed immediately while scraping happens in background
            fetch(n8nWebhookUrl, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({
                    campaignId: finalCampaignId,
                    urls: urlsToScrape,
                    mode: mode,
                    // Include existing insights for incremental mode so n8n can merge
                    existingInsights: mode === 'incremental' ? existingInsights : null,
                    context: {
                        topic: stepOneData.topic,
                        niche: stepOneData.niche,
                        campaignType: stepOneData.campaignType,
                        country: stepOneData.country,
                        language: stepOneData.language,
                        guidelines: stepOneData.guidelines
                    }
                })
            }).catch((error)=>{
                // Log error but don't block - scraping will be retried if needed
                console.error('Failed to trigger n8n webhook:', error);
            });
        } else {
            console.warn('N8N_SCRAPE_WEBHOOK_URL is not defined');
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            campaignId: finalCampaignId
        });
    } catch (error) {
        console.error('API Error:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Internal Server Error'
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__45bb0f95._.js.map