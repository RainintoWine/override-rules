import {
    LANDING_PATTERN,
    LOW_COST_FILTER,
    LOW_COST_GROUP_PATTERN,
    NODE_SUFFIX,
    PROXY_GROUPS,
    countriesMeta,
    COLD_NODES_EXCLUDE_PATTERN,
} from "./constants";
import type {
    BuildCountryProxyGroupsInput,
    BuildProxyGroupsInput,
    CountryInfoItem,
    ProxyGroup,
} from "./types";

/**
 * 地区节点生成器：根据 countriesMeta 自动生成各个国家的 url-test 策略组。
 */
export function buildCountryProxyGroups({
    countries,
    landing,
    loadBalance,
    regexFilter,
    countryInfo,
}: BuildCountryProxyGroupsInput): ProxyGroup[] {
    const groups: ProxyGroup[] = [];
    const groupType = loadBalance ? "load-balance" : "url-test";

    const nodesByCountry: Record<string, string[]> | null = !regexFilter
        ? Object.fromEntries(countryInfo.map((item: CountryInfoItem) => [item.country, item.nodes]))
        : null;

    for (const country of countries) {
        const meta = countriesMeta[country];
        if (!meta) continue;

        const groupConfig: ProxyGroup = {
            name: `${country}${NODE_SUFFIX}`,
            // 对齐极简设计，不再从 meta 中读取 icon
            type: groupType,
            url: "https://cp.cloudflare.com/generate_204",
            interval: 60,
            tolerance: 20,
            ...(loadBalance ? { strategy: "sticky-sessions" } : {}),
        };

        if (!regexFilter) {
            const nodeNames = nodesByCountry?.[country] || [];
            Object.assign(groupConfig, {
                proxies: nodeNames,
            });
        } else {
            Object.assign(groupConfig, {
                "include-all": true,
                filter: meta.pattern,
                "exclude-filter": landing
                    ? `${LANDING_PATTERN}|${LOW_COST_FILTER}`
                    : LOW_COST_FILTER,
            });
        }

        groups.push(groupConfig);
    }

    return groups;
}

/**
 * 主面板策略组装配线：决定客户端面板上所有策略组的顺序及内容。
 */
export function buildProxyGroups({
    landing,
    regexFilter,
    countryProxyGroups,
    lowCostNodes,
    landingNodes,
    defaultProxies,
    defaultSelector,
    defaultFallback,
    frontProxySelector,
}: BuildProxyGroupsInput): ProxyGroup[] {
    
    // 所有的硬编码地区雷达（hasTW, hasHK, hasUS）已被删除，实现彻底的地区去中心化

    const groups: Array<ProxyGroup | null> = [
        {
            name: PROXY_GROUPS.SELECT,
            type: "select",
            proxies: defaultSelector,
            "include-all": true, // 一拉到底模式
        },
        {
            name: PROXY_GROUPS.MANUAL,
            "include-all": true,
            type: "select",
        },
        {
            name: PROXY_GROUPS.AUTO,
            type: "url-test",
            url: "https://cp.cloudflare.com/generate_204",
            proxies: defaultFallback,
            interval: 60,
            tolerance: 20,
        },
        {
            name: PROXY_GROUPS.FALLBACK,
            type: "fallback",
            url: "https://cp.cloudflare.com/generate_204",
            proxies: defaultFallback,
            interval: 60,
            tolerance: 20,
        },
        landing
            ? {
                  name: PROXY_GROUPS.LANDING,
                  type: "select",
                  ...(regexFilter
                      ? { "include-all": true, filter: LANDING_PATTERN }
                      : { proxies: landingNodes }),
              }
            : null,
        landing
            ? {
                  name: PROXY_GROUPS.FRONT_PROXY,
                  type: "select",
                  ...(regexFilter
                      ? {
                            "include-all": true,
                            "exclude-filter": LANDING_PATTERN,
                            proxies: frontProxySelector,
                        }
                      : { proxies: frontProxySelector }),
              }
            : null,
        {
            name: PROXY_GROUPS.CRYPTO,
            type: "select",
            proxies: defaultProxies,
            "include-all": true, // 一拉到底模式
        },
        {
            name: PROXY_GROUPS.AI_SERVICE,
            type: "select",
            proxies: defaultProxies,
            "include-all": true, // 一拉到底模式
        },
        {
            name: PROXY_GROUPS.YOUTUBE,
            type: "select",
            proxies: defaultProxies,
            "include-all": true, // 一拉到底模式
        },
        {
            name: PROXY_GROUPS.GOOGLE,
            type: "select",
            proxies: defaultProxies,
        },
        {
            name: PROXY_GROUPS.MICROSOFT,
            type: "select",
            proxies: defaultProxies,
        },
        {
            name: PROXY_GROUPS.APPLE,
            type: "select",
            proxies: defaultProxies,
        },
        {
            name: PROXY_GROUPS.GOOGLE_FCM,
            type: "select",
            proxies: [PROXY_GROUPS.SELECT, "DIRECT", PROXY_GROUPS.AUTO],
        },
        {
            name: PROXY_GROUPS.TELEGRAM,
            type: "select",
            proxies: defaultProxies,
        },
        {
            name: PROXY_GROUPS.SPOTIFY,
            type: "select",
            proxies: defaultProxies,
        },
        {
            name: PROXY_GROUPS.BILIBILI,
            type: "select",
            proxies: ["DIRECT", PROXY_GROUPS.SELECT, PROXY_GROUPS.AUTO],
        },
        {
            name: PROXY_GROUPS.NETFLIX,
            type: "select",
            proxies: defaultProxies,
        },
        {
            name: PROXY_GROUPS.TIKTOK,
            type: "select",
            proxies: defaultProxies,
        },
        {
            name: PROXY_GROUPS.AD_BLOCK,
            type: "select",
            // 使用原生字符串 "DIRECT" 替代已删除的 PROXY_GROUPS.DIRECT
            proxies: ["REJECT", "REJECT-DROP", "DIRECT"],
        },
        {
            name: PROXY_GROUPS.COLD_NODES,
            type: "select",
            ...(regexFilter
                ? { "include-all": true, "exclude-filter": COLD_NODES_EXCLUDE_PATTERN }
                : { proxies: defaultProxies }),
        },
        lowCostNodes.length > 0 || regexFilter
            ? {
                  name: PROXY_GROUPS.LOW_COST,
                  type: "url-test",
                  url: "https://cp.cloudflare.com/generate_204",
                  interval: 60,
                  tolerance: 20,
                  ...(!regexFilter
                      ? { proxies: lowCostNodes }
                      : { "include-all": true, filter: LOW_COST_GROUP_PATTERN }),
              }
            : null,
        ...countryProxyGroups,
    ];

    return groups.filter(Boolean) as ProxyGroup[];
}
