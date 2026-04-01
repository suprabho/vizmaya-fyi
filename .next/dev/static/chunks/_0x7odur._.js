(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/lib/use-in-view.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useInView",
    ()=>useInView
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
'use client';
;
function useInView(ref, options = {}) {
    _s();
    const [isInView, setIsInView] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useInView.useEffect": ()=>{
            const el = ref.current;
            if (!el) return;
            const observer = new IntersectionObserver({
                "useInView.useEffect": ([entry])=>{
                    if (entry.isIntersecting) {
                        setIsInView(true);
                    }
                }
            }["useInView.useEffect"], options);
            observer.observe(el);
            return ({
                "useInView.useEffect": ()=>observer.disconnect()
            })["useInView.useEffect"];
        }
    }["useInView.useEffect"], [
        ref,
        options.threshold,
        options.rootMargin
    ]);
    return isInView;
}
_s(useInView, "CljPiJpva/9SgSrlkVLPLqzrE+U=");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/story/StatBlock.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>StatBlock
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$use$2d$in$2d$view$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/use-in-view.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
function StatBlock({ block }) {
    _s();
    const ref = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const isInView = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$use$2d$in$2d$view$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useInView"])(ref, {
        threshold: 0.3
    });
    const isPercentage = block.value.includes('%');
    const color = isPercentage ? 'var(--color-red, #E24B4A)' : 'var(--color-accent2)';
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
        ref: ref,
        className: "flex flex-col items-center justify-center min-h-[50vh] px-8 py-16 text-center",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "font-[family-name:var(--font-serif)] text-[clamp(3.5rem,12vw,8rem)] font-bold leading-none mb-2 transition-all duration-700",
                style: {
                    color,
                    opacity: isInView ? 1 : 0,
                    transform: isInView ? 'translateY(0)' : 'translateY(20px)'
                },
                children: block.value
            }, void 0, false, {
                fileName: "[project]/components/story/StatBlock.tsx",
                lineNumber: 19,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "font-[family-name:var(--font-sans)] text-base max-w-[440px] leading-[1.55] transition-all duration-700 delay-200",
                style: {
                    color: 'var(--color-muted)',
                    opacity: isInView ? 1 : 0,
                    transform: isInView ? 'translateY(0)' : 'translateY(10px)'
                },
                children: block.description
            }, void 0, false, {
                fileName: "[project]/components/story/StatBlock.tsx",
                lineNumber: 29,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/story/StatBlock.tsx",
        lineNumber: 15,
        columnNumber: 5
    }, this);
}
_s(StatBlock, "DljcBprJKYjULUac3YKdUV9OwZQ=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$use$2d$in$2d$view$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useInView"]
    ];
});
_c = StatBlock;
var _c;
__turbopack_context__.k.register(_c, "StatBlock");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/story/ProseSection.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ProseSection
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$use$2d$in$2d$view$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/use-in-view.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
function formatInlineMarkdown(text) {
    const parts = [];
    let remaining = text;
    let key = 0;
    while(remaining.length > 0){
        // Bold: **text**
        const boldMatch = remaining.match(/\*\*([^*]+)\*\*/);
        // Italic: *text*
        const italicMatch = remaining.match(/(?<!\*)\*([^*]+)\*(?!\*)/);
        const firstMatch = [
            boldMatch,
            italicMatch
        ].filter(Boolean).sort((a, b)=>(a.index ?? 0) - (b.index ?? 0))[0];
        if (!firstMatch || firstMatch.index === undefined) {
            parts.push(remaining);
            break;
        }
        if (firstMatch.index > 0) {
            parts.push(remaining.slice(0, firstMatch.index));
        }
        if (firstMatch === boldMatch) {
            parts.push(/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                className: "font-[family-name:var(--font-mono)] font-bold",
                style: {
                    color: 'var(--color-accent)'
                },
                children: firstMatch[1]
            }, key++, false, {
                fileName: "[project]/components/story/ProseSection.tsx",
                lineNumber: 33,
                columnNumber: 9
            }, this));
        } else {
            parts.push(/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("em", {
                children: firstMatch[1]
            }, key++, false, {
                fileName: "[project]/components/story/ProseSection.tsx",
                lineNumber: 42,
                columnNumber: 18
            }, this));
        }
        remaining = remaining.slice(firstMatch.index + firstMatch[0].length);
    }
    return parts;
}
function ProseSection({ block }) {
    _s();
    const ref = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const isInView = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$use$2d$in$2d$view$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useInView"])(ref, {
        threshold: 0.1
    });
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
        ref: ref,
        className: "max-w-[640px] mx-auto px-8 py-16 transition-opacity duration-700",
        style: {
            opacity: isInView ? 1 : 0
        },
        children: block.paragraphs.map((p, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "font-[family-name:var(--font-serif)] text-[1.15rem] leading-[1.85] mb-6",
                style: {
                    color: 'var(--color-text)'
                },
                children: formatInlineMarkdown(p)
            }, i, false, {
                fileName: "[project]/components/story/ProseSection.tsx",
                lineNumber: 62,
                columnNumber: 9
            }, this))
    }, void 0, false, {
        fileName: "[project]/components/story/ProseSection.tsx",
        lineNumber: 56,
        columnNumber: 5
    }, this);
}
_s(ProseSection, "DljcBprJKYjULUac3YKdUV9OwZQ=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$use$2d$in$2d$view$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useInView"]
    ];
});
_c = ProseSection;
var _c;
__turbopack_context__.k.register(_c, "ProseSection");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/story/ExposureGrid.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ExposureGrid
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$use$2d$in$2d$view$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/use-in-view.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
const COLORS = [
    'var(--color-accent)',
    'var(--color-amber, #EF9F27)',
    'var(--color-red, #E24B4A)'
];
function ExposureGrid({ block }) {
    _s();
    const ref = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const isInView = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$use$2d$in$2d$view$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useInView"])(ref, {
        threshold: 0.2
    });
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
        ref: ref,
        className: "grid grid-cols-1 md:grid-cols-3 gap-3 max-w-[720px] mx-auto mb-8 px-8",
        children: block.items.map((item, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "rounded-lg p-5 text-center transition-all duration-500",
                style: {
                    background: 'var(--color-surface)',
                    borderTop: `3px solid ${COLORS[i % COLORS.length]}`,
                    opacity: isInView ? 1 : 0,
                    transform: isInView ? 'translateY(0)' : 'translateY(20px)',
                    transitionDelay: `${i * 100}ms`
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                        className: "font-[family-name:var(--font-sans)] text-[0.8rem] font-semibold text-white mb-1",
                        children: item.label
                    }, void 0, false, {
                        fileName: "[project]/components/story/ExposureGrid.tsx",
                        lineNumber: 30,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "font-[family-name:var(--font-mono)] text-[1.4rem] font-bold mb-1",
                        style: {
                            color: COLORS[i % COLORS.length]
                        },
                        children: item.value
                    }, void 0, false, {
                        fileName: "[project]/components/story/ExposureGrid.tsx",
                        lineNumber: 33,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "font-[family-name:var(--font-sans)] text-[0.78rem] leading-[1.45]",
                        style: {
                            color: 'var(--color-muted)'
                        },
                        children: item.description
                    }, void 0, false, {
                        fileName: "[project]/components/story/ExposureGrid.tsx",
                        lineNumber: 39,
                        columnNumber: 11
                    }, this)
                ]
            }, i, true, {
                fileName: "[project]/components/story/ExposureGrid.tsx",
                lineNumber: 19,
                columnNumber: 9
            }, this))
    }, void 0, false, {
        fileName: "[project]/components/story/ExposureGrid.tsx",
        lineNumber: 14,
        columnNumber: 5
    }, this);
}
_s(ExposureGrid, "DljcBprJKYjULUac3YKdUV9OwZQ=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$use$2d$in$2d$view$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useInView"]
    ];
});
_c = ExposureGrid;
var _c;
__turbopack_context__.k.register(_c, "ExposureGrid");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/story/charts/KoreaBarChart.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>KoreaBarChart
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$shared$2f$lib$2f$app$2d$dynamic$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/shared/lib/app-dynamic.js [app-client] (ecmascript)");
;
'use client';
;
;
const ReactECharts = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$shared$2f$lib$2f$app$2d$dynamic$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(()=>__turbopack_context__.A("[project]/node_modules/echarts-for-react/esm/index.js [app-client] (ecmascript, next/dynamic entry, async loader)"), {
    loadableGenerated: {
        modules: [
            "[project]/node_modules/echarts-for-react/esm/index.js [app-client] (ecmascript, next/dynamic entry)"
        ]
    },
    ssr: false
});
_c = ReactECharts;
const ACCENT = '#D85A30';
const AMBER = '#EF9F27';
const RED = '#E24B4A';
const MUTED = '#3a4a50';
const LINE = '#1a2830';
const items = [
    {
        label: 'SK Hynix\nHBM',
        value: 62,
        color: ACCENT,
        group: 0
    },
    {
        label: 'Samsung\nDRAM',
        value: 33,
        color: ACCENT,
        group: 0
    },
    {
        label: 'LNG carrier\ndeliveries',
        value: 84,
        color: AMBER,
        group: 1
    },
    {
        label: 'LNG orderbook\nby value',
        value: 67,
        color: AMBER,
        group: 1
    },
    {
        label: 'Helium from\nQatar',
        value: 64.7,
        color: RED,
        group: 2
    },
    {
        label: 'Oil from\nMideast',
        value: 70,
        color: RED,
        group: 2
    }
];
const TITLES = {
    0: 'Memory dominance: SK Hynix + Samsung',
    1: "Shipbuilding dominance: 84% of the world's LNG carriers",
    2: 'One country. Three critical global shares. One chokepoint.'
};
function KoreaBarChart({ activeStep }) {
    const title = TITLES[activeStep] ?? TITLES[2];
    const opacities = items.map((item)=>{
        if (activeStep === 2) return 0.75;
        if (activeStep === 0 && item.group === 0) return 0.75;
        if (activeStep === 1 && item.group === 1) return 0.75;
        return 0.15;
    });
    const labelShow = items.map((_, i)=>{
        if (activeStep === 2) return true;
        if (activeStep === 0 && items[i].group === 0) return true;
        if (activeStep === 1 && items[i].group === 1) return true;
        return false;
    });
    const option = {
        backgroundColor: 'transparent',
        animation: true,
        animationDuration: 600,
        animationEasing: 'cubicOut',
        title: {
            text: title,
            left: 'center',
            bottom: 0,
            textStyle: {
                color: MUTED,
                fontSize: 11,
                fontWeight: 'normal',
                fontFamily: 'var(--font-mono)'
            }
        },
        legend: {
            top: 0,
            left: 10,
            itemWidth: 10,
            itemHeight: 10,
            textStyle: {
                color: MUTED,
                fontSize: 10
            },
            data: [
                {
                    name: 'Memory chips',
                    itemStyle: {
                        color: ACCENT
                    }
                },
                {
                    name: 'LNG carriers',
                    itemStyle: {
                        color: AMBER
                    }
                },
                {
                    name: 'Energy exposure',
                    itemStyle: {
                        color: RED
                    }
                }
            ]
        },
        grid: {
            left: 50,
            right: 30,
            top: 40,
            bottom: 50
        },
        xAxis: {
            type: 'category',
            data: items.map((i)=>i.label),
            axisLine: {
                show: false
            },
            axisTick: {
                show: false
            },
            axisLabel: {
                color: MUTED,
                fontSize: 10,
                interval: 0
            }
        },
        yAxis: {
            type: 'value',
            max: 100,
            axisLabel: {
                color: MUTED,
                fontSize: 10,
                formatter: '{value}%'
            },
            axisLine: {
                show: false
            },
            axisTick: {
                show: false
            },
            splitLine: {
                lineStyle: {
                    color: LINE
                }
            }
        },
        series: [
            // Invisible series just for legend
            {
                name: 'Memory chips',
                type: 'bar',
                data: [],
                itemStyle: {
                    color: ACCENT
                }
            },
            {
                name: 'LNG carriers',
                type: 'bar',
                data: [],
                itemStyle: {
                    color: AMBER
                }
            },
            {
                name: 'Energy exposure',
                type: 'bar',
                data: [],
                itemStyle: {
                    color: RED
                }
            },
            // Actual bars
            {
                type: 'bar',
                barWidth: '55%',
                data: items.map((item, i)=>({
                        value: item.value,
                        itemStyle: {
                            color: item.color,
                            opacity: opacities[i],
                            borderRadius: [
                                3,
                                3,
                                0,
                                0
                            ]
                        },
                        label: {
                            show: labelShow[i],
                            position: 'top',
                            color: item.color,
                            fontFamily: 'var(--font-mono)',
                            fontSize: 13,
                            fontWeight: 700,
                            formatter: `${item.value}%`
                        }
                    }))
            }
        ],
        tooltip: {
            show: false
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "w-full",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ReactECharts, {
                option: option,
                style: {
                    height: 380,
                    width: '100%'
                },
                opts: {
                    renderer: 'svg'
                },
                notMerge: true
            }, void 0, false, {
                fileName: "[project]/components/story/charts/KoreaBarChart.tsx",
                lineNumber: 118,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-center mt-1",
                style: {
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.55rem',
                    color: '#3a4a50'
                },
                children: "Sources: Counterpoint, KITA, BusinessKorea, VesselsValue, Carnegie Endowment."
            }, void 0, false, {
                fileName: "[project]/components/story/charts/KoreaBarChart.tsx",
                lineNumber: 124,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/story/charts/KoreaBarChart.tsx",
        lineNumber: 117,
        columnNumber: 5
    }, this);
}
_c1 = KoreaBarChart;
var _c, _c1;
__turbopack_context__.k.register(_c, "ReactECharts");
__turbopack_context__.k.register(_c1, "KoreaBarChart");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/story/charts/HeliumPriceChart.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>HeliumPriceChart
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$shared$2f$lib$2f$app$2d$dynamic$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/shared/lib/app-dynamic.js [app-client] (ecmascript)");
;
'use client';
;
;
const ReactECharts = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$shared$2f$lib$2f$app$2d$dynamic$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(()=>__turbopack_context__.A("[project]/node_modules/echarts-for-react/esm/index.js [app-client] (ecmascript, next/dynamic entry, async loader)"), {
    loadableGenerated: {
        modules: [
            "[project]/node_modules/echarts-for-react/esm/index.js [app-client] (ecmascript, next/dynamic entry)"
        ]
    },
    ssr: false
});
_c = ReactECharts;
const ACCENT = '#D85A30';
const TEAL = '#1D9E75';
const MUTED = '#3a4a50';
const LINE = '#1a2830';
const months = [
    'Sep 25',
    'Oct 25',
    'Nov 25',
    'Dec 25',
    'Jan 26',
    'Feb 26',
    'Mar 26',
    'Apr 26*',
    'May 26*',
    'Jun 26*'
];
const contractPrices = [
    570,
    560,
    550,
    540,
    530,
    520,
    520,
    520,
    600,
    750
];
const spotPrices = [
    620,
    600,
    580,
    560,
    550,
    540,
    900,
    1100,
    1400,
    1800
];
const TITLES = {
    0: 'March 2026: Spot spikes. Contracts untouched. Headlines mislead.',
    1: 'Month 4-6: Contract repricing begins. The 98% starts moving.',
    2: 'Stockpile runway: Samsung ~6 months, TSMC 2+ months, recycling 60-75%'
};
function HeliumPriceChart({ activeStep }) {
    const title = TITLES[activeStep] ?? TITLES[0];
    const showProjected = activeStep >= 1;
    const sliceEnd = showProjected ? 10 : 7;
    const option = {
        backgroundColor: 'transparent',
        animation: true,
        animationDuration: 800,
        animationEasing: 'cubicOut',
        title: {
            text: title,
            left: 'center',
            bottom: 0,
            textStyle: {
                color: MUTED,
                fontSize: 11,
                fontWeight: 'normal',
                fontFamily: 'var(--font-mono)'
            }
        },
        grid: {
            left: 65,
            right: 30,
            top: 35,
            bottom: 50
        },
        xAxis: {
            type: 'category',
            data: months,
            axisLine: {
                show: false
            },
            axisTick: {
                show: false
            },
            axisLabel: {
                color: MUTED,
                fontSize: 10
            }
        },
        yAxis: {
            type: 'value',
            min: 0,
            max: 2000,
            axisLine: {
                show: false
            },
            axisTick: {
                show: false
            },
            axisLabel: {
                color: MUTED,
                fontSize: 10,
                formatter: '${value}'
            },
            splitLine: {
                lineStyle: {
                    color: LINE
                }
            }
        },
        series: [
            {
                name: 'Spot (2% of market)',
                type: 'line',
                data: spotPrices.slice(0, sliceEnd).map((v, i)=>i < sliceEnd ? v : null),
                smooth: 0.3,
                lineStyle: {
                    color: ACCENT,
                    width: 2.5,
                    type: 'dashed'
                },
                symbol: 'none',
                endLabel: {
                    show: true,
                    color: ACCENT,
                    fontFamily: 'var(--font-mono)',
                    fontSize: 12,
                    fontWeight: 700,
                    formatter: ()=>showProjected ? '$1,800+' : '$900+'
                }
            },
            {
                name: 'Contract (98%)',
                type: 'line',
                data: contractPrices.slice(0, sliceEnd).map((v, i)=>i < sliceEnd ? v : null),
                smooth: 0.3,
                lineStyle: {
                    color: TEAL,
                    width: 2.5
                },
                symbol: 'none',
                endLabel: {
                    show: true,
                    color: TEAL,
                    fontFamily: 'var(--font-mono)',
                    fontSize: 12,
                    fontWeight: 700,
                    formatter: ()=>showProjected ? '$750 — rising' : '$520 — unmoved'
                }
            },
            // Projected zone highlight
            ...showProjected ? [
                {
                    type: 'line',
                    markArea: {
                        silent: true,
                        itemStyle: {
                            color: 'rgba(216, 90, 48, 0.06)'
                        },
                        data: [
                            [
                                {
                                    xAxis: 'Apr 26*'
                                },
                                {
                                    xAxis: 'Jun 26*'
                                }
                            ]
                        ]
                    },
                    data: []
                }
            ] : []
        ],
        legend: {
            top: 5,
            left: 10,
            textStyle: {
                color: MUTED,
                fontSize: 10,
                fontFamily: 'var(--font-mono)'
            },
            data: [
                {
                    name: 'Spot (2% of market)',
                    itemStyle: {
                        color: ACCENT
                    }
                },
                {
                    name: 'Contract (98%)',
                    itemStyle: {
                        color: TEAL
                    }
                }
            ]
        },
        tooltip: {
            show: false
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "w-full",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ReactECharts, {
                option: option,
                style: {
                    height: 340,
                    width: '100%'
                },
                opts: {
                    renderer: 'svg'
                },
                notMerge: true
            }, void 0, false, {
                fileName: "[project]/components/story/charts/HeliumPriceChart.tsx",
                lineNumber: 118,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-center mt-1",
                style: {
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.55rem',
                    color: '#3a4a50'
                },
                children: "Sources: IMARC, ChemAnalyst, Phil Kornbluth (CNBC). *Projected if crisis extends."
            }, void 0, false, {
                fileName: "[project]/components/story/charts/HeliumPriceChart.tsx",
                lineNumber: 124,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/story/charts/HeliumPriceChart.tsx",
        lineNumber: 117,
        columnNumber: 5
    }, this);
}
_c1 = HeliumPriceChart;
var _c, _c1;
__turbopack_context__.k.register(_c, "ReactECharts");
__turbopack_context__.k.register(_c1, "HeliumPriceChart");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/story/charts/FeedbackLoopDiagram.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>FeedbackLoopDiagram
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
'use client';
;
const RED = '#E24B4A';
const AMBER = '#EF9F27';
const ACCENT = '#D85A30';
const TEAL = '#1D9E75';
const MUTED = '#3a4a50';
const nodes = [
    {
        x: 400,
        y: 60,
        w: 220,
        h: 44,
        label: 'Hormuz closure',
        c: RED
    },
    {
        x: 150,
        y: 170,
        w: 200,
        h: 44,
        label: 'Korean energy crisis',
        c: AMBER
    },
    {
        x: 650,
        y: 170,
        w: 200,
        h: 44,
        label: 'Qatar helium offline',
        c: AMBER
    },
    {
        x: 150,
        y: 290,
        w: 200,
        h: 44,
        label: 'Shipyard pressure',
        c: ACCENT
    },
    {
        x: 650,
        y: 290,
        w: 200,
        h: 44,
        label: 'Fab utilisation cuts',
        c: ACCENT
    },
    {
        x: 400,
        y: 370,
        w: 260,
        h: 36,
        label: 'Global LNG shortage deepens',
        c: RED
    }
];
const edges = [
    {
        from: 0,
        to: 1
    },
    {
        from: 0,
        to: 2
    },
    {
        from: 1,
        to: 3
    },
    {
        from: 2,
        to: 4
    },
    {
        from: 3,
        to: 5
    },
    {
        from: 4,
        to: 5
    }
];
const breakers = [
    {
        x: 50,
        y: 290,
        label: '+ Nuclear restart'
    },
    {
        x: 50,
        y: 318,
        label: '+ ~60 idle carriers'
    },
    {
        x: 50,
        y: 346,
        label: '+ Coal easing'
    }
];
const TITLES = {
    0: 'The doom loop: energy crisis \u2192 carrier shortage \u2192 deeper energy crisis',
    1: 'Circuit breakers slow the loop \u2014 but cannot stop it if the war extends years'
};
function FeedbackLoopDiagram({ activeStep }) {
    const title = TITLES[activeStep] ?? TITLES[0];
    const showBreakers = activeStep >= 1;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "w-full",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-center mb-2",
                style: {
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.7rem',
                    color: MUTED
                },
                children: title
            }, void 0, false, {
                fileName: "[project]/components/story/charts/FeedbackLoopDiagram.tsx",
                lineNumber: 44,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                viewBox: "0 0 800 420",
                className: "w-full",
                preserveAspectRatio: "xMidYMid meet",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("defs", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("marker", {
                                id: "arrowhead",
                                viewBox: "0 0 10 10",
                                refX: "8",
                                refY: "5",
                                markerWidth: "6",
                                markerHeight: "6",
                                orient: "auto-start-reverse",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                    d: "M2 1L8 5L2 9",
                                    fill: "none",
                                    stroke: MUTED,
                                    strokeWidth: "1.5",
                                    strokeLinecap: "round",
                                    strokeLinejoin: "round"
                                }, void 0, false, {
                                    fileName: "[project]/components/story/charts/FeedbackLoopDiagram.tsx",
                                    lineNumber: 61,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/components/story/charts/FeedbackLoopDiagram.tsx",
                                lineNumber: 52,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("marker", {
                                id: "arrowhead-red",
                                viewBox: "0 0 10 10",
                                refX: "8",
                                refY: "5",
                                markerWidth: "6",
                                markerHeight: "6",
                                orient: "auto-start-reverse",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                    d: "M2 1L8 5L2 9",
                                    fill: "none",
                                    stroke: RED,
                                    strokeWidth: "1.5",
                                    strokeLinecap: "round",
                                    strokeLinejoin: "round"
                                }, void 0, false, {
                                    fileName: "[project]/components/story/charts/FeedbackLoopDiagram.tsx",
                                    lineNumber: 79,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/components/story/charts/FeedbackLoopDiagram.tsx",
                                lineNumber: 70,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/story/charts/FeedbackLoopDiagram.tsx",
                        lineNumber: 51,
                        columnNumber: 9
                    }, this),
                    edges.map((e, i)=>{
                        const f = nodes[e.from];
                        const t = nodes[e.to];
                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                            x1: f.x,
                            y1: f.y + f.h,
                            x2: t.x,
                            y2: t.y,
                            stroke: MUTED,
                            strokeWidth: 1.5,
                            markerEnd: "url(#arrowhead)",
                            opacity: 0.6
                        }, i, false, {
                            fileName: "[project]/components/story/charts/FeedbackLoopDiagram.tsx",
                            lineNumber: 95,
                            columnNumber: 13
                        }, this);
                    }),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                        d: "M 270 388 Q 30 388 30 230 Q 30 170 150 170",
                        fill: "none",
                        stroke: RED,
                        strokeWidth: 1.5,
                        strokeDasharray: "4 3",
                        markerEnd: "url(#arrowhead-red)",
                        opacity: 0.5
                    }, void 0, false, {
                        fileName: "[project]/components/story/charts/FeedbackLoopDiagram.tsx",
                        lineNumber: 110,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("text", {
                        x: 22,
                        y: 230,
                        fill: RED,
                        fontSize: "9px",
                        fontFamily: "var(--font-mono)",
                        transform: "rotate(-90,22,230)",
                        children: "feedback"
                    }, void 0, false, {
                        fileName: "[project]/components/story/charts/FeedbackLoopDiagram.tsx",
                        lineNumber: 119,
                        columnNumber: 9
                    }, this),
                    nodes.map((n, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("g", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("rect", {
                                    x: n.x - n.w / 2,
                                    y: n.y,
                                    width: n.w,
                                    height: n.h,
                                    rx: 6,
                                    fill: n.c,
                                    opacity: 0.15,
                                    stroke: n.c,
                                    strokeWidth: 0.5
                                }, void 0, false, {
                                    fileName: "[project]/components/story/charts/FeedbackLoopDiagram.tsx",
                                    lineNumber: 133,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("text", {
                                    x: n.x,
                                    y: n.y + n.h / 2,
                                    textAnchor: "middle",
                                    dominantBaseline: "central",
                                    fill: "#fff",
                                    fontSize: "12px",
                                    fontFamily: "var(--font-sans)",
                                    children: n.label
                                }, void 0, false, {
                                    fileName: "[project]/components/story/charts/FeedbackLoopDiagram.tsx",
                                    lineNumber: 144,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, i, true, {
                            fileName: "[project]/components/story/charts/FeedbackLoopDiagram.tsx",
                            lineNumber: 132,
                            columnNumber: 11
                        }, this)),
                    showBreakers && breakers.map((b, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("text", {
                            x: b.x,
                            y: b.y,
                            fill: TEAL,
                            fontSize: "10px",
                            fontFamily: "var(--font-mono)",
                            style: {
                                transition: 'opacity 0.5s',
                                opacity: showBreakers ? 1 : 0
                            },
                            children: b.label
                        }, i, false, {
                            fileName: "[project]/components/story/charts/FeedbackLoopDiagram.tsx",
                            lineNumber: 161,
                            columnNumber: 13
                        }, this))
                ]
            }, void 0, true, {
                fileName: "[project]/components/story/charts/FeedbackLoopDiagram.tsx",
                lineNumber: 50,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-center mt-1",
                style: {
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.55rem',
                    color: '#3a4a50'
                },
                children: "Feedback loop model. Circuit breakers shown in green. Positive feedback in red."
            }, void 0, false, {
                fileName: "[project]/components/story/charts/FeedbackLoopDiagram.tsx",
                lineNumber: 177,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/story/charts/FeedbackLoopDiagram.tsx",
        lineNumber: 43,
        columnNumber: 5
    }, this);
}
_c = FeedbackLoopDiagram;
var _c;
__turbopack_context__.k.register(_c, "FeedbackLoopDiagram");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/story/charts/DRAMPriceChart.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>DRAMPriceChart
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$shared$2f$lib$2f$app$2d$dynamic$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/shared/lib/app-dynamic.js [app-client] (ecmascript)");
;
'use client';
;
;
const ReactECharts = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$shared$2f$lib$2f$app$2d$dynamic$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(()=>__turbopack_context__.A("[project]/node_modules/echarts-for-react/esm/index.js [app-client] (ecmascript, next/dynamic entry, async loader)"), {
    loadableGenerated: {
        modules: [
            "[project]/node_modules/echarts-for-react/esm/index.js [app-client] (ecmascript, next/dynamic entry)"
        ]
    },
    ssr: false
});
_c = ReactECharts;
const ACCENT = '#D85A30';
const ACCENT2 = '#534AB7';
const MUTED = '#3a4a50';
const LINE = '#1a2830';
const labels = [
    "Q1 '25",
    "Q2 '25",
    "Q3 '25",
    "Q4 '25",
    "Q1 '26",
    'Q2 \'26\n(60d)',
    'Q2 \'26\n(6mo)',
    'Q2 \'26\n(3-5yr)'
];
const preExisting = [
    20,
    45,
    80,
    120,
    172,
    172,
    172,
    172
];
const hormuzIncrement = [
    0,
    0,
    0,
    0,
    0,
    3,
    18,
    40
];
const TITLES = {
    0: 'The fire already burning: DRAM +172% before Hormuz',
    1: 'At 60 days: Hormuz is a rounding error on the supercycle',
    2: 'At 6 months: Korean stockpiles thin. The increment surfaces.',
    3: 'At 3-5 years: structural reset \u2014 Korean cost advantage erodes'
};
function DRAMPriceChart({ activeStep }) {
    const title = TITLES[activeStep] ?? TITLES[0];
    const showHormuzLegend = activeStep >= 1;
    const preOpacities = preExisting.map((_, i)=>{
        if (activeStep === 0) return i < 5 ? 0.75 : 0.15;
        if (activeStep === 1) return i <= 5 ? 0.75 : 0.15;
        return 0.75;
    });
    const hormuzOpacities = hormuzIncrement.map((val, i)=>{
        if (activeStep === 0) return 0;
        if (activeStep === 1) return i === 5 ? 0.8 : 0;
        if (activeStep === 2) return i >= 5 && val > 0 ? 0.8 : 0;
        return val > 0 ? 0.8 : 0;
    });
    const option = {
        backgroundColor: 'transparent',
        animation: true,
        animationDuration: 600,
        animationEasing: 'cubicOut',
        title: {
            text: title,
            left: 'center',
            bottom: 0,
            textStyle: {
                color: MUTED,
                fontSize: 11,
                fontWeight: 'normal',
                fontFamily: 'var(--font-mono)'
            }
        },
        legend: {
            top: 0,
            left: 10,
            textStyle: {
                color: MUTED,
                fontSize: 10
            },
            data: [
                {
                    name: 'Pre-existing supercycle',
                    itemStyle: {
                        color: ACCENT2
                    }
                },
                ...showHormuzLegend ? [
                    {
                        name: 'Hormuz increment',
                        itemStyle: {
                            color: ACCENT
                        }
                    }
                ] : []
            ]
        },
        grid: {
            left: 60,
            right: 30,
            top: 40,
            bottom: 50
        },
        xAxis: {
            type: 'category',
            data: labels,
            axisLine: {
                show: false
            },
            axisTick: {
                show: false
            },
            axisLabel: {
                color: MUTED,
                fontSize: 10,
                interval: 0
            }
        },
        yAxis: {
            type: 'value',
            max: 230,
            axisLine: {
                show: false
            },
            axisTick: {
                show: false
            },
            axisLabel: {
                color: MUTED,
                fontSize: 10,
                formatter: '{value}%'
            },
            splitLine: {
                lineStyle: {
                    color: LINE
                }
            }
        },
        series: [
            {
                name: 'Pre-existing supercycle',
                type: 'bar',
                stack: 'total',
                barWidth: '55%',
                data: preExisting.map((val, i)=>({
                        value: val,
                        itemStyle: {
                            color: ACCENT2,
                            opacity: preOpacities[i],
                            borderRadius: hormuzOpacities[i] > 0 ? [
                                0,
                                0,
                                0,
                                0
                            ] : [
                                3,
                                3,
                                0,
                                0
                            ]
                        }
                    }))
            },
            {
                name: 'Hormuz increment',
                type: 'bar',
                stack: 'total',
                barWidth: '55%',
                data: hormuzIncrement.map((val, i)=>({
                        value: val,
                        itemStyle: {
                            color: ACCENT,
                            opacity: hormuzOpacities[i],
                            borderRadius: [
                                3,
                                3,
                                0,
                                0
                            ]
                        }
                    }))
            }
        ],
        tooltip: {
            show: false
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "w-full",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ReactECharts, {
                option: option,
                style: {
                    height: 360,
                    width: '100%'
                },
                opts: {
                    renderer: 'svg'
                },
                notMerge: true
            }, void 0, false, {
                fileName: "[project]/components/story/charts/DRAMPriceChart.tsx",
                lineNumber: 114,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-center mt-1",
                style: {
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.55rem',
                    color: '#3a4a50'
                },
                children: "Sources: TrendForce, Counterpoint, IDC, Gartner. Hormuz increment estimated from helium + energy pass-through."
            }, void 0, false, {
                fileName: "[project]/components/story/charts/DRAMPriceChart.tsx",
                lineNumber: 120,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/story/charts/DRAMPriceChart.tsx",
        lineNumber: 113,
        columnNumber: 5
    }, this);
}
_c1 = DRAMPriceChart;
var _c, _c1;
__turbopack_context__.k.register(_c, "ReactECharts");
__turbopack_context__.k.register(_c1, "DRAMPriceChart");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/story/ScrollySection.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ScrollySection
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$story$2f$charts$2f$KoreaBarChart$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/story/charts/KoreaBarChart.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$story$2f$charts$2f$HeliumPriceChart$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/story/charts/HeliumPriceChart.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$story$2f$charts$2f$FeedbackLoopDiagram$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/story/charts/FeedbackLoopDiagram.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$story$2f$charts$2f$DRAMPriceChart$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/story/charts/DRAMPriceChart.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
function formatInlineMarkdown(text) {
    const parts = [];
    let remaining = text;
    let key = 0;
    while(remaining.length > 0){
        const boldMatch = remaining.match(/\*\*([^*]+)\*\*/);
        const italicMatch = remaining.match(/(?<!\*)\*([^*]+)\*(?!\*)/);
        const firstMatch = [
            boldMatch,
            italicMatch
        ].filter(Boolean).sort((a, b)=>(a.index ?? 0) - (b.index ?? 0))[0];
        if (!firstMatch || firstMatch.index === undefined) {
            parts.push(remaining);
            break;
        }
        if (firstMatch.index > 0) parts.push(remaining.slice(0, firstMatch.index));
        if (firstMatch === boldMatch) {
            parts.push(/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "font-[family-name:var(--font-mono)] font-bold",
                style: {
                    color: 'var(--color-accent)'
                },
                children: firstMatch[1]
            }, key++, false, {
                fileName: "[project]/components/story/ScrollySection.tsx",
                lineNumber: 31,
                columnNumber: 9
            }, this));
        } else {
            parts.push(/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("em", {
                children: firstMatch[1]
            }, key++, false, {
                fileName: "[project]/components/story/ScrollySection.tsx",
                lineNumber: 40,
                columnNumber: 18
            }, this));
        }
        remaining = remaining.slice(firstMatch.index + firstMatch[0].length);
    }
    return parts;
}
function ChartPanel({ chartId, activeStep }) {
    switch(chartId){
        case 'korea-bar':
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$story$2f$charts$2f$KoreaBarChart$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                activeStep: activeStep
            }, void 0, false, {
                fileName: "[project]/components/story/ScrollySection.tsx",
                lineNumber: 51,
                columnNumber: 14
            }, this);
        case 'helium-price':
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$story$2f$charts$2f$HeliumPriceChart$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                activeStep: activeStep
            }, void 0, false, {
                fileName: "[project]/components/story/ScrollySection.tsx",
                lineNumber: 53,
                columnNumber: 14
            }, this);
        case 'feedback-loop':
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$story$2f$charts$2f$FeedbackLoopDiagram$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                activeStep: activeStep
            }, void 0, false, {
                fileName: "[project]/components/story/ScrollySection.tsx",
                lineNumber: 55,
                columnNumber: 14
            }, this);
        case 'dram-price':
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$story$2f$charts$2f$DRAMPriceChart$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                activeStep: activeStep
            }, void 0, false, {
                fileName: "[project]/components/story/ScrollySection.tsx",
                lineNumber: 57,
                columnNumber: 14
            }, this);
        default:
            return null;
    }
}
_c = ChartPanel;
function ScrollySection({ block }) {
    _s();
    const [activeStep, setActiveStep] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const stepsRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])([]);
    const hasChart = !!block.chartId;
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ScrollySection.useEffect": ()=>{
            const observers = [];
            stepsRef.current.forEach({
                "ScrollySection.useEffect": (el, index)=>{
                    if (!el) return;
                    const observer = new IntersectionObserver({
                        "ScrollySection.useEffect": ([entry])=>{
                            if (entry.isIntersecting) {
                                setActiveStep(index);
                            }
                        }
                    }["ScrollySection.useEffect"], {
                        rootMargin: '-40% 0px -40% 0px'
                    });
                    observer.observe(el);
                    observers.push(observer);
                }
            }["ScrollySection.useEffect"]);
            return ({
                "ScrollySection.useEffect": ()=>observers.forEach({
                        "ScrollySection.useEffect": (o)=>o.disconnect()
                    }["ScrollySection.useEffect"])
            })["ScrollySection.useEffect"];
        }
    }["ScrollySection.useEffect"], [
        block.steps.length
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
        className: "relative",
        children: [
            hasChart && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "sticky top-0 h-screen flex items-center justify-center pointer-events-none z-0",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "w-full max-w-[860px] px-6",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ChartPanel, {
                        chartId: block.chartId,
                        activeStep: activeStep
                    }, void 0, false, {
                        fileName: "[project]/components/story/ScrollySection.tsx",
                        lineNumber: 94,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/components/story/ScrollySection.tsx",
                    lineNumber: 93,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/story/ScrollySection.tsx",
                lineNumber: 92,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "relative z-10",
                children: block.steps.map((step, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        ref: (el)=>{
                            stepsRef.current[i] = el;
                        },
                        className: "min-h-[90vh] flex items-center max-w-[640px] mx-auto px-8",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "rounded-lg p-6 backdrop-blur-sm transition-all duration-500",
                            style: {
                                background: 'rgba(10, 14, 20, 0.92)',
                                border: '0.5px solid var(--color-line, #1a2830)',
                                opacity: i === activeStep ? 1 : 0.4,
                                transform: i === activeStep ? 'translateY(0)' : 'translateY(10px)'
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "font-[family-name:var(--font-mono)] text-[0.65rem] uppercase tracking-[0.15em] mb-2",
                                    style: {
                                        color: 'var(--color-accent)'
                                    },
                                    children: step.label
                                }, void 0, false, {
                                    fileName: "[project]/components/story/ScrollySection.tsx",
                                    lineNumber: 118,
                                    columnNumber: 15
                                }, this),
                                step.content.split('\n\n').map((para, j)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "font-[family-name:var(--font-serif)] text-[1.05rem] leading-[1.8] mb-3 last:mb-0",
                                        style: {
                                            color: 'var(--color-text)'
                                        },
                                        children: formatInlineMarkdown(para)
                                    }, j, false, {
                                        fileName: "[project]/components/story/ScrollySection.tsx",
                                        lineNumber: 125,
                                        columnNumber: 17
                                    }, this))
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/story/ScrollySection.tsx",
                            lineNumber: 109,
                            columnNumber: 13
                        }, this)
                    }, i, false, {
                        fileName: "[project]/components/story/ScrollySection.tsx",
                        lineNumber: 102,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/components/story/ScrollySection.tsx",
                lineNumber: 100,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/story/ScrollySection.tsx",
        lineNumber: 89,
        columnNumber: 5
    }, this);
}
_s(ScrollySection, "RBYyE38TmisL6gSC8Qya+xqtK/M=");
_c1 = ScrollySection;
var _c, _c1;
__turbopack_context__.k.register(_c, "ChartPanel");
__turbopack_context__.k.register(_c1, "ScrollySection");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/story/ScenarioToggle.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ScenarioToggle
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$use$2d$in$2d$view$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/use-in-view.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$shared$2f$lib$2f$app$2d$dynamic$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/shared/lib/app-dynamic.js [app-client] (ecmascript)");
;
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
const ReactECharts = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$shared$2f$lib$2f$app$2d$dynamic$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(()=>__turbopack_context__.A("[project]/node_modules/echarts-for-react/esm/index.js [app-client] (ecmascript, next/dynamic entry, async loader)"), {
    loadableGenerated: {
        modules: [
            "[project]/node_modules/echarts-for-react/esm/index.js [app-client] (ecmascript, next/dynamic entry)"
        ]
    },
    ssr: false
});
_c = ReactECharts;
function stripMarkdown(text) {
    return text.replace(/\*\*/g, '').replace(/\*/g, '');
}
const TEAL = '#1D9E75';
const AMBER = '#EF9F27';
const ACCENT = '#D85A30';
const SCENARIO_COLORS = [
    TEAL,
    AMBER,
    ACCENT
];
const SCENARIO_DATA = [
    {
        layers: [
            {
                name: 'Helium',
                value: 45,
                desc: '+40-50% spot'
            },
            {
                name: 'Korean energy',
                value: 50,
                desc: '+40-60% spot LNG'
            },
            {
                name: 'Petrochemicals',
                value: 12,
                desc: '+10-15%'
            },
            {
                name: 'Korean fab output',
                value: 0,
                desc: 'Stockpiles hold'
            },
            {
                name: 'GPU module',
                value: 1,
                desc: '+0-2%'
            },
            {
                name: 'Cloud GPU hour',
                value: 3,
                desc: '+2-4%'
            }
        ],
        total: '+2-4%'
    },
    {
        layers: [
            {
                name: 'Helium',
                value: 150,
                desc: '+100-200% contract'
            },
            {
                name: 'Korean energy',
                value: 30,
                desc: '+25-35% sustained'
            },
            {
                name: 'Petrochemicals',
                value: 25,
                desc: '+20-30%'
            },
            {
                name: 'Korean fab output',
                value: 20,
                desc: '-10-30% utilisation'
            },
            {
                name: 'GPU module',
                value: 12,
                desc: '+8-15%'
            },
            {
                name: 'Cloud GPU hour',
                value: 16,
                desc: '+12-20%'
            }
        ],
        total: '+12-20%'
    },
    {
        layers: [
            {
                name: 'Helium',
                value: 100,
                desc: 'New structural price floor'
            },
            {
                name: 'Korean energy',
                value: 18,
                desc: '+15-20% new normal'
            },
            {
                name: 'Petrochemicals',
                value: 12,
                desc: '+10-15% sustained'
            },
            {
                name: 'Korean fab output',
                value: 50,
                desc: 'Cost advantage lost'
            },
            {
                name: 'GPU module',
                value: 20,
                desc: '+15-25%'
            },
            {
                name: 'Cloud GPU hour',
                value: 40,
                desc: '+30-50%'
            }
        ],
        total: '+30-50%'
    }
];
function ScenarioToggle({ block }) {
    _s();
    const [active, setActive] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const ref = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const isInView = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$use$2d$in$2d$view$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useInView"])(ref, {
        threshold: 0.1
    });
    const color = SCENARIO_COLORS[active];
    const data = SCENARIO_DATA[active];
    const labels = block.scenarios.map((s)=>s.label);
    const chartOption = {
        backgroundColor: 'transparent',
        grid: {
            left: 130,
            right: 80,
            top: 10,
            bottom: 20
        },
        xAxis: {
            type: 'value',
            axisLabel: {
                show: false
            },
            splitLine: {
                show: false
            },
            axisLine: {
                show: false
            },
            axisTick: {
                show: false
            }
        },
        yAxis: {
            type: 'category',
            data: data.layers.map((l)=>l.name).reverse(),
            axisLabel: {
                color: '#e0ddd5',
                fontFamily: 'var(--font-sans)',
                fontSize: 12
            },
            axisLine: {
                show: false
            },
            axisTick: {
                show: false
            }
        },
        series: [
            {
                type: 'bar',
                data: data.layers.map((l)=>l.value).reverse(),
                itemStyle: {
                    color: {
                        type: 'linear',
                        x: 0,
                        y: 0,
                        x2: 1,
                        y2: 0,
                        colorStops: [
                            {
                                offset: 0,
                                color: color + '90'
                            },
                            {
                                offset: 1,
                                color
                            }
                        ]
                    },
                    borderRadius: [
                        0,
                        4,
                        4,
                        0
                    ]
                },
                barWidth: '55%',
                label: {
                    show: true,
                    position: 'right',
                    color: '#8a9a9f',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11,
                    formatter: (params)=>{
                        const idx = data.layers.length - 1 - params.dataIndex;
                        return data.layers[idx].desc;
                    }
                },
                animationDuration: 800,
                animationEasing: 'cubicOut'
            }
        ],
        tooltip: {
            show: true,
            backgroundColor: '#111820',
            borderColor: color,
            borderWidth: 1,
            textStyle: {
                color: '#e0ddd5',
                fontFamily: 'var(--font-mono)',
                fontSize: 12
            },
            formatter: (params)=>{
                const idx = data.layers.length - 1 - params.dataIndex;
                return `<strong>${params.name}</strong><br/>${data.layers[idx].desc}`;
            }
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
        ref: ref,
        className: "py-8",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex gap-2 justify-center mb-8 flex-wrap",
                children: labels.map((label, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>setActive(i),
                        className: "px-5 py-2 rounded-full font-[family-name:var(--font-mono)] text-[0.7rem] uppercase tracking-[0.08em] transition-all duration-300 cursor-pointer",
                        style: {
                            border: `1px solid ${active === i ? SCENARIO_COLORS[i] : 'var(--color-line, #1a2830)'}`,
                            color: active === i ? SCENARIO_COLORS[i] : 'var(--color-muted)',
                            background: active === i ? `${SCENARIO_COLORS[i]}15` : 'transparent'
                        },
                        children: label
                    }, i, false, {
                        fileName: "[project]/components/story/ScenarioToggle.tsx",
                        lineNumber: 134,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/components/story/ScenarioToggle.tsx",
                lineNumber: 132,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "max-w-[860px] mx-auto px-4 transition-opacity duration-500",
                style: {
                    opacity: isInView ? 1 : 0
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ReactECharts, {
                    option: chartOption,
                    style: {
                        height: 320
                    },
                    opts: {
                        renderer: 'svg'
                    },
                    notMerge: true
                }, active, false, {
                    fileName: "[project]/components/story/ScenarioToggle.tsx",
                    lineNumber: 154,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/story/ScenarioToggle.tsx",
                lineNumber: 150,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-center mt-4 mb-12",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "font-[family-name:var(--font-mono)] text-[0.7rem] uppercase tracking-[0.1em]",
                        style: {
                            color: 'var(--color-muted)'
                        },
                        children: "End-to-end GPU hour impact"
                    }, void 0, false, {
                        fileName: "[project]/components/story/ScenarioToggle.tsx",
                        lineNumber: 165,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "font-[family-name:var(--font-serif)] text-[2.5rem] font-bold mt-1 transition-all duration-500",
                        style: {
                            color
                        },
                        children: data.total
                    }, void 0, false, {
                        fileName: "[project]/components/story/ScenarioToggle.tsx",
                        lineNumber: 171,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/story/ScenarioToggle.tsx",
                lineNumber: 164,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/story/ScenarioToggle.tsx",
        lineNumber: 130,
        columnNumber: 5
    }, this);
}
_s(ScenarioToggle, "diCSrNv3m+gAbWqCBi2OIsKbAKQ=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$use$2d$in$2d$view$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useInView"]
    ];
});
_c1 = ScenarioToggle;
var _c, _c1;
__turbopack_context__.k.register(_c, "ReactECharts");
__turbopack_context__.k.register(_c1, "ScenarioToggle");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/story/TakeawayGrid.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>TakeawayGrid
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$use$2d$in$2d$view$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/use-in-view.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
const BORDER_COLORS = [
    'var(--color-accent)',
    'var(--color-accent2)',
    'var(--color-teal)'
];
function TakeawayGrid({ block }) {
    _s();
    const ref = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const isInView = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$use$2d$in$2d$view$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useInView"])(ref, {
        threshold: 0.2
    });
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
        className: "py-12",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-center mb-8 font-[family-name:var(--font-mono)] text-[0.7rem] uppercase tracking-[0.15em]",
                style: {
                    color: 'var(--color-accent)'
                },
                children: "What to watch"
            }, void 0, false, {
                fileName: "[project]/components/story/TakeawayGrid.tsx",
                lineNumber: 15,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                ref: ref,
                className: "grid grid-cols-1 md:grid-cols-3 gap-4 max-w-[860px] mx-auto px-8",
                children: block.items.map((item, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "rounded-lg p-6 transition-all duration-500",
                        style: {
                            background: 'var(--color-surface)',
                            borderTop: `3px solid ${BORDER_COLORS[i % BORDER_COLORS.length]}`,
                            opacity: isInView ? 1 : 0,
                            transform: isInView ? 'translateY(0)' : 'translateY(20px)',
                            transitionDelay: `${i * 100}ms`
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                className: "font-[family-name:var(--font-sans)] text-[0.8rem] font-semibold uppercase tracking-[0.08em] mb-2",
                                style: {
                                    color: BORDER_COLORS[i % BORDER_COLORS.length]
                                },
                                children: [
                                    "For ",
                                    item.audience
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/story/TakeawayGrid.tsx",
                                lineNumber: 37,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "font-[family-name:var(--font-serif)] text-[0.95rem] leading-[1.6]",
                                style: {
                                    color: 'var(--color-text)'
                                },
                                children: item.content
                            }, void 0, false, {
                                fileName: "[project]/components/story/TakeawayGrid.tsx",
                                lineNumber: 43,
                                columnNumber: 13
                            }, this)
                        ]
                    }, i, true, {
                        fileName: "[project]/components/story/TakeawayGrid.tsx",
                        lineNumber: 26,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/components/story/TakeawayGrid.tsx",
                lineNumber: 21,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/story/TakeawayGrid.tsx",
        lineNumber: 14,
        columnNumber: 5
    }, this);
}
_s(TakeawayGrid, "DljcBprJKYjULUac3YKdUV9OwZQ=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$use$2d$in$2d$view$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useInView"]
    ];
});
_c = TakeawayGrid;
var _c;
__turbopack_context__.k.register(_c, "TakeawayGrid");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/node_modules/next/dist/compiled/react/cjs/react-jsx-dev-runtime.development.js [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
/**
 * @license React
 * react-jsx-dev-runtime.development.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ "use strict";
"production" !== ("TURBOPACK compile-time value", "development") && function() {
    function getComponentNameFromType(type) {
        if (null == type) return null;
        if ("function" === typeof type) return type.$$typeof === REACT_CLIENT_REFERENCE ? null : type.displayName || type.name || null;
        if ("string" === typeof type) return type;
        switch(type){
            case REACT_FRAGMENT_TYPE:
                return "Fragment";
            case REACT_PROFILER_TYPE:
                return "Profiler";
            case REACT_STRICT_MODE_TYPE:
                return "StrictMode";
            case REACT_SUSPENSE_TYPE:
                return "Suspense";
            case REACT_SUSPENSE_LIST_TYPE:
                return "SuspenseList";
            case REACT_ACTIVITY_TYPE:
                return "Activity";
            case REACT_VIEW_TRANSITION_TYPE:
                return "ViewTransition";
        }
        if ("object" === typeof type) switch("number" === typeof type.tag && console.error("Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."), type.$$typeof){
            case REACT_PORTAL_TYPE:
                return "Portal";
            case REACT_CONTEXT_TYPE:
                return type.displayName || "Context";
            case REACT_CONSUMER_TYPE:
                return (type._context.displayName || "Context") + ".Consumer";
            case REACT_FORWARD_REF_TYPE:
                var innerType = type.render;
                type = type.displayName;
                type || (type = innerType.displayName || innerType.name || "", type = "" !== type ? "ForwardRef(" + type + ")" : "ForwardRef");
                return type;
            case REACT_MEMO_TYPE:
                return innerType = type.displayName || null, null !== innerType ? innerType : getComponentNameFromType(type.type) || "Memo";
            case REACT_LAZY_TYPE:
                innerType = type._payload;
                type = type._init;
                try {
                    return getComponentNameFromType(type(innerType));
                } catch (x) {}
        }
        return null;
    }
    function testStringCoercion(value) {
        return "" + value;
    }
    function checkKeyStringCoercion(value) {
        try {
            testStringCoercion(value);
            var JSCompiler_inline_result = !1;
        } catch (e) {
            JSCompiler_inline_result = !0;
        }
        if (JSCompiler_inline_result) {
            JSCompiler_inline_result = console;
            var JSCompiler_temp_const = JSCompiler_inline_result.error;
            var JSCompiler_inline_result$jscomp$0 = "function" === typeof Symbol && Symbol.toStringTag && value[Symbol.toStringTag] || value.constructor.name || "Object";
            JSCompiler_temp_const.call(JSCompiler_inline_result, "The provided key is an unsupported type %s. This value must be coerced to a string before using it here.", JSCompiler_inline_result$jscomp$0);
            return testStringCoercion(value);
        }
    }
    function getTaskName(type) {
        if (type === REACT_FRAGMENT_TYPE) return "<>";
        if ("object" === typeof type && null !== type && type.$$typeof === REACT_LAZY_TYPE) return "<...>";
        try {
            var name = getComponentNameFromType(type);
            return name ? "<" + name + ">" : "<...>";
        } catch (x) {
            return "<...>";
        }
    }
    function getOwner() {
        var dispatcher = ReactSharedInternals.A;
        return null === dispatcher ? null : dispatcher.getOwner();
    }
    function UnknownOwner() {
        return Error("react-stack-top-frame");
    }
    function hasValidKey(config) {
        if (hasOwnProperty.call(config, "key")) {
            var getter = Object.getOwnPropertyDescriptor(config, "key").get;
            if (getter && getter.isReactWarning) return !1;
        }
        return void 0 !== config.key;
    }
    function defineKeyPropWarningGetter(props, displayName) {
        function warnAboutAccessingKey() {
            specialPropKeyWarningShown || (specialPropKeyWarningShown = !0, console.error("%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://react.dev/link/special-props)", displayName));
        }
        warnAboutAccessingKey.isReactWarning = !0;
        Object.defineProperty(props, "key", {
            get: warnAboutAccessingKey,
            configurable: !0
        });
    }
    function elementRefGetterWithDeprecationWarning() {
        var componentName = getComponentNameFromType(this.type);
        didWarnAboutElementRef[componentName] || (didWarnAboutElementRef[componentName] = !0, console.error("Accessing element.ref was removed in React 19. ref is now a regular prop. It will be removed from the JSX Element type in a future release."));
        componentName = this.props.ref;
        return void 0 !== componentName ? componentName : null;
    }
    function ReactElement(type, key, props, owner, debugStack, debugTask) {
        var refProp = props.ref;
        type = {
            $$typeof: REACT_ELEMENT_TYPE,
            type: type,
            key: key,
            props: props,
            _owner: owner
        };
        null !== (void 0 !== refProp ? refProp : null) ? Object.defineProperty(type, "ref", {
            enumerable: !1,
            get: elementRefGetterWithDeprecationWarning
        }) : Object.defineProperty(type, "ref", {
            enumerable: !1,
            value: null
        });
        type._store = {};
        Object.defineProperty(type._store, "validated", {
            configurable: !1,
            enumerable: !1,
            writable: !0,
            value: 0
        });
        Object.defineProperty(type, "_debugInfo", {
            configurable: !1,
            enumerable: !1,
            writable: !0,
            value: null
        });
        Object.defineProperty(type, "_debugStack", {
            configurable: !1,
            enumerable: !1,
            writable: !0,
            value: debugStack
        });
        Object.defineProperty(type, "_debugTask", {
            configurable: !1,
            enumerable: !1,
            writable: !0,
            value: debugTask
        });
        Object.freeze && (Object.freeze(type.props), Object.freeze(type));
        return type;
    }
    function jsxDEVImpl(type, config, maybeKey, isStaticChildren, debugStack, debugTask) {
        var children = config.children;
        if (void 0 !== children) if (isStaticChildren) if (isArrayImpl(children)) {
            for(isStaticChildren = 0; isStaticChildren < children.length; isStaticChildren++)validateChildKeys(children[isStaticChildren]);
            Object.freeze && Object.freeze(children);
        } else console.error("React.jsx: Static children should always be an array. You are likely explicitly calling React.jsxs or React.jsxDEV. Use the Babel transform instead.");
        else validateChildKeys(children);
        if (hasOwnProperty.call(config, "key")) {
            children = getComponentNameFromType(type);
            var keys = Object.keys(config).filter(function(k) {
                return "key" !== k;
            });
            isStaticChildren = 0 < keys.length ? "{key: someKey, " + keys.join(": ..., ") + ": ...}" : "{key: someKey}";
            didWarnAboutKeySpread[children + isStaticChildren] || (keys = 0 < keys.length ? "{" + keys.join(": ..., ") + ": ...}" : "{}", console.error('A props object containing a "key" prop is being spread into JSX:\n  let props = %s;\n  <%s {...props} />\nReact keys must be passed directly to JSX without using spread:\n  let props = %s;\n  <%s key={someKey} {...props} />', isStaticChildren, children, keys, children), didWarnAboutKeySpread[children + isStaticChildren] = !0);
        }
        children = null;
        void 0 !== maybeKey && (checkKeyStringCoercion(maybeKey), children = "" + maybeKey);
        hasValidKey(config) && (checkKeyStringCoercion(config.key), children = "" + config.key);
        if ("key" in config) {
            maybeKey = {};
            for(var propName in config)"key" !== propName && (maybeKey[propName] = config[propName]);
        } else maybeKey = config;
        children && defineKeyPropWarningGetter(maybeKey, "function" === typeof type ? type.displayName || type.name || "Unknown" : type);
        return ReactElement(type, children, maybeKey, getOwner(), debugStack, debugTask);
    }
    function validateChildKeys(node) {
        isValidElement(node) ? node._store && (node._store.validated = 1) : "object" === typeof node && null !== node && node.$$typeof === REACT_LAZY_TYPE && ("fulfilled" === node._payload.status ? isValidElement(node._payload.value) && node._payload.value._store && (node._payload.value._store.validated = 1) : node._store && (node._store.validated = 1));
    }
    function isValidElement(object) {
        return "object" === typeof object && null !== object && object.$$typeof === REACT_ELEMENT_TYPE;
    }
    var React = __turbopack_context__.r("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)"), REACT_ELEMENT_TYPE = Symbol.for("react.transitional.element"), REACT_PORTAL_TYPE = Symbol.for("react.portal"), REACT_FRAGMENT_TYPE = Symbol.for("react.fragment"), REACT_STRICT_MODE_TYPE = Symbol.for("react.strict_mode"), REACT_PROFILER_TYPE = Symbol.for("react.profiler"), REACT_CONSUMER_TYPE = Symbol.for("react.consumer"), REACT_CONTEXT_TYPE = Symbol.for("react.context"), REACT_FORWARD_REF_TYPE = Symbol.for("react.forward_ref"), REACT_SUSPENSE_TYPE = Symbol.for("react.suspense"), REACT_SUSPENSE_LIST_TYPE = Symbol.for("react.suspense_list"), REACT_MEMO_TYPE = Symbol.for("react.memo"), REACT_LAZY_TYPE = Symbol.for("react.lazy"), REACT_ACTIVITY_TYPE = Symbol.for("react.activity"), REACT_VIEW_TRANSITION_TYPE = Symbol.for("react.view_transition"), REACT_CLIENT_REFERENCE = Symbol.for("react.client.reference"), ReactSharedInternals = React.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, hasOwnProperty = Object.prototype.hasOwnProperty, isArrayImpl = Array.isArray, createTask = console.createTask ? console.createTask : function() {
        return null;
    };
    React = {
        react_stack_bottom_frame: function(callStackForError) {
            return callStackForError();
        }
    };
    var specialPropKeyWarningShown;
    var didWarnAboutElementRef = {};
    var unknownOwnerDebugStack = React.react_stack_bottom_frame.bind(React, UnknownOwner)();
    var unknownOwnerDebugTask = createTask(getTaskName(UnknownOwner));
    var didWarnAboutKeySpread = {};
    exports.Fragment = REACT_FRAGMENT_TYPE;
    exports.jsxDEV = function(type, config, maybeKey, isStaticChildren) {
        var trackActualOwner = 1e4 > ReactSharedInternals.recentlyCreatedOwnerStacks++;
        if (trackActualOwner) {
            var previousStackTraceLimit = Error.stackTraceLimit;
            Error.stackTraceLimit = 10;
            var debugStackDEV = Error("react-stack-top-frame");
            Error.stackTraceLimit = previousStackTraceLimit;
        } else debugStackDEV = unknownOwnerDebugStack;
        return jsxDEVImpl(type, config, maybeKey, isStaticChildren, debugStackDEV, trackActualOwner ? createTask(getTaskName(type)) : unknownOwnerDebugTask);
    };
}();
}),
"[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
'use strict';
if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
;
else {
    module.exports = __turbopack_context__.r("[project]/node_modules/next/dist/compiled/react/cjs/react-jsx-dev-runtime.development.js [app-client] (ecmascript)");
}
}),
"[project]/node_modules/next/dist/shared/lib/lazy-dynamic/dynamic-bailout-to-csr.js [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "BailoutToCSR", {
    enumerable: true,
    get: function() {
        return BailoutToCSR;
    }
});
const _bailouttocsr = __turbopack_context__.r("[project]/node_modules/next/dist/shared/lib/lazy-dynamic/bailout-to-csr.js [app-client] (ecmascript)");
function BailoutToCSR({ reason, children }) {
    if (typeof window === 'undefined') {
        throw Object.defineProperty(new _bailouttocsr.BailoutToCSRError(reason), "__NEXT_ERROR_CODE", {
            value: "E394",
            enumerable: false,
            configurable: true
        });
    }
    return children;
}
}),
"[project]/node_modules/next/dist/shared/lib/encode-uri-path.js [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "encodeURIPath", {
    enumerable: true,
    get: function() {
        return encodeURIPath;
    }
});
function encodeURIPath(file) {
    return file.split('/').map((p)=>encodeURIComponent(p)).join('/');
}
}),
"[project]/node_modules/next/dist/shared/lib/lazy-dynamic/preload-chunks.js [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "PreloadChunks", {
    enumerable: true,
    get: function() {
        return PreloadChunks;
    }
});
const _jsxruntime = __turbopack_context__.r("[project]/node_modules/next/dist/compiled/react/jsx-runtime.js [app-client] (ecmascript)");
const _reactdom = __turbopack_context__.r("[project]/node_modules/next/dist/compiled/react-dom/index.js [app-client] (ecmascript)");
const _workasyncstorageexternal = __turbopack_context__.r("[project]/node_modules/next/dist/server/app-render/work-async-storage.external.js [app-client] (ecmascript)");
const _encodeuripath = __turbopack_context__.r("[project]/node_modules/next/dist/shared/lib/encode-uri-path.js [app-client] (ecmascript)");
const _deploymentid = __turbopack_context__.r("[project]/node_modules/next/dist/shared/lib/deployment-id.js [app-client] (ecmascript)");
function PreloadChunks({ moduleIds }) {
    // Early return in client compilation and only load requestStore on server side
    if (typeof window !== 'undefined') {
        return null;
    }
    const workStore = _workasyncstorageexternal.workAsyncStorage.getStore();
    if (workStore === undefined) {
        return null;
    }
    const allFiles = [];
    // Search the current dynamic call unique key id in react loadable manifest,
    // and find the corresponding CSS files to preload
    if (workStore.reactLoadableManifest && moduleIds) {
        const manifest = workStore.reactLoadableManifest;
        for (const key of moduleIds){
            if (!manifest[key]) continue;
            const chunks = manifest[key].files;
            allFiles.push(...chunks);
        }
    }
    if (allFiles.length === 0) {
        return null;
    }
    const query = (0, _deploymentid.getAssetTokenQuery)();
    return /*#__PURE__*/ (0, _jsxruntime.jsx)(_jsxruntime.Fragment, {
        children: allFiles.map((chunk)=>{
            const href = `${workStore.assetPrefix}/_next/${(0, _encodeuripath.encodeURIPath)(chunk)}${query}`;
            const isCss = chunk.endsWith('.css');
            // If it's stylesheet we use `precedence` o help hoist with React Float.
            // For stylesheets we actually need to render the CSS because nothing else is going to do it so it needs to be part of the component tree.
            // The `preload` for stylesheet is not optional.
            if (isCss) {
                return /*#__PURE__*/ (0, _jsxruntime.jsx)("link", {
                    // @ts-ignore
                    precedence: "dynamic",
                    href: href,
                    rel: "stylesheet",
                    as: "style",
                    nonce: workStore.nonce
                }, chunk);
            } else {
                // If it's script we use ReactDOM.preload to preload the resources
                (0, _reactdom.preload)(href, {
                    as: 'script',
                    fetchPriority: 'low',
                    nonce: workStore.nonce
                });
                return null;
            }
        })
    });
}
}),
"[project]/node_modules/next/dist/shared/lib/lazy-dynamic/loadable.js [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return _default;
    }
});
const _jsxruntime = __turbopack_context__.r("[project]/node_modules/next/dist/compiled/react/jsx-runtime.js [app-client] (ecmascript)");
const _react = __turbopack_context__.r("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
const _dynamicbailouttocsr = __turbopack_context__.r("[project]/node_modules/next/dist/shared/lib/lazy-dynamic/dynamic-bailout-to-csr.js [app-client] (ecmascript)");
const _preloadchunks = __turbopack_context__.r("[project]/node_modules/next/dist/shared/lib/lazy-dynamic/preload-chunks.js [app-client] (ecmascript)");
// Normalize loader to return the module as form { default: Component } for `React.lazy`.
// Also for backward compatible since next/dynamic allows to resolve a component directly with loader
// Client component reference proxy need to be converted to a module.
function convertModule(mod) {
    // Check "default" prop before accessing it, as it could be client reference proxy that could break it reference.
    // Cases:
    // mod: { default: Component }
    // mod: Component
    // mod: { default: proxy(Component) }
    // mod: proxy(Component)
    const hasDefault = mod && 'default' in mod;
    return {
        default: hasDefault ? mod.default : mod
    };
}
const defaultOptions = {
    loader: ()=>Promise.resolve(convertModule(()=>null)),
    loading: null,
    ssr: true
};
function Loadable(options) {
    const opts = {
        ...defaultOptions,
        ...options
    };
    const Lazy = /*#__PURE__*/ (0, _react.lazy)(()=>opts.loader().then(convertModule));
    const Loading = opts.loading;
    function LoadableComponent(props) {
        const fallbackElement = Loading ? /*#__PURE__*/ (0, _jsxruntime.jsx)(Loading, {
            isLoading: true,
            pastDelay: true,
            error: null
        }) : null;
        // If it's non-SSR or provided a loading component, wrap it in a suspense boundary
        const hasSuspenseBoundary = !opts.ssr || !!opts.loading;
        const Wrap = hasSuspenseBoundary ? _react.Suspense : _react.Fragment;
        const wrapProps = hasSuspenseBoundary ? {
            fallback: fallbackElement
        } : {};
        const children = opts.ssr ? /*#__PURE__*/ (0, _jsxruntime.jsxs)(_jsxruntime.Fragment, {
            children: [
                typeof window === 'undefined' ? /*#__PURE__*/ (0, _jsxruntime.jsx)(_preloadchunks.PreloadChunks, {
                    moduleIds: opts.modules
                }) : null,
                /*#__PURE__*/ (0, _jsxruntime.jsx)(Lazy, {
                    ...props
                })
            ]
        }) : /*#__PURE__*/ (0, _jsxruntime.jsx)(_dynamicbailouttocsr.BailoutToCSR, {
            reason: "next/dynamic",
            children: /*#__PURE__*/ (0, _jsxruntime.jsx)(Lazy, {
                ...props
            })
        });
        return /*#__PURE__*/ (0, _jsxruntime.jsx)(Wrap, {
            ...wrapProps,
            children: children
        });
    }
    LoadableComponent.displayName = 'LoadableComponent';
    return LoadableComponent;
}
const _default = Loadable;
}),
"[project]/node_modules/next/dist/shared/lib/app-dynamic.js [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return dynamic;
    }
});
const _interop_require_default = __turbopack_context__.r("[project]/node_modules/@swc/helpers/cjs/_interop_require_default.cjs [app-client] (ecmascript)");
const _loadable = /*#__PURE__*/ _interop_require_default._(__turbopack_context__.r("[project]/node_modules/next/dist/shared/lib/lazy-dynamic/loadable.js [app-client] (ecmascript)"));
function dynamic(dynamicOptions, options) {
    const loadableOptions = {};
    if (typeof dynamicOptions === 'function') {
        loadableOptions.loader = dynamicOptions;
    }
    const mergedOptions = {
        ...loadableOptions,
        ...options
    };
    return (0, _loadable.default)({
        ...mergedOptions,
        modules: mergedOptions.loadableGenerated?.modules
    });
}
if ((typeof exports.default === 'function' || typeof exports.default === 'object' && exports.default !== null) && typeof exports.default.__esModule === 'undefined') {
    Object.defineProperty(exports.default, '__esModule', {
        value: true
    });
    Object.assign(exports.default, exports);
    module.exports = exports.default;
}
}),
]);

//# sourceMappingURL=_0x7odur._.js.map