/* eslint-disable react-hooks/exhaustive-deps */
/**
 * 友链页面
 * 展示友情链接列表
 * 支持响应式布局和主题切换
 * 支持瀑布流布局、粒子背景、搜索功能
 */

"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguageStore, useTranslation } from "../stores/language-store";
import { useThemeStore } from "../stores/theme-store";
import { friendLinksConfig } from "../site-config";
import { useEffectsStore } from "../stores/effects-store";
import { usePageColors } from "../hooks/usePageColors";
import LoadingScreen from "../components/effects/LoadingScreen";
import PageTransition from "../components/effects/PageTransition";
import PageNav from "../components/layout/PageNav";
import SEOHead from "../components/seo/SEOHead";
import ParticleBackground from "../components/effects/ParticleBackground";
import DynamicLines from "../components/effects/DynamicLines";
import TopToolbar from "../components/ui/TopToolbar";
import type { FriendLink } from "../../types";

// 延迟状态类型
interface LinkStatus {
  link: string;
  latency: number;
}

interface StatusData {
  link_status: LinkStatus[];
}

// 容器动画配置
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
    },
  },
};

// 卡片动画配置
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 15,
    },
  },
};

// 友链卡片组件
function FriendCard({ link, index, effectsEnabled, statusData }: { link: FriendLink; index: number; effectsEnabled: boolean; statusData?: StatusData }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';

  // 获取延迟状态
  const getLatencyStatus = () => {
    if (!statusData?.link_status) return null;
    const normalizedUrl = link.url.replace(/\/$/, '');
    const status = statusData.link_status.find(item => 
      item.link.replace(/\/$/, '') === normalizedUrl
    );
    if (!status) return null;
    
    if (status.latency === -1) {
      return { text: '未知', className: 'status-tag-red' };
    }
    
    const latencyText = status.latency.toFixed(2) + 's';
    let className = 'status-tag-red';
    if (status.latency <= 2) {
      className = 'status-tag-green';
    } else if (status.latency <= 5) {
      className = 'status-tag-light-yellow';
    } else if (status.latency <= 10) {
      className = 'status-tag-dark-yellow';
    }
    
    return { text: latencyText, className };
  };

  const latencyStatus = getLatencyStatus();

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const getFaviconUrl = (url: string, avatar?: string) => {
    if (avatar) return avatar;
    try {
      const urlObj = new URL(url);
      return `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=64`;
    } catch {
      return null;
    }
  };

  const getHostname = (url: string) => {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  };

  return (
    <motion.div
      ref={cardRef}
      variants={effectsEnabled ? cardVariants : undefined}
      initial={effectsEnabled ? "hidden" : false}
      animate={effectsEnabled ? "visible" : false}
      className={`friend-card group relative rounded-xl overflow-hidden cursor-pointer transition-all duration-300 ${
        isDark 
          ? 'bg-[#141824] hover:bg-[#1a1f2e]' 
          : 'bg-white hover:bg-gray-50'
      }`}
      style={{
        boxShadow: isDark 
          ? '0 2px 16px -4px rgba(0,0,0,0.5)' 
          : '0 2px 16px -4px rgba(0,0,0,0.1)'
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => window.open(link.url, '_blank', 'noopener,noreferrer')}
      whileHover={effectsEnabled ? { y: -4 } : undefined}
    >
      {/* Tags 标签 - 左上角 */}
      {link.tags && link.tags.length > 0 && (
        <div className="friend-card-tags">
          {link.tags.map((tag, idx) => (
            <span key={idx} className="friend-card-tag" data-tag={tag}>
              {tag}
            </span>
          ))}
        </div>
      )}
      {/* 延迟状态标签 */}
      {latencyStatus && (
        <div className={`status-tag ${latencyStatus.className}`}>
          {latencyStatus.text}
        </div>
      )}
      {/* 发光效果 */}
      <div 
        className="friend-card-glow absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-10"
        style={{
          background: isHovered 
            ? `radial-gradient(300px circle at ${mousePosition.x}px ${mousePosition.y}px, ${isDark ? 'rgba(139,92,246,0.15)' : 'rgba(139,92,246,0.1)'}, transparent 60%)`
            : 'none'
        }}
      />

      {/* 网站截图 - 更大的区域 */}
      <div className="friend-siteshot relative w-full aspect-[16/10] overflow-hidden">
        {link.screenshot ? (
          <Image
            src={link.screenshot}
            alt={`${link.name} screenshot`}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            unoptimized
          />
        ) : (
          <div className={`w-full h-full flex items-center justify-center ${isDark ? 'bg-gradient-to-br from-violet-500/10 to-purple-500/10' : 'bg-gradient-to-br from-violet-100 to-purple-100'}`}>
            <i className={`fas fa-image text-3xl ${isDark ? 'text-white/20' : 'text-gray-300'}`}></i>
          </div>
        )}
      </div>

      {/* 卡片内容 */}
      <div className="friend-body relative px-4 py-3">
        {/* 头像、名称和域名行 */}
        <div className="flex items-center gap-3 mb-2">
          {/* 头像容器 */}
          <div className="relative shrink-0 w-10 h-10">
            <div 
              className={`w-full h-full rounded-full overflow-hidden ring-2 transition-all duration-300 ${
                isDark ? 'ring-[#141824]' : 'ring-white'
              } shadow-md bg-gray-100`}
            >
              {getFaviconUrl(link.url, link.avatar) ? (
                <Image
                  src={getFaviconUrl(link.url, link.avatar) || ""}
                  alt={link.name}
                  width={40}
                  height={40}
                  className="w-full h-full object-cover rounded-full"
                  unoptimized
                />
              ) : (
                <div className={`w-full h-full flex items-center justify-center ${isDark ? 'bg-violet-500/20' : 'bg-violet-100'}`}>
                  <i className={`fas fa-globe text-sm ${isDark ? 'text-violet-400' : 'text-violet-500'}`}></i>
                </div>
              )}
            </div>
            
            {/* 友链页链接遮罩 */}
            <a
              href={`${link.url}/friends`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className={`absolute inset-0 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 ${
                isDark ? 'bg-black/60' : 'bg-black/40'
              }`}
              title="访问友链页"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
            </a>
          </div>

          {/* 名称和域名 */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className={`font-semibold text-sm truncate transition-colors ${
                isDark ? 'text-white group-hover:text-violet-400' : 'text-gray-900 group-hover:text-violet-600'
              }`}>
                {link.name}
              </h3>
              
              {/* RSS 图标 */}
              {link.feed && (
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    window.open(link.feed, '_blank', 'noopener,noreferrer');
                  }}
                  className={`shrink-0 p-1 rounded transition-colors cursor-pointer ${
                    isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'
                  }`}
                  title="RSS Feed"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" className="text-orange-500">
                    <path fill="currentColor" d="M6.18 15.64a2.18 2.18 0 0 1 2.18 2.18C8.36 19 7.38 20 6.18 20C5 20 4 19 4 17.82a2.18 2.18 0 0 1 2.18-2.18M4 4.44A15.56 15.56 0 0 1 19.56 20h-2.83A12.73 12.73 0 0 0 4 7.27zm0 5.66a9.9 9.9 0 0 1 9.9 9.9h-2.83A7.07 7.07 0 0 0 4 12.93z"/>
                  </svg>
                </span>
              )}
            </div>
            <p className={`text-xs truncate ${isDark ? 'text-white/50' : 'text-gray-400'}`}>
              {getHostname(link.url)}
            </p>
          </div>
        </div>

        {/* 描述 */}
        <p className={`text-xs line-clamp-2 leading-relaxed ${isDark ? 'text-white/70' : 'text-gray-600'}`}>
          {link.description?.zh || link.description?.en || ""}
        </p>
      </div>
    </motion.div>
  );
}

export default function FriendLinksPage() {
  const { t } = useTranslation();
  const { hydrated, hydrate, language } = useLanguageStore();
  const { theme } = useThemeStore();
  const { effectsEnabled } = useEffectsStore();
  const colors = usePageColors();
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusData, setStatusData] = useState<StatusData | undefined>(undefined);
  const isDark = theme === 'dark';

  useEffect(() => {
    hydrate();
    setMounted(true);
  }, [hydrate]);

  // 加载延迟状态数据
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const cacheKey = "statusTagsData";
    const cacheExpirationTime = 30 * 60 * 1000; // 半小时
    
    const fetchDataAndUpdateUI = async () => {
      try {
        const response = await fetch('https://clink.268682.xyz/result.json');
        const data: StatusData = await response.json();
        setStatusData(data);
        const cacheData = {
          data: data,
          timestamp: Date.now()
        };
        localStorage.setItem(cacheKey, JSON.stringify(cacheData));
      } catch (error) {
        console.error('Error fetching status data:', error);
      }
    };
    
    // 检查缓存
    const cachedData = localStorage.getItem(cacheKey);
    if (cachedData) {
      const { data, timestamp } = JSON.parse(cachedData);
      if (Date.now() - timestamp < cacheExpirationTime) {
        setStatusData(data);
        return;
      }
    }
    
    fetchDataAndUpdateUI();
  }, []);

  const links: FriendLink[] = friendLinksConfig?.links || [];
  const pageTitle = friendLinksConfig?.title?.[language] || t("friendLinks");

  // 过滤友链
  const filteredLinks = useMemo(() => {
    if (!searchQuery.trim()) return links;
    const query = searchQuery.toLowerCase();
    return links.filter(link => 
      link.name.toLowerCase().includes(query) ||
      link.description?.[language]?.toLowerCase().includes(query) ||
      link.description?.zh?.toLowerCase().includes(query) ||
      link.url.toLowerCase().includes(query)
    );
  }, [links, searchQuery, language]);

  return (
    <>
      <LoadingScreen />
      <PageTransition hydrated={hydrated} mounted={mounted} />
      <SEOHead
        title={pageTitle}
        description={pageTitle}
        url={`${process.env.NEXT_PUBLIC_SITE_URL || ""}/friends`}
      />
      <motion.div 
        className={`min-h-screen ${colors.background} relative overflow-hidden`}
        initial={effectsEnabled ? "hidden" : false}
        animate={effectsEnabled ? "visible" : false}
        variants={effectsEnabled ? containerVariants : undefined}
      >
        {/* 顶部工具栏 */}
        <TopToolbar />
        
        {/* 粒子背景 */}
        <ParticleBackground theme={theme} />
        
        {/* 动态线条 */}
        <DynamicLines theme={theme} />

        <div className="max-w-7xl mx-auto px-4 py-8 relative z-10">
          {/* 页面头部 */}
          <motion.header className="mb-10">
            <PageNav
              cardClass={colors.card}
              textClass={colors.text}
              hoverClass="hover:bg-violet-500/10"
            />
            
            {/* Hero 区域 */}
            <div className={`rounded-3xl p-8 sm:p-12 mb-8 relative overflow-hidden ${isDark ? 'bg-[#141824]/50' : 'bg-white/50'} backdrop-blur-sm border ${isDark ? 'border-white/5' : 'border-gray-200'}`}>
              {/* 背景装饰 */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className={`absolute -top-20 -right-20 w-60 h-60 rounded-full blur-3xl ${isDark ? 'bg-violet-500/10' : 'bg-violet-300/20'}`} />
                <div className={`absolute -bottom-20 -left-20 w-60 h-60 rounded-full blur-3xl ${isDark ? 'bg-purple-500/10' : 'bg-purple-300/20'}`} />
              </div>
              
              <div className="relative text-center">
                <motion.div
                  initial={effectsEnabled ? { opacity: 0, y: 20 } : false}
                  animate={{ opacity: 1, y: 0 }}
                  transition={effectsEnabled ? { delay: 0.1 } : { duration: 0 }}
                  className="inline-flex items-center justify-center w-16 h-16 rounded-2xl shadow-lg mb-6"
                  style={{ backgroundColor: "#3271AE", boxShadow: "0 10px 25px -5px rgba(50, 113, 174, 0.4)" }}
                >
                  <i className="fas fa-link text-white text-2xl"></i>
                </motion.div>
                
                <motion.h1 
                  className={`text-3xl sm:text-4xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}
                  initial={effectsEnabled ? { opacity: 0, y: 20 } : false}
                  animate={{ opacity: 1, y: 0 }}
                  transition={effectsEnabled ? { delay: 0.2 } : { duration: 0 }}
                >
                  {pageTitle}
                </motion.h1>
                
                <motion.p 
                  className={`text-base sm:text-lg max-w-2xl mx-auto ${isDark ? 'text-white/60' : 'text-gray-500'}`}
                  initial={effectsEnabled ? { opacity: 0 } : false}
                  animate={{ opacity: 1 }}
                  transition={effectsEnabled ? { delay: 0.3 } : { duration: 0 }}
                >
                  {t('friendLinksSubtitle') || "在互联网的星河里，记录那些常来常往、彼此照亮的朋友们。"}
                </motion.p>
                
                {/* Tab 切换 */}
                <motion.div
                  className="mt-6 flex items-center justify-center"
                  initial={effectsEnabled ? { opacity: 0, y: 10 } : false}
                  animate={{ opacity: 1, y: 0 }}
                  transition={effectsEnabled ? { delay: 0.35 } : { duration: 0 }}
                >
                  <div
                    className={`inline-flex items-center p-1 rounded-xl ${
                      isDark ? "bg-white/5" : "bg-gray-100"
                    }`}
                  >
                    <a
                      href="/friends"
                      className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                        isDark
                          ? "bg-violet-500 text-white shadow-lg"
                          : "bg-white text-violet-600 shadow-sm"
                      }`}
                    >
                      <i className="fas fa-link mr-2"></i>
                      {language === "zh" ? "友链" : "Links"}
                    </a>
                    <a
                      href="/fcircle"
                      className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                        isDark
                          ? "text-white/60 hover:text-white"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      <i className="fas fa-users mr-2"></i>
                      {language === "zh" ? "朋友圈" : "Circle"}
                    </a>
                  </div>
                </motion.div>

                {/* 统计信息 */}
                <motion.div
                  className="mt-6 flex flex-wrap items-center justify-center gap-3"
                  initial={effectsEnabled ? { opacity: 0, y: 10 } : false}
                  animate={{ opacity: 1, y: 0 }}
                  transition={effectsEnabled ? { delay: 0.4 } : { duration: 0 }}
                >
                  <span
                    className={`px-4 py-1.5 rounded-full text-sm ${
                      isDark
                        ? "bg-white/5 text-white/70"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {filteredLinks.length} 个站点
                  </span>
                  <a
                    href="/addlink"
                    className="px-4 py-1.5 rounded-full text-sm bg-violet-500/10 text-violet-500 hover:bg-violet-500/20 transition-colors"
                  >
                    申请友链
                  </a>
                </motion.div>
              </div>
            </div>
            
            {/* 搜索框 */}
            <motion.div 
              className="max-w-md mx-auto"
              initial={effectsEnabled ? { opacity: 0, y: 10 } : false}
              animate={{ opacity: 1, y: 0 }}
              transition={effectsEnabled ? { delay: 0.5 } : { duration: 0 }}
            >
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('searchFriendLinks') || "搜索友链..."}
                  className={`w-full px-5 py-3.5 pl-12 rounded-xl transition-all focus:outline-none focus:ring-2 ${
                    isDark 
                      ? 'bg-[#141824] border border-white/10 text-white placeholder-white/30 focus:ring-violet-500/30' 
                      : 'bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:ring-violet-500/30'
                  }`}
                />
                <i className={`fas fa-search absolute left-4 top-1/2 -translate-y-1/2 ${isDark ? 'text-white/30' : 'text-gray-400'}`}></i>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors ${isDark ? 'text-white/30 hover:text-white/60' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                )}
              </div>
            </motion.div>
          </motion.header>

          {/* 友链网格 */}
          {filteredLinks.length > 0 ? (
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
              variants={effectsEnabled ? containerVariants : undefined}
            >
              <AnimatePresence mode="popLayout">
                {filteredLinks.map((link, index) => (
                  <FriendCard
                    key={link.id}
                    link={link}
                    index={index}
                    effectsEnabled={effectsEnabled}
                    statusData={statusData}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.div 
              className={`rounded-3xl p-12 text-center ${isDark ? 'bg-[#141824]' : 'bg-white'} shadow-xl`}
            >
              <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 ${isDark ? 'bg-white/5' : 'bg-gray-100'}`}>
                <i className={`fas fa-search text-3xl ${isDark ? 'text-white/20' : 'text-gray-300'}`}></i>
              </div>
              <h3 className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {searchQuery ? '没有找到匹配的友链' : '暂无友链'}
              </h3>
              <p className={isDark ? 'text-white/50' : 'text-gray-400'}>
                {searchQuery ? '尝试使用其他关键词搜索' : '期待与更多朋友相遇'}
              </p>
            </motion.div>
          )}

          {/* 申请友链区域 */}
          <motion.div 
            className={`mt-12 rounded-2xl p-8 text-center relative overflow-hidden ${isDark ? 'bg-[#141824]' : 'bg-white'} border ${isDark ? 'border-white/5' : 'border-gray-200'}`}
            style={{
              boxShadow: isDark 
                ? '0 4px 24px -8px rgba(0,0,0,0.4)' 
                : '0 4px 24px -8px rgba(0,0,0,0.1)'
            }}
          >
            <div className={`absolute inset-0 bg-gradient-to-r ${isDark ? 'from-violet-500/5 via-purple-500/5 to-indigo-500/5' : 'from-violet-50 via-purple-50 to-indigo-50'}`} />
            <div className="relative">
              <div 
                className="inline-flex items-center justify-center w-14 h-14 rounded-xl shadow-lg mb-4"
                style={{ backgroundColor: "#3271AE", boxShadow: "0 10px 25px -5px rgba(50, 113, 174, 0.4)" }}
              >
                <i className="fas fa-handshake text-white text-xl"></i>
              </div>
              <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('applyFriendLink') || '申请友链'}
              </h3>
              <p className={`text-sm max-w-md mx-auto mb-4 ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
                {t('applyFriendLinkDesc') || '欢迎交换友链，让我们一起建立连接'}
              </p>
              <a
                href="/addlink"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium bg-violet-500 text-white hover:bg-violet-600 transition-colors"
                style={{ boxShadow: "0 10px 25px -5px rgba(139, 92, 246, 0.4)" }}
              >
                <i className="fas fa-arrow-right"></i>
                {language === "zh" ? "前往申请页面" : "Go to Application Page"}
              </a>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </>
  );
}
