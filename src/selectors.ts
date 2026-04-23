import { PROXY_GROUPS } from "./constants";
import { buildList } from "./utils";
import type { BaseLists, BuildBaseListsInput } from "./types";

export function buildBaseLists({
    landing,
    lowCostNodes,
    countryGroupNames,
    nonLandingNodes,
    regexFilter,
}: BuildBaseListsInput): BaseLists {
    const lowCost = lowCostNodes.length > 0 || regexFilter;

    // 1. 主控台菜单 (SELECT 组专用)
    // 逻辑对齐：自动/故障转移优先，手动指定紧随其后，接着是分类组
    const defaultSelector = buildList(
        PROXY_GROUPS.AUTO,
        PROXY_GROUPS.FALLBACK,
        PROXY_GROUPS.MANUAL,             // 【提升位置】手动选择
        landing && PROXY_GROUPS.LANDING,
        countryGroupNames,               // 各大主流国家组
        PROXY_GROUPS.COLD_NODES,         // 冷门节点
        lowCost && PROXY_GROUPS.LOW_COST,
        "DIRECT"                         // 物理直连
    );

    // 2. 海外服务通用菜单 (你钦定的完美排序)
    const defaultProxies = buildList(
        PROXY_GROUPS.SELECT,             // 默认第一顺位，听从主控台指挥
        PROXY_GROUPS.MANUAL,             // 【提升位置】手动选择
        landing && PROXY_GROUPS.LANDING, // 落地节点
        countryGroupNames,               // 各大主流国家组
        PROXY_GROUPS.COLD_NODES,         // 冷门节点
        lowCost && PROXY_GROUPS.LOW_COST,// 低倍率节点
        "DIRECT"                         // 物理直连
    );

    // 3. 直连优先菜单 (目前已被 B站 弃用，保留仅为防止 types.ts 报错)
    const defaultProxiesDirect = buildList(
        "DIRECT",
        PROXY_GROUPS.SELECT,
        PROXY_GROUPS.MANUAL,
        countryGroupNames
    );

    // 4. 自动测速菜单 (交给内核后台跑测速的纯净节点池)
    const defaultFallback = buildList(
        landing && PROXY_GROUPS.LANDING,
        countryGroupNames,
        PROXY_GROUPS.COLD_NODES,
        lowCost && PROXY_GROUPS.LOW_COST,
        "DIRECT"                         // 测速池不需要套娃，直接放实体组
    );

    // 5. 前置代理菜单 (链式代理专用跳板)
    const frontProxySelector = buildList(
        countryGroupNames,
        "DIRECT",
        !regexFilter && nonLandingNodes
    );

    return {
        defaultProxies,
        defaultSelector,
        defaultFallback,
        frontProxySelector,
    };
}
