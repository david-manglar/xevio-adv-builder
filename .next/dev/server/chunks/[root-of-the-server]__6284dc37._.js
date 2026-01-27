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
"[project]/app/api/generate/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
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
        const { campaignId, stepOneData, stepTwoData, stepThreeData, stepFourData, stepFiveData } = body;
        if (!campaignId) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Campaign ID is required'
            }, {
                status: 400
            });
        }
        const supabaseUrl = ("TURBOPACK compile-time value", "https://fwrbocvmtxkozwradmkb.supabase.co");
        const supabaseKey = ("TURBOPACK compile-time value", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3cmJvY3ZtdHhrb3p3cmFkbWtiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1MTE5NDksImV4cCI6MjA3NjA4Nzk0OX0.ClZYBde_Os4nM4PttgRdfmG2Yl4357GnieAoApxcoqg");
        const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])(supabaseUrl, supabaseKey);
        // 1. Update campaign status to 'generating'
        const { error: updateError } = await supabase.from('campaigns').update({
            status: 'generating'
        }).eq('id', campaignId);
        if (updateError) {
            console.error('Supabase Error:', updateError);
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Failed to update campaign status'
            }, {
                status: 500
            });
        }
        // 2. Build clean payload with final/edited values from Step 5
        const finalSettings = stepFiveData?.campaignData || {};
        // Extract only selected insights from Step 3
        const selectedInsights = {};
        if (stepThreeData?.data) {
            for (const [category, items] of Object.entries(stepThreeData.data)){
                const selected = items.filter((item)=>item.selected).map((item)=>item.text);
                if (selected.length > 0) {
                    selectedInsights[category] = selected;
                }
            }
        }
        // Build structure blocks with their inputs (position is 1-indexed for clarity)
        const structureBlocks = (stepFourData?.blocks || []).map((block, index)=>({
                position: index + 1,
                name: block.name,
                inputValue: block.inputValue || null,
                selectValue: block.selectValue || null
            }));
        // Clean payload for n8n
        const webhookPayload = {
            campaignId,
            // Final campaign settings (edited in Step 5, or original from Step 1)
            topic: stepFiveData?.topic || stepOneData?.topic,
            campaignType: finalSettings.campaignType || stepOneData?.campaignType,
            niche: finalSettings.niche || stepOneData?.niche,
            country: finalSettings.country || stepOneData?.country,
            language: finalSettings.language || stepOneData?.language,
            length: finalSettings.length || stepOneData?.length,
            paragraphLength: finalSettings.paragraphLength || stepOneData?.paragraphLength,
            guidelines: finalSettings.guidelines || stepOneData?.guidelines,
            customGuidelines: finalSettings.customGuidelines || stepOneData?.customGuidelines || null,
            // Reference URLs from Step 2 (with descriptions)
            referenceUrls: (stepTwoData?.referenceUrls || []).filter((ref)=>{
                const url = typeof ref === 'string' ? ref : ref?.url;
                return url && url.trim() !== '';
            }).map((ref)=>{
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
            }),
            // Only selected insights from Step 3
            selectedInsights,
            // Ordered structure blocks from Step 4
            structureBlocks
        };
        // 3. Trigger n8n webhook
        const webhookUrl = process.env.N8N_GENERATE_WEBHOOK_URL;
        const webhookSecret = process.env.N8N_WEBHOOK_SECRET;
        if (!webhookUrl) {
            console.warn('N8N_GENERATE_WEBHOOK_URL not set');
        } else {
            try {
                const headers = {
                    'Content-Type': 'application/json'
                };
                if (webhookSecret) {
                    headers['X-Webhook-Secret'] = webhookSecret;
                }
                console.log('Calling n8n generate webhook:', webhookUrl);
                const response = await fetch(webhookUrl, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify(webhookPayload)
                });
                console.log('n8n webhook response status:', response.status);
                if (!response.ok) {
                    console.error('n8n webhook returned error:', response.status, await response.text());
                }
            } catch (webhookError) {
                console.error('Webhook Error:', webhookError);
            }
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true
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

//# sourceMappingURL=%5Broot-of-the-server%5D__6284dc37._.js.map