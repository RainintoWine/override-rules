/*!
powerfullz 的 Substore 订阅转换脚本
https://github.com/powerfullz/override-rules

支持的传入参数： 
- loadbalance: 启用负载均衡（url-test/load-balance，默认 false）
- landing: 启用落地节点功能（如机场家宽/星链/落地分组，默认 false）
- ipv6: 启用 IPv6 支持（默认 false）
- full: 输出完整配置（适合纯内核启动，默认 false）
- keepalive: 启用 tcp-keep-alive（默认 false）
- fakeip: DNS 使用 FakeIP 模式（默认 true，false 为 RedirHost）
- quic: 允许 QUIC 流量（UDP 443，默认 false）
- threshold: 地区节点数量小于该值时不显示分组 (默认 0)
- regex: 使用正则过滤模式（include-all + filter）写入各地区代理组，而非直接枚举节点名称（默认 false）

源码说明：
- 源码已迁移至 `src/*.ts` 文件，使用 TypeScript 编写，编译后输出到 `dist/*.js`。
*/
"use strict";
(() => {
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __esm = (fn, res) => function __init() {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  };
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };

  // src/constants.ts
  var NODE_SUFFIX, CDN_URL, LOW_COST_FILTER, LOW_COST_GROUP_PATTERN, LOW_COST_REGEX, COLD_NODES_EXCLUDE_PATTERN, LANDING_REGEX, LANDING_PATTERN, FEATURE_FLAG_DEFAULTS, PROXY_GROUPS, ruleProviders, baseRules, snifferConfig, FAKE_IP_FILTER, geoxURL, countriesMeta;
  var init_constants = __esm({
    "src/constants.ts"() {
      "use strict";
      NODE_SUFFIX = "节点";
      CDN_URL = "https://cdn.jsdelivr.net";
      LOW_COST_FILTER = "0\\.[0-9]|低倍率|省流|实验性|免费";
      LOW_COST_GROUP_PATTERN = "(?i)0\\.[0-9]|低倍率|省流|实验性|免费";
      LOW_COST_REGEX = new RegExp(LOW_COST_FILTER, "i");
      COLD_NODES_EXCLUDE_PATTERN = "(?i)香港|港|HK|hk|Hong Kong|HongKong|hongkong|HKG|台|新北|彰化|TW|Taiwan|TPE|KHH|新加坡|坡|狮城|SG|Singapore|SIN|日本|川日|东京|大阪|泉日|埼玉|沪日|深日|[^-]日|JP|Japan|Tokyo|NRT|KIX|KR|Korea|KOR|Seoul|首尔|春川|韩|韓|ICN|美国|美|波特兰|达拉斯|俄勒冈|凤凰城|费利蒙|硅谷|拉斯维加斯|洛杉矶|圣何塞|圣克拉拉|西雅图|芝加哥|US|United States|ATL|BUF|DFW|EWR|IAD|LAX|MCI|MIA|ORD|PHX|PDX|SEA|SJC|0\\.[0-9]|低倍率|省流|实验性|免费|家宽|家庭宽带|商宽|商业宽带|星链|Starlink|落地";
      LANDING_REGEX = /家宽|家庭宽带|商宽|商业宽带|星链|Starlink|落地/i;
      LANDING_PATTERN = "(?i)家宽|家庭宽带|商宽|商业宽带|星链|Starlink|落地";
      FEATURE_FLAG_DEFAULTS = {
        loadBalance: false,
        landing: false,
        ipv6Enabled: false,
        fullConfig: false,
        keepAliveEnabled: false,
        fakeIPEnabled: true,
        quicEnabled: false,
        regexFilter: true
        // 默认开启正则动态过滤
      };
      PROXY_GROUPS = {
        SELECT: "选择代理",
        MANUAL: "手动选择",
        AUTO: "自动选择",
        FALLBACK: "故障转移",
        LANDING: "落地节点",
        FRONT_PROXY: "前置代理",
        CRYPTO: "加密货币",
        AI_SERVICE: "AI服务",
        YOUTUBE: "YouTube",
        GOOGLE: "谷歌服务",
        MICROSOFT: "微软服务",
        APPLE: "苹果服务",
        GOOGLE_FCM: "谷歌推送",
        TELEGRAM: "Telegram",
        SPOTIFY: "Spotify",
        BILIBILI: "哔哩哔哩",
        NETFLIX: "Netflix",
        TIKTOK: "TikTok",
        AD_BLOCK: "广告拦截",
        COLD_NODES: "冷门节点",
        LOW_COST: "低倍率节点",
        GLOBAL: "GLOBAL"
      };
      ruleProviders = {
        ADBlock: {
          type: "http",
          behavior: "domain",
          format: "mrs",
          interval: 86400,
          url: `${CDN_URL}/gh/217heidai/adblockfilters@main/rules/adblockmihomolite.mrs`,
          path: "./ruleset/ADBlock.mrs"
        },
        TikTok: {
          type: "http",
          behavior: "classical",
          format: "text",
          interval: 86400,
          url: `${CDN_URL}/gh/powerfullz/override-rules@master/ruleset/TikTok.list`,
          path: "./ruleset/TikTok.list"
        },
        SteamFix: {
          type: "http",
          behavior: "classical",
          format: "text",
          interval: 86400,
          url: `${CDN_URL}/gh/powerfullz/override-rules@master/ruleset/SteamFix.list`,
          path: "./ruleset/SteamFix.list"
        },
        GoogleFCM: {
          type: "http",
          behavior: "classical",
          format: "text",
          interval: 86400,
          url: `${CDN_URL}/gh/powerfullz/override-rules@master/ruleset/FirebaseCloudMessaging.list`,
          path: "./ruleset/FirebaseCloudMessaging.list"
        },
        AdditionalFilter: {
          type: "http",
          behavior: "classical",
          format: "text",
          interval: 86400,
          url: `${CDN_URL}/gh/powerfullz/override-rules@master/ruleset/AdditionalFilter.list`,
          path: "./ruleset/AdditionalFilter.list"
        },
        Crypto: {
          type: "http",
          behavior: "classical",
          format: "text",
          interval: 86400,
          url: `${CDN_URL}/gh/powerfullz/override-rules@master/ruleset/Crypto.list`,
          path: "./ruleset/Crypto.list"
        }
      };
      baseRules = [
        `RULE-SET,ADBlock,${PROXY_GROUPS.AD_BLOCK}`,
        `RULE-SET,AdditionalFilter,${PROXY_GROUPS.AD_BLOCK}`,
        `RULE-SET,Crypto,${PROXY_GROUPS.CRYPTO}`,
        `RULE-SET,TikTok,${PROXY_GROUPS.TIKTOK}`,
        `RULE-SET,SteamFix,DIRECT`,
        `RULE-SET,GoogleFCM,${PROXY_GROUPS.GOOGLE_FCM}`,
        `GEOSITE,YOUTUBE,${PROXY_GROUPS.YOUTUBE}`,
        `GEOSITE,TELEGRAM,${PROXY_GROUPS.TELEGRAM}`,
        `GEOSITE,CATEGORY-AI-!CN,${PROXY_GROUPS.AI_SERVICE}`,
        `GEOSITE,GOOGLE-PLAY@CN,DIRECT`,
        `GEOSITE,MICROSOFT@CN,DIRECT`,
        `GEOSITE,APPLE,${PROXY_GROUPS.APPLE}`,
        `GEOSITE,MICROSOFT,${PROXY_GROUPS.MICROSOFT}`,
        `GEOSITE,GOOGLE,${PROXY_GROUPS.GOOGLE}`,
        `GEOSITE,NETFLIX,${PROXY_GROUPS.NETFLIX}`,
        `GEOSITE,SPOTIFY,${PROXY_GROUPS.SPOTIFY}`,
        `GEOSITE,BILIBILI,${PROXY_GROUPS.BILIBILI}`,
        `GEOSITE,GFW,${PROXY_GROUPS.SELECT}`,
        `GEOSITE,CN,DIRECT`,
        `GEOSITE,PRIVATE,DIRECT`,
        `GEOIP,NETFLIX,${PROXY_GROUPS.NETFLIX},no-resolve`,
        `GEOIP,TELEGRAM,${PROXY_GROUPS.TELEGRAM},no-resolve`,
        `GEOIP,CN,DIRECT`,
        `GEOIP,PRIVATE,DIRECT`,
        `MATCH,${PROXY_GROUPS.SELECT}`
      ];
      snifferConfig = {
        sniff: {
          TLS: {
            ports: [443, 8443]
          },
          HTTP: {
            ports: [80, 8080, 8880]
          },
          QUIC: {
            ports: [443, 8443]
          }
        },
        "override-destination": false,
        enable: true,
        "force-dns-mapping": true,
        "skip-domain": ["Mijia Cloud", "dlg.io.mi.com", "+.push.apple.com"]
      };
      FAKE_IP_FILTER = [
        "geosite:private",
        "geosite:connectivity-check",
        "geosite:cn",
        "Mijia Cloud",
        "dig.io.mi.com",
        "localhost.ptlogin2.qq.com",
        "*.icloud.com",
        "*.stun.*.*",
        "*.stun.*.*.*"
      ];
      geoxURL = {
        geoip: `${CDN_URL}/gh/Loyalsoldier/v2ray-rules-dat@release/geoip.dat`,
        geosite: `${CDN_URL}/gh/Loyalsoldier/v2ray-rules-dat@release/geosite.dat`,
        mmdb: `${CDN_URL}/gh/Loyalsoldier/geoip@release/Country.mmdb`,
        asn: `${CDN_URL}/gh/Loyalsoldier/geoip@release/GeoLite2-ASN.mmdb`
      };
      countriesMeta = {
        香港: {
          weight: 10,
          pattern: "香港|港|HK|hk|Hong Kong|HongKong|hongkong|HKG|🇭🇰"
        },
        台湾: {
          weight: 20,
          pattern: "台|新北|彰化|TW|Taiwan|TPE|KHH|🇹🇼"
        },
        日本: {
          weight: 30,
          // 【修改】排序调整为第 3
          pattern: "日本|川日|东京|大阪|泉日|埼玉|沪日|深日|[^-]日|JP|Japan|Tokyo|NRT|KIX|🇯🇵"
        },
        美国: {
          weight: 40,
          // 【修改】排序调整为第 4
          pattern: "美国|美|波特兰|达拉斯|俄勒冈|凤凰城|费利蒙|硅谷|拉斯维加斯|洛杉矶|圣何塞|圣克拉拉|西雅图|芝加哥|US|United States|ATL|BUF|DFW|EWR|IAD|LAX|MCI|MIA|ORD|PHX|PDX|SEA|SJC|🇺🇸"
        },
        韩国: {
          weight: 50,
          // 【修改】排序调整为第 5
          pattern: "KR|Korea|KOR|Seoul|首尔|春川|韩|韓|ICN|🇰🇷"
        },
        新加坡: {
          weight: 60,
          // 【修改】排序调整为第 6
          pattern: "新加坡|坡|狮城|SG|Singapore|SIN|🇸🇬"
        }
      };
    }
  });

  // src/utils.ts
  function parseBool(value) {
    if (typeof value === "boolean") return value;
    if (typeof value === "string") {
      return value.toLowerCase() === "true" || value === "1";
    }
    return false;
  }
  function parseNumber(value, defaultValue = 0) {
    if (value === null || typeof value === "undefined") {
      return defaultValue;
    }
    const num = parseInt(String(value), 10);
    return Number.isNaN(num) ? defaultValue : num;
  }
  function buildList(...elements) {
    return elements.flat().filter(Boolean);
  }
  var init_utils = __esm({
    "src/utils.ts"() {
      "use strict";
    }
  });

  // src/args.ts
  function buildFeatureFlags(args) {
    const spec = {
      loadbalance: "loadBalance",
      landing: "landing",
      ipv6: "ipv6Enabled",
      full: "fullConfig",
      keepalive: "keepAliveEnabled",
      fakeip: "fakeIPEnabled",
      quic: "quicEnabled",
      regex: "regexFilter"
    };
    const flags = {
      ...FEATURE_FLAG_DEFAULTS,
      countryThreshold: 0
    };
    for (const [sourceKey, targetKey] of Object.entries(spec)) {
      const rawValue = args[sourceKey];
      if (rawValue === null || typeof rawValue === "undefined") {
        flags[targetKey] = FEATURE_FLAG_DEFAULTS[targetKey];
      } else {
        flags[targetKey] = parseBool(rawValue);
      }
    }
    flags.countryThreshold = parseNumber(args.threshold, 0);
    return flags;
  }
  var init_args = __esm({
    "src/args.ts"() {
      "use strict";
      init_constants();
      init_utils();
    }
  });

  // src/proxy_groups.ts
  function buildCountryProxyGroups({
    countries,
    landing,
    loadBalance,
    regexFilter,
    countryInfo
  }) {
    const groups = [];
    const groupType = loadBalance ? "load-balance" : "url-test";
    const nodesByCountry = !regexFilter ? Object.fromEntries(countryInfo.map((item) => [item.country, item.nodes])) : null;
    for (const country of countries) {
      const meta = countriesMeta[country];
      if (!meta) continue;
      const groupConfig = {
        name: `${country}${NODE_SUFFIX}`,
        // 对齐极简设计，不再从 meta 中读取 icon
        type: groupType,
        url: "https://cp.cloudflare.com/generate_204",
        interval: 60,
        tolerance: 20,
        ...loadBalance ? { strategy: "sticky-sessions" } : {}
      };
      if (!regexFilter) {
        const nodeNames = nodesByCountry?.[country] || [];
        Object.assign(groupConfig, {
          proxies: nodeNames
        });
      } else {
        Object.assign(groupConfig, {
          "include-all": true,
          filter: meta.pattern,
          "exclude-filter": landing ? `${LANDING_PATTERN}|${LOW_COST_FILTER}` : LOW_COST_FILTER
        });
      }
      groups.push(groupConfig);
    }
    return groups;
  }
  function buildProxyGroups({
    landing,
    regexFilter,
    countryProxyGroups,
    lowCostNodes,
    landingNodes,
    defaultProxies,
    defaultSelector,
    defaultFallback,
    frontProxySelector
  }) {
    const groups = [
      {
        name: PROXY_GROUPS.SELECT,
        type: "select",
        proxies: defaultSelector,
        "include-all": true
        // 一拉到底模式
      },
      {
        name: PROXY_GROUPS.MANUAL,
        "include-all": true,
        type: "select"
      },
      {
        name: PROXY_GROUPS.AUTO,
        type: "url-test",
        url: "https://cp.cloudflare.com/generate_204",
        proxies: defaultFallback,
        interval: 60,
        tolerance: 20
      },
      {
        name: PROXY_GROUPS.FALLBACK,
        type: "fallback",
        url: "https://cp.cloudflare.com/generate_204",
        proxies: defaultFallback,
        interval: 60,
        tolerance: 20
      },
      landing ? {
        name: PROXY_GROUPS.LANDING,
        type: "select",
        ...regexFilter ? { "include-all": true, filter: LANDING_PATTERN } : { proxies: landingNodes }
      } : null,
      landing ? {
        name: PROXY_GROUPS.FRONT_PROXY,
        type: "select",
        ...regexFilter ? {
          "include-all": true,
          "exclude-filter": LANDING_PATTERN,
          proxies: frontProxySelector
        } : { proxies: frontProxySelector }
      } : null,
      {
        name: PROXY_GROUPS.CRYPTO,
        type: "select",
        proxies: defaultProxies,
        "include-all": true
        // 一拉到底模式
      },
      {
        name: PROXY_GROUPS.AI_SERVICE,
        type: "select",
        proxies: defaultProxies,
        "include-all": true
        // 一拉到底模式
      },
      {
        name: PROXY_GROUPS.YOUTUBE,
        type: "select",
        proxies: defaultProxies,
        "include-all": true
        // 一拉到底模式
      },
      {
        name: PROXY_GROUPS.GOOGLE,
        type: "select",
        proxies: defaultProxies
      },
      {
        name: PROXY_GROUPS.MICROSOFT,
        type: "select",
        proxies: defaultProxies
      },
      {
        name: PROXY_GROUPS.APPLE,
        type: "select",
        proxies: defaultProxies
      },
      {
        name: PROXY_GROUPS.GOOGLE_FCM,
        type: "select",
        proxies: [PROXY_GROUPS.SELECT, "DIRECT", PROXY_GROUPS.AUTO]
      },
      {
        name: PROXY_GROUPS.TELEGRAM,
        type: "select",
        proxies: defaultProxies
      },
      {
        name: PROXY_GROUPS.SPOTIFY,
        type: "select",
        proxies: defaultProxies
      },
      {
        name: PROXY_GROUPS.BILIBILI,
        type: "select",
        proxies: ["DIRECT", PROXY_GROUPS.SELECT, PROXY_GROUPS.AUTO]
      },
      {
        name: PROXY_GROUPS.NETFLIX,
        type: "select",
        proxies: defaultProxies
      },
      {
        name: PROXY_GROUPS.TIKTOK,
        type: "select",
        proxies: defaultProxies
      },
      {
        name: PROXY_GROUPS.AD_BLOCK,
        type: "select",
        // 使用原生字符串 "DIRECT" 替代已删除的 PROXY_GROUPS.DIRECT
        proxies: ["REJECT", "REJECT-DROP", "DIRECT"]
      },
      {
        name: PROXY_GROUPS.COLD_NODES,
        type: "select",
        ...regexFilter ? { "include-all": true, "exclude-filter": COLD_NODES_EXCLUDE_PATTERN } : { proxies: defaultProxies }
      },
      lowCostNodes.length > 0 || regexFilter ? {
        name: PROXY_GROUPS.LOW_COST,
        type: "url-test",
        url: "https://cp.cloudflare.com/generate_204",
        interval: 60,
        tolerance: 20,
        ...!regexFilter ? { proxies: lowCostNodes } : { "include-all": true, filter: LOW_COST_GROUP_PATTERN }
      } : null,
      ...countryProxyGroups
    ];
    return groups.filter(Boolean);
  }
  var init_proxy_groups = __esm({
    "src/proxy_groups.ts"() {
      "use strict";
      init_constants();
    }
  });

  // src/proxy_parser.ts
  function parseLowCost(config) {
    return (config.proxies || []).filter((proxy) => LOW_COST_REGEX.test(proxy.name || "")).map((proxy) => proxy.name).filter((name) => Boolean(name));
  }
  function parseNodesByLanding(config) {
    const landingNodes = [];
    const nonLandingNodes = [];
    for (const proxy of config.proxies || []) {
      const name = proxy.name;
      if (!name) continue;
      if (LANDING_REGEX.test(name)) {
        landingNodes.push(name);
        continue;
      }
      nonLandingNodes.push(name);
    }
    return { landingNodes, nonLandingNodes };
  }
  function parseCountries(config) {
    const proxies = config.proxies || [];
    const countryNodes = /* @__PURE__ */ Object.create(null);
    for (const proxy of proxies) {
      const name = proxy.name || "";
      if (LANDING_REGEX.test(name)) continue;
      if (LOW_COST_REGEX.test(name)) continue;
      for (const [country, regex] of Object.entries(COUNTRY_REGEX_MAP)) {
        if (!regex.test(name)) continue;
        if (!countryNodes[country]) {
          countryNodes[country] = [];
        }
        countryNodes[country].push(name);
        break;
      }
    }
    return Object.entries(countryNodes).map(([country, nodes]) => ({ country, nodes }));
  }
  function getCountryGroupNames(countryInfo, minCount) {
    const filtered = countryInfo.filter((item) => item.nodes.length >= minCount);
    filtered.sort((a, b) => {
      const wa = countriesMeta[a.country]?.weight ?? Infinity;
      const wb = countriesMeta[b.country]?.weight ?? Infinity;
      return wa - wb;
    });
    return filtered.map((item) => item.country + NODE_SUFFIX);
  }
  function stripNodeSuffix(groupNames) {
    const suffixPattern = new RegExp(`${NODE_SUFFIX}$`);
    return groupNames.map((name) => name.replace(suffixPattern, ""));
  }
  var COUNTRY_REGEX_MAP;
  var init_proxy_parser = __esm({
    "src/proxy_parser.ts"() {
      "use strict";
      init_constants();
      COUNTRY_REGEX_MAP = Object.fromEntries(
        Object.entries(countriesMeta).map(([country, meta]) => {
          return [country, new RegExp(meta.pattern.replace(/^\(\?i\)/, ""))];
        })
      );
    }
  });

  // src/rules.ts
  function buildRules({ quicEnabled }) {
    const ruleList = [...baseRules];
    if (!quicEnabled) {
      ruleList.unshift("AND,((DST-PORT,443),(NETWORK,UDP)),REJECT");
    }
    return ruleList;
  }
  var init_rules = __esm({
    "src/rules.ts"() {
      "use strict";
      init_constants();
    }
  });

  // src/dns.ts
  function buildDnsConfig({
    mode,
    ipv6Enabled,
    fakeIpFilter
  }) {
    const config = {
      enable: true,
      ipv6: ipv6Enabled,
      "prefer-h3": true,
      "enhanced-mode": mode,
      "default-nameserver": ["119.29.29.29", "223.5.5.5"],
      nameserver: ["system", "223.5.5.5", "119.29.29.29", "180.184.1.1"],
      fallback: [
        "quic://dns0.eu",
        "https://dns.cloudflare.com/dns-query",
        "https://dns.sb/dns-query",
        "tcp://208.67.222.222",
        "tcp://8.26.56.2"
      ],
      "proxy-server-nameserver": ["https://dns.alidns.com/dns-query", "tls://dot.pub"]
    };
    if (fakeIpFilter) {
      config["fake-ip-filter"] = fakeIpFilter;
    }
    return config;
  }
  var init_dns = __esm({
    "src/dns.ts"() {
      "use strict";
    }
  });

  // src/selectors.ts
  function buildBaseLists({
    landing,
    lowCostNodes,
    countryGroupNames,
    nonLandingNodes,
    regexFilter
  }) {
    const lowCost = lowCostNodes.length > 0 || regexFilter;
    const defaultSelector = buildList(
      PROXY_GROUPS.AUTO,
      PROXY_GROUPS.FALLBACK,
      PROXY_GROUPS.MANUAL,
      // 【提升位置】手动选择
      landing && PROXY_GROUPS.LANDING,
      countryGroupNames,
      // 各大主流国家组
      PROXY_GROUPS.COLD_NODES,
      // 冷门节点
      lowCost && PROXY_GROUPS.LOW_COST,
      "DIRECT"
      // 物理直连
    );
    const defaultProxies = buildList(
      PROXY_GROUPS.SELECT,
      // 默认第一顺位，听从主控台指挥
      PROXY_GROUPS.MANUAL,
      // 【提升位置】手动选择
      landing && PROXY_GROUPS.LANDING,
      // 落地节点
      countryGroupNames,
      // 各大主流国家组
      PROXY_GROUPS.COLD_NODES,
      // 冷门节点
      lowCost && PROXY_GROUPS.LOW_COST,
      // 低倍率节点
      "DIRECT"
      // 物理直连
    );
    const defaultProxiesDirect = buildList(
      "DIRECT",
      PROXY_GROUPS.SELECT,
      PROXY_GROUPS.MANUAL,
      countryGroupNames
    );
    const defaultFallback = buildList(
      landing && PROXY_GROUPS.LANDING,
      countryGroupNames,
      PROXY_GROUPS.COLD_NODES,
      lowCost && PROXY_GROUPS.LOW_COST,
      "DIRECT"
      // 测速池不需要套娃，直接放实体组
    );
    const frontProxySelector = buildList(
      countryGroupNames,
      "DIRECT",
      !regexFilter && nonLandingNodes
    );
    return {
      defaultProxies,
      defaultSelector,
      defaultFallback,
      frontProxySelector
    };
  }
  var init_selectors = __esm({
    "src/selectors.ts"() {
      "use strict";
      init_constants();
      init_utils();
    }
  });

  // src/main.ts
  var require_main = __commonJS({
    "src/main.ts"() {
      init_constants();
      init_args();
      init_proxy_groups();
      init_proxy_parser();
      init_rules();
      init_dns();
      init_selectors();
      function getRawArgs() {
        try {
          return $arguments;
        } catch {
          console.log("[powerfullz 的覆写脚本] 未检测到传入参数，使用默认参数。", {});
          return {};
        }
      }
      var rawArgs = getRawArgs();
      var {
        loadBalance,
        landing,
        ipv6Enabled,
        fullConfig,
        keepAliveEnabled,
        fakeIPEnabled,
        quicEnabled,
        regexFilter,
        countryThreshold
      } = buildFeatureFlags(rawArgs);
      function main(config) {
        const resultConfig = { proxies: config.proxies };
        const countryInfo = parseCountries(resultConfig);
        const lowCostNodes = parseLowCost(resultConfig);
        const countryGroupNames = getCountryGroupNames(countryInfo, countryThreshold);
        const countries = stripNodeSuffix(countryGroupNames);
        const { landingNodes, nonLandingNodes } = landing ? parseNodesByLanding(resultConfig) : { landingNodes: [], nonLandingNodes: [] };
        const {
          defaultProxies,
          // 已清理废弃的 defaultProxiesDirect
          defaultSelector,
          defaultFallback,
          frontProxySelector
        } = buildBaseLists({
          landing,
          lowCostNodes,
          countryGroupNames,
          nonLandingNodes,
          regexFilter
        });
        const countryProxyGroups = buildCountryProxyGroups({
          countries,
          landing,
          loadBalance,
          regexFilter,
          countryInfo
        });
        const proxyGroups = buildProxyGroups({
          landing,
          regexFilter,
          countries,
          countryProxyGroups,
          lowCostNodes,
          landingNodes,
          defaultProxies,
          // 已清理废弃的 defaultProxiesDirect 传参
          defaultSelector,
          defaultFallback,
          frontProxySelector
        });
        const globalProxies = proxyGroups.map((item) => String(item.name));
        proxyGroups.push({
          name: PROXY_GROUPS.GLOBAL,
          "include-all": true,
          type: "select",
          proxies: globalProxies
        });
        const finalRules = buildRules({ quicEnabled });
        if (fullConfig) {
          Object.assign(resultConfig, {
            "mixed-port": 7890,
            "redir-port": 7892,
            "tproxy-port": 7893,
            "routing-mark": 7894,
            "allow-lan": true,
            "bind-address": "*",
            ipv6: ipv6Enabled,
            mode: "rule",
            "unified-delay": true,
            "tcp-concurrent": true,
            "find-process-mode": "off",
            "log-level": "info",
            "geodata-loader": "standard",
            "external-controller": ":9999",
            "disable-keep-alive": !keepAliveEnabled,
            profile: {
              "store-selected": true
            }
          });
        }
        const dnsConfig = buildDnsConfig({
          mode: "redir-host",
          ipv6Enabled
        });
        const dnsConfigFakeIp = buildDnsConfig({
          mode: "fake-ip",
          ipv6Enabled,
          fakeIpFilter: FAKE_IP_FILTER
        });
        Object.assign(resultConfig, {
          "proxy-groups": proxyGroups,
          "rule-providers": ruleProviders,
          rules: finalRules,
          sniffer: snifferConfig,
          dns: fakeIPEnabled ? dnsConfigFakeIp : dnsConfig,
          "geodata-mode": true,
          "geox-url": geoxURL
        });
        return resultConfig;
      }
      globalThis.main = main;
    }
  });
  require_main();
})();
