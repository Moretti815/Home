/**
 * 说说/动态页面
 * 包含即刻说说、Memos 和 TGTalk 三个 Tab
 */
"use client";

import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useLanguageStore, useTranslation } from "../stores/language-store";
import { useThemeStore } from "../stores/theme-store";
import { useEffectsStore } from "../stores/effects-store";
import { usePageColors } from "../hooks/usePageColors";
import LoadingScreen from "../components/effects/LoadingScreen";
import PageTransition from "../components/effects/PageTransition";
import PageNav from "../components/layout/PageNav";
import SEOHead from "../components/seo/SEOHead";
import ParticleBackground from "../components/effects/ParticleBackground";
import DynamicLines from "../components/effects/DynamicLines";
import TopToolbar from "../components/ui/TopToolbar";
import TabSwitcher from "../components/moments/TabSwitcher";
import MomentCard from "../components/moments/MomentCard";
import MemoCard from "../components/memos/MemoCard";
import TGTalkCard from "../components/tgtalk/TGTalkCard";
import { FilterTabs } from "../components/filter-tabs";
import { parseRSS, transformRSSItemToMoment } from "../utils/moment";
import { getAllTags as getAllMemoTags, filterMemosByTag } from "../utils/memo";
import { getAllTags as getAllTGTalkTags, filterItemsByTag as filterTGTalkByTag } from "../utils/tgtalk";
import type { Moment } from "../types/moment";
import type { Memo, FilterTab } from "../types/memo";
import type { TGTalkItem } from "../types/tgtalk";
import configData from "../../config.json";

// API 地址
const RSS_URL = "/api/moments";
const MEMOS_API_URL = "/api/memos";
const TGTALK_API_URL = "/api/tgtalk";
const MASTODON_API_URL = "/api/mastodon";

// Tab 配置
const allTabs = [
  { value: "moments", label: "说说", icon: "fas fa-comment-dots" },
  { value: "memos", label: "Memos", icon: "fas fa-sticky-note" },
  { value: "tgtalk", label: "TGTalk", icon: "fab fa-telegram" },
  { value: "mastodon", label: "Mastodon", icon: "fab fa-mastodon" },
];

// 从配置读取启用的 Tab
const getEnabledTabs = () => {
  const enabledTabs = configData.momentsPage?.enabledTabs || ["moments", "memos", "tgtalk", "mastodon"];
  return allTabs.filter(tab => enabledTabs.includes(tab.value));
};

// 获取默认 Tab
const getDefaultTab = () => {
  const enabledTabs = configData.momentsPage?.enabledTabs || ["moments", "memos", "tgtalk", "mastodon"];
  const defaultTab = configData.momentsPage?.defaultTab;
  if (defaultTab && enabledTabs.includes(defaultTab)) {
    return defaultTab;
  }
  return enabledTabs[0] || "moments";
};

// 容器动画配置
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

// 浮动动画配置
const floatVariants = {
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut" as const,
    },
  },
  static: {
    y: 0,
    transition: {
      duration: 0,
    },
  },
};

