/**
 * 导航页面
 * 展示工具和资源导航
 * 参考 Fuwari tools.astro 设计
 */
"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Icon } from "@iconify/react";
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
import { guideConfig } from "../site-config";
import type { GuideCategory, GuideItem } from "../../types/config";

// 主题色配置
const THEME_COLORS = {
  dark: "#E18A3B",
  light: "#80A492",
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

// 分类动画配置
const categoryVariants = {
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

// 项目动画配置
const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 15,
    },
  },
};

interface GuideCardProps {
  item: GuideItem;
  index: number;
  isDark: boolean;
  language: string;
  primaryColor: string;
}

function GuideCard({ item, index, isDark, language, primaryColor }: GuideCardProps) {
  // 判断是否为外部链接（以 http:// 或 https:// 开头）
  const isExternal = item.url.startsWith("http://") || item.url.startsWith("https://");
  
  return (
    <motion.a
      href={item.url}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
      variants={itemVariants}
      className={`group block p-5 transition-all border-b last:border-b-0 ${
        isDark
          ? "border-white/10 hover:bg-white/5"
          : "border-black/10 hover:bg-black/5"
      }`}
    >
      <div className="flex items-center gap-3 mb-1">
        <Icon
          icon={item.icon}
          className="w-6 h-6"
          style={{ color: primaryColor }}
        />
        <span
          className={`text-lg font-bold transition ${
            isDark ? "text-white/75" : "text-gray-800"
          }`}
          style={{ color: isDark ? undefined : primaryColor }}
        >
          {item.title}
        </span>
      </div>
      <p
        className={`text-sm ml-9 ${
          isDark ? "text-white/50" : "text-gray-500"
        }`}
      >
        {language === "zh" ? item.description.zh : item.description.en}
      </p>
    </motion.a>
  );
}

interface GuideCategorySectionProps {
  category: GuideCategory;
  index: number;
  isDark: boolean;
  language: string;
  primaryColor: string;
}

function GuideCategorySection({
  category,
  index,
  isDark,
  language,
  primaryColor,
}: GuideCategorySectionProps) {
  return (
    <motion.div
      variants={categoryVariants}
      className={`rounded-2xl overflow-hidden mb-6 ${
        isDark
          ? "bg-[#141824] border border-white/10"
          : "bg-white border border-black/10"
      }`}
    >
      {/* 分类标题 */}
      <div
        className={`px-6 py-4 border-b ${
          isDark ? "border-white/10" : "border-black/10"
        }`}
      >
        <h2
          className={`text-xl font-bold ${
            isDark ? "text-white" : "text-gray-900"
          }`}
        >
          {language === "zh" ? category.title.zh : category.title.en}
        </h2>
      </div>

      {/* 项目列表 */}
      <div>
        {category.items.map((item: GuideItem, itemIndex: number) => (
          <GuideCard
            key={item.id}
            item={item}
            index={itemIndex}
            isDark={isDark}
            language={language}
            primaryColor={primaryColor}
          />
        ))}
      </div>
    </motion.div>
  );
}

export default function GuidePage() {
  const { t } = useTranslation();
  const { hydrated, hydrate, language } = useLanguageStore();
  const { theme } = useThemeStore();
  const { effectsEnabled } = useEffectsStore();
  const colors = usePageColors({ glowColor: "purple" });
  const [mounted, setMounted] = useState(false);
  const primaryColor = theme === "dark" ? THEME_COLORS.dark : THEME_COLORS.light;

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (hydrated) {
      const timer = setTimeout(() => setMounted(true), 0);
      return () => clearTimeout(timer);
    }
  }, [hydrated]);

  const pageTitle = language === "zh" ? guideConfig.title.zh : guideConfig.title.en;
  const pageDescription =
    language === "zh" ? guideConfig.description.zh : guideConfig.description.en;

  const totalItems = guideConfig.categories.reduce(
    (acc, category) => acc + category.items.length,
    0
  );

  if (!guideConfig.enabled) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className={colors.textSecondary}>导航功能未启用</p>
      </div>
    );
  }

  return (
    <>
      <LoadingScreen />
      <PageTransition hydrated={hydrated} mounted={mounted} />
      <SEOHead
        title={pageTitle}
        description={pageDescription}
        url={`${process.env.NEXT_PUBLIC_SITE_URL || ""}/guide`}
      />
      <motion.div
        className={`min-h-screen ${colors.background} relative overflow-hidden`}
        initial={effectsEnabled ? "hidden" : false}
        animate={effectsEnabled ? "visible" : false}
        variants={effectsEnabled ? containerVariants : undefined}
      >
        <TopToolbar />
        <ParticleBackground theme={theme} />
        <DynamicLines theme={theme} />

        {effectsEnabled && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              className="absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl"
              style={{ backgroundColor: `${primaryColor}20` }}
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full blur-3xl"
              style={{ backgroundColor: `${primaryColor}15` }}
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
              className={`${colors.card} rounded-2xl overflow-hidden mb-8`}
              initial={effectsEnabled ? { opacity: 0, y: 20 } : false}
              animate={{ opacity: 1, y: 0 }}
              transition={effectsEnabled ? { delay: 0.1 } : { duration: 0 }}
            >
              <div className="px-6 sm:px-9 py-6">
                <div 
                  className="rounded-xl p-5 sm:p-6"
                  style={{ backgroundColor: primaryColor }}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <motion.div
                          variants={floatVariants}
                          animate={effectsEnabled ? "animate" : "static"}
                          className="relative inline-flex items-center justify-center w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm"
                        >
                          <Icon
                            icon="material-symbols:explore-rounded"
                            className="w-6 h-6 text-white"
                          />
                        </motion.div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-white drop-shadow-sm truncate">
                          {pageTitle}
                        </h1>
                      </div>
                      <p className="text-sm sm:text-base text-white/80 truncate">
                        {pageDescription}
                      </p>
                    </div>
                    <div className="shrink-0 text-center">
                      <span className="block text-2xl sm:text-3xl font-bold text-white drop-shadow-sm">
                        {totalItems}
                      </span>
                      <span className="block text-xs sm:text-sm text-white/70">
                        {language === "zh" ? "个资源" : "resources"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.header>

          {/* 内容区域 */}
          <motion.div
            initial={effectsEnabled ? { opacity: 0, y: 20 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={effectsEnabled ? { delay: 0.2 } : { duration: 0 }}
          >
            {guideConfig.categories.map((category, index) => (
              <GuideCategorySection
                key={category.id}
                category={category}
                index={index}
                isDark={theme === "dark"}
                language={language}
                primaryColor={primaryColor}
              />
            ))}
          </motion.div>

          {/* 底部提示 */}
          <motion.div
            className={`mt-6 text-center text-sm ${colors.textSecondary}`}
            initial={effectsEnabled ? { opacity: 0 } : false}
            animate={{ opacity: 1 }}
            transition={effectsEnabled ? { delay: 0.4 } : { duration: 0 }}
          >
            <p>
              {language === "zh"
                ? "点击卡片即可跳转到对应网站"
                : "Click cards to visit corresponding websites"}
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* 全局样式 */}
      <style jsx global>{`
        .guide-card {
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
      `}</style>
    </>
  );
}
