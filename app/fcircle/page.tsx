/**
 * 朋友圈页面
 * 集成 Friend Circle Lite 组件
 * 支持响应式布局和主题切换
 */

"use client";

import { useEffect, useState } from "react";
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

export default function FCirclePage() {
  const { t } = useTranslation();
  const { hydrated, hydrate, language } = useLanguageStore();
  const { theme } = useThemeStore();
  const { effectsEnabled } = useEffectsStore();
  const colors = usePageColors();
  const [mounted, setMounted] = useState(false);
  const isDark = theme === "dark";

  useEffect(() => {
    hydrate();
    setMounted(true);
  }, [hydrate]);

  // 动态加载 Friend Circle Lite 脚本
  useEffect(() => {
    if (typeof window === "undefined") return;

    // 定义全局 UserConfig
    if (typeof (window as unknown as { UserConfig?: unknown }).UserConfig === "undefined") {
      (window as unknown as { UserConfig: unknown }).UserConfig = {
        private_api_url: "https://fc-lite.268682.xyz/",
        page_turning_number: 24,
        error_img: "https://pic.imgdb.cn/item/6695daa4d9c307b7e953ee3d.jpg",
      };
    }

    // 加载 CSS
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fastly.jsdelivr.net/gh/willow-god/Friend-Circle-Lite/main/fclite.min.css";
    document.head.appendChild(link);

    // 延迟加载 JS，确保 DOM 已经准备好
    const timer = setTimeout(() => {
      // 检查根元素是否存在
      const rootElement = document.getElementById("friend-circle-lite-root");
      if (!rootElement) {
        console.warn("Friend Circle Lite root element not found");
        return;
      }

      // 加载 JS
      const script = document.createElement("script");
      script.src = "https://fastly.jsdelivr.net/gh/willow-god/Friend-Circle-Lite/main/fclite.min.js";
      script.async = true;
      document.body.appendChild(script);
    }, 100);

    return () => {
      clearTimeout(timer);
      // 清理
      document.head.removeChild(link);
    };
  }, []);

  const pageTitle = language === "zh" ? "朋友圈" : "Friend Circle";
  const pageSubtitle =
    language === "zh"
      ? "汇聚朋友们的最新动态，发现更多精彩内容 ✨"
      : "Discover the latest updates from friends and explore more interesting content ✨";

  return (
    <>
      <LoadingScreen />
      <PageTransition hydrated={hydrated} mounted={mounted} />
      <SEOHead
        title={pageTitle}
        description={pageSubtitle}
        url={`${process.env.NEXT_PUBLIC_SITE_URL || ""}/fcircle`}
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
            <div
              className={`rounded-3xl p-8 sm:p-12 mb-8 relative overflow-hidden ${
                isDark ? "bg-[#141824]/50" : "bg-white/50"
              } backdrop-blur-sm border ${
                isDark ? "border-white/5" : "border-gray-200"
              }`}
            >
              {/* 背景装饰 */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div
                  className={`absolute -top-20 -right-20 w-60 h-60 rounded-full blur-3xl ${
                    isDark ? "bg-violet-500/10" : "bg-violet-300/20"
                  }`}
                />
                <div
                  className={`absolute -bottom-20 -left-20 w-60 h-60 rounded-full blur-3xl ${
                    isDark ? "bg-purple-500/10" : "bg-purple-300/20"
                  }`}
                />
              </div>

              <div className="relative text-center">
                <motion.div
                  initial={effectsEnabled ? { opacity: 0, y: 20 } : false}
                  animate={{ opacity: 1, y: 0 }}
                  transition={effectsEnabled ? { delay: 0.1 } : { duration: 0 }}
                  className="inline-flex items-center justify-center w-16 h-16 rounded-2xl shadow-lg mb-6"
                  style={{
                    backgroundColor: "#8B5CF6",
                    boxShadow: "0 10px 25px -5px rgba(139, 92, 246, 0.4)",
                  }}
                >
                  <i className="fas fa-users text-white text-2xl"></i>
                </motion.div>

                <motion.h1
                  className={`text-3xl sm:text-4xl font-bold mb-4 ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                  initial={effectsEnabled ? { opacity: 0, y: 20 } : false}
                  animate={{ opacity: 1, y: 0 }}
                  transition={effectsEnabled ? { delay: 0.2 } : { duration: 0 }}
                >
                  {pageTitle}
                </motion.h1>

                <motion.p
                  className={`text-base sm:text-lg max-w-2xl mx-auto ${
                    isDark ? "text-white/60" : "text-gray-500"
                  }`}
                  initial={effectsEnabled ? { opacity: 0 } : false}
                  animate={{ opacity: 1 }}
                  transition={effectsEnabled ? { delay: 0.3 } : { duration: 0 }}
                >
                  {pageSubtitle}
                </motion.p>

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
                    Friend Circle Lite
                  </span>
                  <a
                    href="/friends"
                    className="px-4 py-1.5 rounded-full text-sm bg-violet-500/10 text-violet-500 hover:bg-violet-500/20 transition-colors"
                  >
                    {language === "zh" ? "查看友链" : "View Friend Links"}
                  </a>
                </motion.div>
              </div>
            </div>
          </motion.header>

          {/* Friend Circle Lite 容器 */}
          <motion.div
            className={`rounded-3xl p-6 sm:p-8 relative overflow-hidden ${
              isDark ? "bg-[#141824]/50" : "bg-white/50"
            } backdrop-blur-sm border ${
              isDark ? "border-white/5" : "border-gray-200"
            }`}
            initial={effectsEnabled ? { opacity: 0, y: 20 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={effectsEnabled ? { delay: 0.5 } : { duration: 0 }}
          >
            <div id="friend-circle-lite-root" className="min-h-[400px]">
              {/* Friend Circle Lite 内容将在这里渲染 */}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </>
  );
}