export default function MomentsPage() {
  const { t } = useTranslation();
  const { hydrated, hydrate, language } = useLanguageStore();
  const { theme } = useThemeStore();
  const { effectsEnabled } = useEffectsStore();
  const colors = usePageColors({ glowColor: 'purple' });
  const [mounted, setMounted] = useState(false);
  
  // 获取启用的 Tab 列表
  const tabs = useMemo(() => getEnabledTabs(), []);
  
  // Tab 状态
  const [activeTab, setActiveTab] = useState(getDefaultTab());
  
  // 说说数据
  const [moments, setMoments] = useState<Moment[]>([]);
  const [momentsLoading, setMomentsLoading] = useState(true);
  const [momentsError, setMomentsError] = useState<string | null>(null);
  
  // Memos 数据
  const [memos, setMemos] = useState<Memo[]>([]);
  const [memosLoading, setMemosLoading] = useState(true);
  const [memosError, setMemosError] = useState<string | null>(null);
  const [memoActiveTag, setMemoActiveTag] = useState("all");
  
  // TGTalk 数据
  const [tgtalkItems, setTGTalkItems] = useState<TGTalkItem[]>([]);
  const [tgtalkLoading, setTGTalkLoading] = useState(true);
  const [tgtalkError, setTGTalkError] = useState<string | null>(null);
  const [tgtalkActiveTag, setTGTalkActiveTag] = useState("all");
  
  // Mastodon 数据
  const [mastodonItems, setMastodonItems] = useState<TGTalkItem[]>([]);
  const [mastodonLoading, setMastodonLoading] = useState(true);
  const [mastodonError, setMastodonError] = useState<string | null>(null);
  const [mastodonActiveTag, setMastodonActiveTag] = useState("all");

  useEffect(() => {
    hydrate();
    setMounted(true);
  }, [hydrate]);

  // 确保当前 Tab 在启用列表中
  useEffect(() => {
    const enabledTabs = configData.momentsPage?.enabledTabs || ["moments", "memos", "tgtalk", "mastodon"];
    if (!enabledTabs.includes(activeTab)) {
      setActiveTab(enabledTabs[0] || "moments");
    }
  }, [activeTab]);

  // 获取说说数据
  useEffect(() => {
    if (!mounted) return;
    
    // 检查是否启用了说说 Tab
    const enabledTabs = configData.momentsPage?.enabledTabs || ["moments", "memos", "tgtalk", "mastodon"];
    if (!enabledTabs.includes("moments")) {
      setMomentsLoading(false);
      return;
    }

    const fetchMoments = async () => {
      try {
        setMomentsLoading(true);
        const response = await fetch(RSS_URL);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        const xmlText = await response.text();
        const rssItems = parseRSS(xmlText);
        const transformedMoments = rssItems.map((item, index) =>
          transformRSSItemToMoment(item, index)
        );
        setMoments(transformedMoments);
      } catch (err) {
        setMomentsError(err instanceof Error ? err.message : "获取数据失败");
      } finally {
        setMomentsLoading(false);
      }
    };

    fetchMoments();
  }, [mounted]);

  // 获取 Memos 数据
  useEffect(() => {
    if (!mounted) return;
    
    // 检查是否启用了 Memos Tab
    const enabledTabs = configData.momentsPage?.enabledTabs || ["moments", "memos", "tgtalk", "mastodon"];
    if (!enabledTabs.includes("memos")) {
      setMemosLoading(false);
      return;
    }

    const fetchMemos = async () => {
      try {
        setMemosLoading(true);
        const response = await fetch(MEMOS_API_URL);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        const data = await response.json();
        const sortedMemos = (data.memos || []).sort((a: Memo, b: Memo) => {
          if (a.pinned && !b.pinned) return -1;
          if (!a.pinned && b.pinned) return 1;
          return new Date(b.createTime).getTime() - new Date(a.createTime).getTime();
        });
        setMemos(sortedMemos);
      } catch (err) {
        setMemosError(err instanceof Error ? err.message : "获取数据失败");
      } finally {
        setMemosLoading(false);
      }
    };

    fetchMemos();
    const interval = setInterval(fetchMemos, 60000);
    return () => clearInterval(interval);
  }, [mounted]);

  // 获取 TGTalk 数据
  useEffect(() => {
    if (!mounted) return;
    
    // 检查是否启用了 TGTalk Tab
    const enabledTabs = configData.momentsPage?.enabledTabs || ["moments", "memos", "tgtalk", "mastodon"];
    if (!enabledTabs.includes("tgtalk")) {
      setTGTalkLoading(false);
      return;
    }

    const fetchTGTalk = async () => {
      try {
        setTGTalkLoading(true);
        const response = await fetch(TGTALK_API_URL);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        const data = await response.json();
        const items = (data.data || []).sort((a: TGTalkItem, b: TGTalkItem) => b.time - a.time);
        setTGTalkItems(items);
      } catch (err) {
        setTGTalkError(err instanceof Error ? err.message : "获取数据失败");
      } finally {
        setTGTalkLoading(false);
      }
    };

    fetchTGTalk();
    const interval = setInterval(fetchTGTalk, 60000);
    return () => clearInterval(interval);
  }, [mounted]);

  // 获取 Mastodon 数据
  useEffect(() => {
    if (!mounted) return;
    
    // 检查是否启用了 Mastodon Tab
    const enabledTabs = configData.momentsPage?.enabledTabs || ["moments", "memos", "tgtalk", "mastodon"];
    if (!enabledTabs.includes("mastodon")) {
      setMastodonLoading(false);
      return;
    }

    const fetchMastodon = async () => {
      try {
        setMastodonLoading(true);
        const response = await fetch(MASTODON_API_URL);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        const data = await response.json();
        const items = (data.data || []).sort((a: TGTalkItem, b: TGTalkItem) => b.time - a.time);
        setMastodonItems(items);
      } catch (err) {
        setMastodonError(err instanceof Error ? err.message : "获取数据失败");
      } finally {
        setMastodonLoading(false);
      }
    };

    fetchMastodon();
    const interval = setInterval(fetchMastodon, 60000);
    return () => clearInterval(interval);
  }, [mounted]);

  // Memos 标签筛选
  const memoTags = useMemo(() => getAllMemoTags(memos), [memos]);
  const filteredMemos = useMemo(() => filterMemosByTag(memos, memoActiveTag), [memos, memoActiveTag]);

  const memoFilterTabs: FilterTab[] = useMemo(() => {
    const tabs: FilterTab[] = [
      { value: "all", label: language === "zh" ? "全部" : "All", icon: "fas fa-th-large", count: memos.length },
    ];
    memoTags.forEach((tag) => {
      const count = memos.filter((m) => m.tags.includes(tag)).length;
      tabs.push({ value: tag, label: tag, count });
    });
    return tabs;
  }, [memoTags, memos, language]);

  // TGTalk 标签筛选
  const tgtalkTags = useMemo(() => getAllTGTalkTags(tgtalkItems), [tgtalkItems]);
  const filteredTGTalkItems = useMemo(() => filterTGTalkByTag(tgtalkItems, tgtalkActiveTag), [tgtalkItems, tgtalkActiveTag]);

  const tgtalkFilterTabs: FilterTab[] = useMemo(() => {
    const tabs: FilterTab[] = [
      { value: "all", label: language === "zh" ? "全部" : "All", icon: "fas fa-th-large", count: tgtalkItems.length },
    ];
    tgtalkTags.forEach((tag) => {
      const count = tgtalkItems.filter((item) => {
        const tags = getAllTGTalkTags([item]);
        return tags.includes(tag);
      }).length;
      tabs.push({ value: tag, label: tag, count });
    });
    return tabs;
  }, [tgtalkTags, tgtalkItems, language]);

  // Mastodon 标签筛选
  const mastodonTags = useMemo(() => getAllTGTalkTags(mastodonItems), [mastodonItems]);
  const filteredMastodonItems = useMemo(() => filterTGTalkByTag(mastodonItems, mastodonActiveTag), [mastodonItems, mastodonActiveTag]);

  const mastodonFilterTabs: FilterTab[] = useMemo(() => {
    const tabs: FilterTab[] = [
      { value: "all", label: language === "zh" ? "全部" : "All", icon: "fas fa-th-large", count: mastodonItems.length },
    ];
    mastodonTags.forEach((tag) => {
      const count = mastodonItems.filter((item) => {
        const tags = getAllTGTalkTags([item]);
        return tags.includes(tag);
      }).length;
      tabs.push({ value: tag, label: tag, count });
    });
    return tabs;
  }, [mastodonTags, mastodonItems, language]);

  const pageTitle = language === "zh" ? "动态" : "Moments";
  const pageSubtitle = language === "zh" ? "记录生活的点滴" : "Life moments";

  // 当前显示的数据统计
  const currentCount = useMemo(() => {
    switch (activeTab) {
      case "moments": return moments.length;
      case "memos": return filteredMemos.length;
      case "tgtalk": return filteredTGTalkItems.length;
      case "mastodon": return filteredMastodonItems.length;
      default: return 0;
    }
  }, [activeTab, moments, filteredMemos, filteredTGTalkItems, filteredMastodonItems]);

  const currentLoading = useMemo(() => {
    switch (activeTab) {
      case "moments": return momentsLoading;
      case "memos": return memosLoading;
      case "tgtalk": return tgtalkLoading;
      case "mastodon": return mastodonLoading;
      default: return false;
    }
  }, [activeTab, momentsLoading, memosLoading, tgtalkLoading, mastodonLoading]);

  const currentError = useMemo(() => {
    switch (activeTab) {
      case "moments": return momentsError;
      case "memos": return memosError;
      case "tgtalk": return tgtalkError;
      case "mastodon": return mastodonError;
      default: return null;
    }
  }, [activeTab, momentsError, memosError, tgtalkError, mastodonError]);

  // 当前筛选标签
  const currentFilterTabs = activeTab === "memos" ? memoFilterTabs : activeTab === "mastodon" ? mastodonFilterTabs : tgtalkFilterTabs;
  const currentActiveTag = activeTab === "memos" ? memoActiveTag : activeTab === "mastodon" ? mastodonActiveTag : tgtalkActiveTag;
  const setCurrentActiveTag = activeTab === "memos" ? setMemoActiveTag : activeTab === "mastodon" ? setMastodonActiveTag : setTGTalkActiveTag;

  // 刷新数据
  const handleRefresh = async () => {
    switch (activeTab) {
      case "moments":
        setMomentsLoading(true);
        setMomentsError(null);
        try {
          const response = await fetch(`${RSS_URL}?t=${Date.now()}`);
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }
          const xmlText = await response.text();
          const rssItems = parseRSS(xmlText);
          const transformedMoments = rssItems.map((item, index) =>
            transformRSSItemToMoment(item, index)
          );
          setMoments(transformedMoments);
        } catch (err) {
          setMomentsError(err instanceof Error ? err.message : "获取数据失败");
        } finally {
          setMomentsLoading(false);
        }
        break;
      case "memos":
        setMemosLoading(true);
        setMemosError(null);
        try {
          const response = await fetch(`${MEMOS_API_URL}?t=${Date.now()}`);
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }
          const data = await response.json();
          const sortedMemos = (data.memos || []).sort((a: Memo, b: Memo) => {
            if (a.pinned && !b.pinned) return -1;
            if (!a.pinned && b.pinned) return 1;
            return new Date(b.createTime).getTime() - new Date(a.createTime).getTime();
          });
          setMemos(sortedMemos);
        } catch (err) {
          setMemosError(err instanceof Error ? err.message : "获取数据失败");
        } finally {
          setMemosLoading(false);
        }
        break;
      case "tgtalk":
        setTGTalkLoading(true);
        setTGTalkError(null);
        try {
          const response = await fetch(`${TGTALK_API_URL}?t=${Date.now()}`);
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }
          const data = await response.json();
          const items = (data.data || []).sort((a: TGTalkItem, b: TGTalkItem) => b.time - a.time);
          setTGTalkItems(items);
        } catch (err) {
          setTGTalkError(err instanceof Error ? err.message : "获取数据失败");
        } finally {
          setTGTalkLoading(false);
        }
        break;
      case "mastodon":
        setMastodonLoading(true);
        setMastodonError(null);
        try {
          const response = await fetch(`${MASTODON_API_URL}?t=${Date.now()}`);
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }
          const data = await response.json();
          const items = (data.data || []).sort((a: TGTalkItem, b: TGTalkItem) => b.time - a.time);
          setMastodonItems(items);
        } catch (err) {
          setMastodonError(err instanceof Error ? err.message : "获取数据失败");
        } finally {
          setMastodonLoading(false);
        }
        break;
    }
  };

  return (
    <>
      <LoadingScreen />
      <PageTransition hydrated={hydrated} mounted={mounted} />
      <SEOHead
        title={pageTitle}
        description={pageSubtitle}
        url={`${process.env.NEXT_PUBLIC_SITE_URL || ""}/moments`}
      />
      <motion.div
        className={`min-h-screen ${colors.background} relative overflow-hidden`}
        initial={effectsEnabled ? "hidden" : "visible"}
        animate="visible"
        variants={effectsEnabled ? containerVariants : undefined}
      >
        <TopToolbar />
        <ParticleBackground theme={theme} />
        <DynamicLines theme={theme} />

        {effectsEnabled && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-3xl"
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl"
              animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
        )}

        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 relative z-10">
          {/* 页面头部 */}
          <motion.header className="mb-8">
            <PageNav
              cardClass={colors.card}
              textClass={colors.text}
              hoverClass="hover:bg-purple-500/10"
            />

            {/* 渐变横幅 */}
            <motion.div
              className={`${colors.card} rounded-2xl overflow-hidden mb-6`}
              initial={effectsEnabled ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
              animate={{ opacity: 1, y: 0 }}
              transition={effectsEnabled ? { delay: 0.1 } : { duration: 0 }}
            >
              <div className="px-6 sm:px-9 py-6">
                <div className="rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 p-5 sm:p-6">
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <motion.div
                          variants={floatVariants}
                          animate={effectsEnabled ? "animate" : "static"}
                          className="relative inline-flex items-center justify-center w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm"
                        >
                          <i className="fas fa-stream text-white text-lg"></i>
                        </motion.div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-white drop-shadow-sm truncate">
                          {pageTitle}
                        </h1>
                      </div>
                      <p className="text-sm sm:text-base text-white/80 truncate">
                        {pageSubtitle}
                      </p>
                    </div>
                    <div className="shrink-0 text-center">
                      <span className="block text-2xl sm:text-3xl font-bold text-white drop-shadow-sm">
                        {currentCount}
                      </span>
                      <span className="block text-xs sm:text-sm text-white/70">
                        {activeTab === "moments" 
                          ? (language === "zh" ? "条动态" : "moments")
                          : activeTab === "memos"
                          ? (language === "zh" ? "条记录" : "memos")
                          : (language === "zh" ? "条消息" : "messages")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Tab 切换 */}
            <motion.div
              className="flex justify-center"
              initial={effectsEnabled ? { opacity: 0, y: 10 } : { opacity: 1, y: 0 }}
              animate={{ opacity: 1, y: 0 }}
              transition={effectsEnabled ? { delay: 0.15 } : { duration: 0 }}
            >
              <TabSwitcher
                tabs={tabs}
                activeValue={activeTab}
                onChange={setActiveTab}
                onRefresh={handleRefresh}
                isRefreshing={currentLoading}
              />
            </motion.div>
          </motion.header>

          {/* 内容区域 */}
          <motion.div
            className={`${colors.card} rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl ${colors.glow}`}
            initial={effectsEnabled ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            transition={effectsEnabled ? { delay: 0.2 } : { duration: 0 }}
          >
            {/* 筛选标签 - Memos、TGTalk 和 Mastodon */}
            {(activeTab === "memos" || activeTab === "tgtalk" || activeTab === "mastodon") && currentFilterTabs.length > 1 && (
              <div className="mb-6">
                <FilterTabs
                  tabs={currentFilterTabs}
                  activeValue={currentActiveTag}
                  onChange={setCurrentActiveTag}
                />
              </div>
            )}

            {currentLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="animate-pulse text-center">
                  <i className="fas fa-spinner fa-spin text-3xl mb-4 text-purple-500"></i>
                  <p className={colors.textSecondary}>加载中...</p>
                </div>
              </div>
            ) : currentError ? (
              <div className="text-center py-16">
                <i className="fas fa-exclamation-circle text-4xl mb-4 text-red-400"></i>
                <p className={colors.textSecondary}>{currentError}</p>
              </div>
            ) : activeTab === "moments" ? (
              moments.length === 0 ? (
                <div className="text-center py-16">
                  <i className="fas fa-inbox text-4xl mb-4 text-gray-400"></i>
                  <p className={colors.textSecondary}>
                    {language === "zh" ? "暂无动态" : "No moments yet"}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {moments.map((moment, index) => (
                    <MomentCard
                      key={moment.id}
                      moment={moment}
                      index={index}
                      effectsEnabled={effectsEnabled}
                      minutesAgo={language === "zh" ? "分钟前" : "m ago"}
                      hoursAgo={language === "zh" ? "小时前" : "h ago"}
                      daysAgo={language === "zh" ? "天前" : "d ago"}
                    />
                  ))}
                </div>
              )
            ) : activeTab === "memos" ? (
              filteredMemos.length === 0 ? (
                <div className="text-center py-16">
                  <i className="fas fa-inbox text-4xl mb-4 text-gray-400"></i>
                  <p className={colors.textSecondary}>
                    {language === "zh" ? "暂无记录" : "No memos yet"}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredMemos.map((memo, index) => (
                    <MemoCard
                      key={memo.name}
                      memo={memo}
                      index={index}
                      effectsEnabled={effectsEnabled}
                      minutesAgo={language === "zh" ? "分钟前" : "m ago"}
                      hoursAgo={language === "zh" ? "小时前" : "h ago"}
                      daysAgo={language === "zh" ? "天前" : "d ago"}
                    />
                  ))}
                </div>
              )
            ) : activeTab === "tgtalk" ? (
              filteredTGTalkItems.length === 0 ? (
                <div className="text-center py-16">
                  <i className="fas fa-inbox text-4xl mb-4 text-gray-400"></i>
                  <p className={colors.textSecondary}>
                    {language === "zh" ? "暂无消息" : "No messages yet"}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredTGTalkItems.map((item, index) => (
                    <TGTalkCard
                      key={item.id}
                      item={item}
                      index={index}
                      effectsEnabled={effectsEnabled}
                      minutesAgo={language === "zh" ? "分钟前" : "m ago"}
                      hoursAgo={language === "zh" ? "小时前" : "h ago"}
                      daysAgo={language === "zh" ? "天前" : "d ago"}
                    />
                  ))}
                </div>
              )
            ) : filteredMastodonItems.length === 0 ? (
              <div className="text-center py-16">
                <i className="fas fa-inbox text-4xl mb-4 text-gray-400"></i>
                <p className={colors.textSecondary}>
                  {language === "zh" ? "暂无消息" : "No messages yet"}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredMastodonItems.map((item, index) => (
                  <TGTalkCard
                    key={item.id}
                    item={item}
                    index={index}
                    effectsEnabled={effectsEnabled}
                    minutesAgo={language === "zh" ? "分钟前" : "m ago"}
                    hoursAgo={language === "zh" ? "小时前" : "h ago"}
                    daysAgo={language === "zh" ? "天前" : "d ago"}
                  />
                ))}
              </div>
            )}
          </motion.div>

          {/* 底部提示 */}
          <motion.div
            className={`mt-6 text-center text-sm ${colors.textSecondary}`}
            initial={effectsEnabled ? { opacity: 0 } : { opacity: 1 }}
            animate={{ opacity: 1 }}
            transition={effectsEnabled ? { delay: 0.4 } : { duration: 0 }}
          >
            <p>
              {activeTab === "moments" 
                ? "数据来自即刻" 
                : activeTab === "memos"
                ? "数据来自 Memos"
                : activeTab === "tgtalk"
                ? "数据来自 TGTalk"
                : "数据来自 Mastodon"}
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* 全局样式 */}
      <style jsx global>{`
        .moment-card, .memo-card, .tgtalk-card {
          opacity: 1;
        }

        /* 仅在启用动画效果时使用 CSS 动画 */
        .effects-enabled .moment-card,
        .effects-enabled .memo-card,
        .effects-enabled .tgtalk-card {
          animation: fadeInUp 0.5s ease-out forwards;
          opacity: 0;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* 图片布局 */
        .moment-images, .memo-images, .tgtalk-images {
          max-width: 100%;
        }

        .moment-images-single, .memo-images-single, .tgtalk-images-single {
          grid-template-columns: 1fr;
          max-width: 300px;
        }

        .moment-images-double, .memo-images-double, .tgtalk-images-double {
          grid-template-columns: repeat(2, 1fr);
          max-width: 400px;
        }

        .moment-images-triple, .memo-images-triple, .tgtalk-images-triple {
          grid-template-columns: repeat(2, 1fr);
          max-width: 400px;
        }
        .moment-images-triple > :first-child,
        .memo-images-triple > :first-child,
        .tgtalk-images-triple > :first-child {
          grid-row: span 2;
        }

        .moment-images-grid, .memo-images-grid, .tgtalk-images-grid {
          grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
          max-width: 500px;
        }

        @media (min-width: 768px) {
          .moment-images-single, .memo-images-single, .tgtalk-images-single {
            max-width: 350px;
          }
          .moment-images-double, .memo-images-double, .tgtalk-images-double {
            max-width: 450px;
          }
          .moment-images-triple, .memo-images-triple, .tgtalk-images-triple {
            max-width: 450px;
          }
          .moment-images-grid, .memo-images-grid, .tgtalk-images-grid {
            grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
            max-width: 600px;
          }
        }

        @media (max-width: 480px) {
          .moment-images-triple, .memo-images-triple, .tgtalk-images-triple {
            grid-template-columns: repeat(2, 1fr);
          }
          .moment-images-triple > :first-child,
          .memo-images-triple > :first-child,
          .tgtalk-images-triple > :first-child {
            grid-row: span 1;
          }
          .moment-images-grid, .memo-images-grid, .tgtalk-images-grid {
            grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
          }
        }

        /* Prose 样式调整 */
        .prose pre {
          max-width: 100%;
          overflow-x: auto;
        }

        .prose img {
          max-width: 100%;
          height: auto;
        }

        /* TGTalk 内容样式 */
        .tgtalk-card a {
          color: inherit;
          text-decoration: none;
        }
        
        .tgtalk-card a:hover {
          text-decoration: underline;
        }

        .dark .tgtalk-card a {
          color: #a78bfa;
        }
        
        .dark .tgtalk-card a:hover {
          color: #c4b5fd;
        }
      `}</style>
    </>
  );
}
