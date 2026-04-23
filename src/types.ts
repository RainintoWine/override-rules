export type UnknownRecord = Record<string, unknown>;

export type ScriptArgs = UnknownRecord;

export interface FeatureFlags {
    loadBalance: boolean;
    landing: boolean;
    ipv6Enabled: boolean;
    fullConfig: boolean;
    keepAliveEnabled: boolean;
    fakeIPEnabled: boolean;
    quicEnabled: boolean;
    regexFilter: boolean;
    countryThreshold: number;
}

export interface ProxyNode extends UnknownRecord {
    name?: string;
}

export interface ClashConfig extends UnknownRecord {
    proxies?: ProxyNode[];
}

export interface CountryMeta {
    weight?: number;
    pattern: string;
    // 【已删除】icon: string; 彻底解除图标强制约束
}

export interface CountryInfoItem {
    country: string;
    nodes: string[];
}

export interface BaseLists {
    defaultProxies: string[];
    // 【已删除】defaultProxiesDirect;
    defaultSelector: string[];
    defaultFallback: string[];
    frontProxySelector: string[];
}

export type ProxyGroup = UnknownRecord;

export interface BuildBaseListsInput {
    landing: boolean;
    lowCostNodes: string[];
    countryGroupNames: string[];
    nonLandingNodes: string[];
    regexFilter: boolean;
}

export interface BuildCountryProxyGroupsInput {
    countries: string[];
    landing: boolean;
    loadBalance: boolean;
    regexFilter: boolean;
    countryInfo: CountryInfoItem[];
}

export interface BuildProxyGroupsInput {
    landing: boolean;
    regexFilter: boolean;
    countries: string[];
    countryProxyGroups: ProxyGroup[];
    lowCostNodes: string[];
    landingNodes: string[];
    defaultProxies: string[];
    // 【已删除】defaultProxiesDirect;
    defaultSelector: string[];
    defaultFallback: string[];
    frontProxySelector: string[];
}

export interface BuildDnsConfigInput {
    mode: "redir-host" | "fake-ip";
    ipv6Enabled: boolean;
    fakeIpFilter?: string[];
}
