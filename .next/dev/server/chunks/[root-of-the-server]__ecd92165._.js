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
"[project]/lib/url-utils.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "cleanUrl",
    ()=>cleanUrl,
    "detectUrlChanges",
    ()=>detectUrlChanges,
    "extractUrls",
    ()=>extractUrls,
    "hasStepOneChanges",
    ()=>hasStepOneChanges
]);
/**
 * Normalize a URL for comparison by trimming whitespace and removing trailing slashes
 */ function normalizeUrl(url) {
    return url.trim().replace(/\/+$/, '').toLowerCase();
}
function cleanUrl(url) {
    return url.trim().replace(/\/+$/, '');
}
function extractUrls(referenceUrls) {
    return referenceUrls.map((ref)=>typeof ref === 'string' ? ref : ref?.url).filter((url)=>!!url && url.trim() !== '').map(normalizeUrl);
}
function detectUrlChanges(currentUrls, scrapedUrls) {
    // Normalize all URLs for comparison
    const currentSet = new Set(currentUrls.map(normalizeUrl));
    const scrapedSet = new Set(scrapedUrls.map(normalizeUrl));
    // If both are empty or identical, no changes
    if (currentSet.size === 0 && scrapedSet.size === 0) {
        return {
            changeType: 'none',
            newUrls: []
        };
    }
    // Check if sets are identical
    if (currentSet.size === scrapedSet.size) {
        const allMatch = [
            ...currentSet
        ].every((url)=>scrapedSet.has(url));
        if (allMatch) {
            return {
                changeType: 'none',
                newUrls: []
            };
        }
    }
    // Check if all scraped URLs still exist in current (additions only)
    const allScrapedStillExist = [
        ...scrapedSet
    ].every((url)=>currentSet.has(url));
    if (allScrapedStillExist) {
        // Find new URLs (in current but not in scraped)
        const newUrls = [
            ...currentSet
        ].filter((url)=>!scrapedSet.has(url));
        if (newUrls.length > 0) {
            return {
                changeType: 'additions_only',
                newUrls
            };
        }
        // No new URLs and all scraped exist = no changes
        return {
            changeType: 'none',
            newUrls: []
        };
    }
    // Some scraped URLs were removed or modified = structural change
    return {
        changeType: 'structural',
        newUrls: []
    };
}
function hasStepOneChanges(current, original) {
    if (!original) return false;
    // Compare fields that affect scraping context
    return current.topic !== original.topic || current.niche !== original.niche || current.campaignType !== original.campaignType || current.country !== original.country || current.language !== original.language || current.guidelines !== original.guidelines;
}
}),
"[project]/app/api/lazy-generate/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@supabase/supabase-js/dist/index.mjs [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$url$2d$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/url-utils.ts [app-route] (ecmascript)");
;
;
;
async function POST(request) {
    try {
        const body = await request.json();
        const { lazyModeData, userId } = body;
        if (!lazyModeData || !userId) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Missing required data'
            }, {
                status: 400
            });
        }
        const supabaseUrl = ("TURBOPACK compile-time value", "https://fwrbocvmtxkozwradmkb.supabase.co");
        const supabaseKey = ("TURBOPACK compile-time value", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3cmJvY3ZtdHhrb3p3cmFkbWtiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1MTE5NDksImV4cCI6MjA3NjA4Nzk0OX0.ClZYBde_Os4nM4PttgRdfmG2Yl4357GnieAoApxcoqg");
        const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])(supabaseUrl, supabaseKey);
        const advertorialUrl = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$url$2d$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cleanUrl"])(lazyModeData.advertorialUrl || '');
        if (!advertorialUrl) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Advertorial URL is required'
            }, {
                status: 400
            });
        }
        const additionalLinks = (lazyModeData.referenceUrls || []).filter((ref)=>ref?.url && ref.url.trim() !== '').map((ref)=>({
                url: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$url$2d$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cleanUrl"])(ref.url),
                description: ref.description?.trim() || null
            }));
        const referenceUrls = [
            {
                url: advertorialUrl,
                description: 'Reference advertorial'
            },
            ...additionalLinks
        ];
        const lengthValue = lazyModeData.keepOriginalLength ? 'keep_original' : lazyModeData.length;
        // Create campaign record
        const { data: campaign, error: dbError } = await supabase.from('campaigns').insert({
            user_id: userId,
            mode: 'lazy',
            topic: lazyModeData.instructions,
            campaign_type: lazyModeData.campaignType,
            niche: lazyModeData.niche,
            country: lazyModeData.country,
            language: lazyModeData.language,
            length: lengthValue,
            paragraph_length: lazyModeData.paragraphLength,
            guidelines: lazyModeData.guidelines,
            reference_urls: referenceUrls,
            status: 'generating'
        }).select().single();
        if (dbError) {
            console.error('Supabase Error:', dbError);
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Failed to create campaign'
            }, {
                status: 500
            });
        }
        // Trigger n8n webhook
        const webhookUrl = process.env.N8N_LAZY_MODE_WEBHOOK_URL;
        const webhookSecret = process.env.N8N_WEBHOOK_SECRET;
        if (webhookUrl) {
            const headers = {
                'Content-Type': 'application/json'
            };
            if (webhookSecret) {
                headers['X-Webhook-Secret'] = webhookSecret;
            }
            const webhookPayload = {
                campaignId: campaign.id,
                instructions: lazyModeData.instructions,
                advertorialUrl,
                additionalLinks,
                referenceUrls,
                campaignType: lazyModeData.campaignType,
                niche: lazyModeData.niche,
                country: lazyModeData.country,
                language: lazyModeData.language,
                length: lengthValue,
                paragraphLength: lazyModeData.paragraphLength,
                guidelines: lazyModeData.guidelines,
                customGuidelines: lazyModeData.customGuidelines || null
            };
            fetch(webhookUrl, {
                method: 'POST',
                headers,
                body: JSON.stringify(webhookPayload)
            }).catch((error)=>{
                console.error('Failed to trigger n8n lazy mode webhook:', error);
            });
        } else {
            console.warn('N8N_LAZY_MODE_WEBHOOK_URL is not defined');
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

//# sourceMappingURL=%5Broot-of-the-server%5D__ecd92165._.js.map