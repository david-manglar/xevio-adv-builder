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
        const { stepOneData, stepTwoData } = body;
        // 1. Validate data
        if (!stepTwoData?.referenceUrls?.length || !stepTwoData.referenceUrls[0]) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'No reference URLs provided'
            }, {
                status: 400
            });
        }
        // 2. Initialize Supabase client
        // Note: In an API route, we could technically use the Service Role key if we needed to bypass RLS,
        // but using the Anon key acts as a standard user. 
        // If you encounter permission issues, we might need the Service Role key here.
        const supabaseUrl = ("TURBOPACK compile-time value", "https://fwrbocvmtxkozwradmkb.supabase.co");
        const supabaseKey = ("TURBOPACK compile-time value", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3cmJvY3ZtdHhrb3p3cmFkbWtiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1MTE5NDksImV4cCI6MjA3NjA4Nzk0OX0.ClZYBde_Os4nM4PttgRdfmG2Yl4357GnieAoApxcoqg");
        const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])(supabaseUrl, supabaseKey);
        // 3. Create Campaign Record in Supabase
        const { data: campaign, error: dbError } = await supabase.from('campaigns').insert({
            // Step 1 Data
            topic: stepOneData.topic,
            campaign_type: stepOneData.campaignType,
            niche: stepOneData.niche,
            country: stepOneData.country,
            language: stepOneData.language,
            length: stepOneData.length,
            paragraph_length: stepOneData.paragraphLength,
            guidelines: stepOneData.guidelines,
            // Step 2 Data
            reference_urls: stepTwoData.referenceUrls.filter((u)=>u.trim() !== ''),
            status: 'scraping' // Initial status
        }).select().single();
        if (dbError) {
            console.error('Supabase Error:', dbError);
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Failed to create campaign'
            }, {
                status: 500
            });
        }
        // 4. Trigger n8n Webhook (Fire and forget - mostly)
        // We don't await the full result, just the acknowledgement
        // Replace this URL with your actual n8n webhook URL
        const n8nWebhookUrl = process.env.N8N_SCRAPE_WEBHOOK_URL;
        const n8nWebhookSecret = process.env.N8N_WEBHOOK_SECRET;
        if (n8nWebhookUrl) {
            const headers = {
                'Content-Type': 'application/json'
            };
            if (n8nWebhookSecret) {
                headers['X-Webhook-Secret'] = n8nWebhookSecret;
            }
            // We don't await this fetch to prevent blocking, or we await it if it returns quickly.
            // Usually webhooks return 200 OK immediately.
            await fetch(n8nWebhookUrl, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({
                    campaignId: campaign.id,
                    urls: campaign.reference_urls,
                    context: {
                        topic: stepOneData.topic,
                        niche: stepOneData.niche,
                        campaignType: stepOneData.campaignType,
                        country: stepOneData.country,
                        language: stepOneData.language,
                        guidelines: stepOneData.guidelines
                    }
                })
            });
        } else {
            console.warn('N8N_SCRAPE_WEBHOOK_URL is not defined');
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            campaignId: campaign.id
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