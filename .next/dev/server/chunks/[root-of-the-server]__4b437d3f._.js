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
"[project]/app/api/validate-url/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$url$2d$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/url-utils.ts [app-route] (ecmascript)");
;
;
async function POST(request) {
    try {
        const { url } = await request.json();
        if (!url || typeof url !== 'string') {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                reachable: false,
                error: 'No URL provided'
            }, {
                status: 400
            });
        }
        const cleaned = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$url$2d$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cleanUrl"])(url);
        try {
            const parsed = new URL(cleaned);
            if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    reachable: false,
                    error: 'URL must use HTTP or HTTPS'
                });
            }
        } catch  {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                reachable: false,
                error: 'Invalid URL format'
            });
        }
        const controller = new AbortController();
        const timeout = setTimeout(()=>controller.abort(), 10_000);
        try {
            let response = await fetch(cleaned, {
                method: 'HEAD',
                signal: controller.signal,
                redirect: 'follow',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (compatible; URLValidator/1.0)'
                }
            });
            if (response.status === 405 || response.status === 403) {
                response = await fetch(cleaned, {
                    method: 'GET',
                    signal: controller.signal,
                    redirect: 'follow',
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (compatible; URLValidator/1.0)'
                    }
                });
            }
            clearTimeout(timeout);
            const reachable = response.ok;
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                reachable,
                status: response.status,
                error: reachable ? null : `URL returned status ${response.status}`
            });
        } catch (fetchError) {
            clearTimeout(timeout);
            if (fetchError instanceof Error && fetchError.name === 'AbortError') {
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    reachable: false,
                    error: 'Request timed out'
                });
            }
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                reachable: false,
                error: 'URL is unreachable'
            });
        }
    } catch  {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            reachable: false,
            error: 'Validation failed'
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__4b437d3f._.js.map