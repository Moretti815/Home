/**
 * 赞助页面
 * 展示收款二维码和赞助者列表
 * 支持响应式布局和主题切换
 */

"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
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
      staggerChildren: 0.1,
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

// 赞助者数据接口
interface Sponsor {
  name: string;
  message: string;
  amount: string;
  date: string;
  avatar?: string;
}

// 默认赞助者数据
const defaultSponsors: Sponsor[] = [
  {
    name: "不知姓名的朋友",
    message: "添加介绍",
    amount: "¥8.88",
    date: "2026-04-14",
  },
];

export default function RewardPage() {
  const { t } = useTranslation();
  const { hydrated, hydrate, language } = useLanguageStore();
  const { theme } = useThemeStore();
  const { effectsEnabled } = useEffectsStore();
  const colors = usePageColors();
  const [mounted, setMounted] = useState(false);
  const [activeQR, setActiveQR] = useState<"alipay" | "wechat" | null>(null);
  const [sponsors, setSponsors] = useState<Sponsor[]>(defaultSponsors);
  const [sponsorsEnabled, setSponsorsEnabled] = useState(true);
  const isDark = theme === "dark";

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://your-site.com";

  // 获取配置中的赞助者数据
  useEffect(() => {
    const fetchSponsors = async () => {
      try {
        const response = await fetch('/api/config');
        const data = await response.json();
        if (data.config?.sponsors) {
          setSponsorsEnabled(data.config.sponsors.enabled !== false);
          if (data.config.sponsors.list && data.config.sponsors.list.length > 0) {
            setSponsors(data.config.sponsors.list);
          }
        }
      } catch (error) {
        console.error('Failed to fetch sponsors:', error);
      }
    };
    
    fetchSponsors();
  }, []);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (hydrated) {
      const timer = setTimeout(() => setMounted(true), 0);
      return () => clearTimeout(timer);
    }
  }, [hydrated]);

  const pageTitle = language === "zh" ? "支持作者" : "Support Author";
  const pageSubtitle =
    language === "zh"
      ? "如果这里的内容曾让你有所收获，欢迎以一杯咖啡的方式说声谢谢"
      : "If my content has helped you, consider buying me a coffee";

  // 计算统计数据
  const totalAmount = sponsors.reduce((sum, s) => {
    const num = parseFloat(s.amount.replace(/[¥,]/g, ""));
    return sum + num;
  }, 0);

  return (
    <>
      <LoadingScreen />
      <PageTransition hydrated={hydrated} mounted={mounted} />
      <SEOHead
        title={pageTitle}
        description={pageSubtitle}
        url={`${siteUrl}/reward`}
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

        <div className="max-w-4xl mx-auto px-4 py-8 relative z-10">
          {/* 页面头部 */}
          <motion.header className="mb-10">
            <PageNav
              cardClass={colors.card}
              textClass={colors.text}
              hoverClass="hover:bg-violet-500/10"
            />

            {/* Hero 区域 */}
            <motion.div
              className={`rounded-3xl p-8 sm:p-12 mb-8 relative overflow-hidden ${
                isDark ? "bg-[#141824]/50" : "bg-white/50"
              } backdrop-blur-sm border ${
                isDark ? "border-white/5" : "border-gray-200"
              }`}
              initial={effectsEnabled ? { opacity: 0, y: 20 } : false}
              animate={{ opacity: 1, y: 0 }}
              transition={effectsEnabled ? { delay: 0.1 } : { duration: 0 }}
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
                    isDark ? "bg-pink-500/10" : "bg-pink-300/20"
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
                    background: "linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)",
                    boxShadow: "0 10px 25px -5px rgba(255, 107, 107, 0.4)",
                  }}
                >
                  <i className="fas fa-heart text-white text-2xl"></i>
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

                {/* 统计数据 */}
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
                    <i className="fas fa-users mr-2"></i>
                    {sponsors.length} {language === "zh" ? "位支持者" : "supporters"}
                  </span>
                  <span
                    className={`px-4 py-1.5 rounded-full text-sm ${
                      isDark
                        ? "bg-violet-500/20 text-violet-300"
                        : "bg-violet-100 text-violet-600"
                    }`}
                  >
                    <i className="fas fa-coins mr-2"></i>
                    {language === "zh" ? "累计" : "Total"} ¥{totalAmount.toFixed(2)}
                  </span>
                </motion.div>
              </div>
            </motion.div>
          </motion.header>

          {/* 内容区域 */}
          <motion.div
            className="space-y-8"
            variants={effectsEnabled ? containerVariants : undefined}
          >
            {/* 收款二维码 */}
            <motion.section
              variants={effectsEnabled ? cardVariants : undefined}
              className={`rounded-2xl p-6 sm:p-8 ${
                isDark
                  ? "bg-[#141824] border border-white/5"
                  : "bg-white border border-gray-200"
              }`}
            >
              <div className="flex items-center gap-3 mb-6">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: "rgba(255, 107, 107, 0.1)" }}
                >
                  <i
                    className="fas fa-qrcode text-lg"
                    style={{ color: "#FF6B6B" }}
                  ></i>
                </div>
                <h2
                  className={`text-xl font-bold ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  {language === "zh" ? "扫码支持" : "Scan to Support"}
                </h2>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                {/* 支付宝 */}
                <motion.div
                  className={`relative p-6 rounded-2xl text-center cursor-pointer transition-all ${
                    isDark
                      ? "bg-white/5 hover:bg-white/10"
                      : "bg-gray-50 hover:bg-gray-100"
                  } ${activeQR === "alipay" ? "ring-2 ring-blue-500" : ""}`}
                  onClick={() =>
                    setActiveQR(activeQR === "alipay" ? null : "alipay")
                  }
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <i
                      className="fab fa-alipay text-2xl"
                      style={{ color: "#1677FF" }}
                    ></i>
                    <span
                      className={`font-semibold ${
                        isDark ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {language === "zh" ? "支付宝" : "Alipay"}
                    </span>
                  </div>
                  <div
                    className={`relative w-48 h-48 mx-auto rounded-xl overflow-hidden ${
                      isDark ? "bg-white" : "bg-white"
                    }`}
                  >
                    <Image
                      src="/reward/alipay.avif"
                      alt="Alipay QR Code"
                      fill
                      className="object-contain p-2"
                    />
                  </div>
                  <p
                    className={`mt-4 text-sm ${
                      isDark ? "text-white/50" : "text-gray-500"
                    }`}
                  >
                    {language === "zh" ? "点击放大查看" : "Tap to enlarge"}
                  </p>
                </motion.div>

                {/* 微信 */}
                <motion.div
                  className={`relative p-6 rounded-2xl text-center cursor-pointer transition-all ${
                    isDark
                      ? "bg-white/5 hover:bg-white/10"
                      : "bg-gray-50 hover:bg-gray-100"
                  } ${activeQR === "wechat" ? "ring-2 ring-green-500" : ""}`}
                  onClick={() =>
                    setActiveQR(activeQR === "wechat" ? null : "wechat")
                  }
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <i
                      className="fab fa-weixin text-2xl"
                      style={{ color: "#07C160" }}
                    ></i>
                    <span
                      className={`font-semibold ${
                        isDark ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {language === "zh" ? "微信支付" : "WeChat Pay"}
                    </span>
                  </div>
                  <div
                    className={`relative w-48 h-48 mx-auto rounded-xl overflow-hidden ${
                      isDark ? "bg-white" : "bg-white"
                    }`}
                  >
                    <Image
                      src="/reward/weixin.avif"
                      alt="WeChat QR Code"
                      fill
                      className="object-contain p-2"
                    />
                  </div>
                  <p
                    className={`mt-4 text-sm ${
                      isDark ? "text-white/50" : "text-gray-500"
                    }`}
                  >
                    {language === "zh" ? "点击放大查看" : "Tap to enlarge"}
                  </p>
                </motion.div>
              </div>

              <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-500/20 text-center">
                <p
                  className={`text-sm ${
                    isDark ? "text-violet-300" : "text-violet-600"
                  }`}
                >
                  <i className="fas fa-gift mr-2"></i>
                  {language === "zh"
                    ? "你的每一份支持都是对我的莫大鼓励"
                    : "Every donation is greatly appreciated"}
                </p>
              </div>
            </motion.section>

            {/* 赞助者列表 */}
            {sponsorsEnabled && (
              <motion.section
                variants={effectsEnabled ? cardVariants : undefined}
                className={`rounded-2xl p-6 sm:p-8 ${
                  isDark
                    ? "bg-[#141824] border border-white/5"
                    : "bg-white border border-gray-200"
                }`}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: "rgba(255, 107, 107, 0.1)" }}
                  >
                    <i
                      className="fas fa-hand-holding-heart text-lg"
                      style={{ color: "#FF6B6B" }}
                    ></i>
                  </div>
                  <h2
                    className={`text-xl font-bold ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {language === "zh" ? "赞助者名单" : "Sponsors"}
                  </h2>
                </div>

                <div className="space-y-3">
                  {sponsors.map((sponsor, index) => (
                    <motion.div
                      key={index}
                      initial={effectsEnabled ? { opacity: 0, x: -20 } : false}
                      animate={{ opacity: 1, x: 0 }}
                      transition={
                        effectsEnabled
                          ? { delay: index * 0.05 }
                          : { duration: 0 }
                      }
                      className={`p-4 rounded-xl flex items-start gap-4 ${
                        isDark ? "bg-white/5" : "bg-gray-50"
                      }`}
                    >
                      {/* 头像 */}
                      {sponsor.avatar ? (
                        <img
                          src={sponsor.avatar}
                          alt={sponsor.name}
                          className="w-10 h-10 rounded-full object-cover shrink-0"
                        />
                      ) : (
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                            isDark ? "bg-violet-500/20" : "bg-violet-100"
                          }`}
                        >
                          <span className="text-sm font-bold text-violet-500">
                            {sponsor.name.charAt(0)}
                          </span>
                        </div>
                      )}

                      {/* 信息 */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <h3
                            className={`font-semibold truncate ${
                              isDark ? "text-white" : "text-gray-900"
                            }`}
                          >
                            {sponsor.name}
                          </h3>
                          <span
                            className={`text-sm font-mono shrink-0 ${
                              isDark ? "text-violet-400" : "text-violet-600"
                            }`}
                          >
                            {sponsor.amount}
                          </span>
                        </div>
                        <p
                          className={`text-sm truncate ${
                            isDark ? "text-white/50" : "text-gray-500"
                          }`}
                        >
                          {sponsor.message}
                        </p>
                        <p
                          className={`text-xs mt-1 ${
                            isDark ? "text-white/30" : "text-gray-400"
                          }`}
                        >
                          {sponsor.date}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* 统计汇总 */}
                <div
                  className={`mt-6 pt-6 border-t ${
                    isDark ? "border-white/10" : "border-gray-200"
                  }`}
                >
                  <div className="flex items-center justify-between text-sm">
                    <span className={isDark ? "text-white/50" : "text-gray-500"}>
                      {language === "zh"
                        ? `共计 ${sponsors.length} 笔打款`
                        : `${sponsors.length} donations`}
                    </span>
                    <span
                      className={`font-semibold ${
                        isDark ? "text-violet-400" : "text-violet-600"
                      }`}
                    >
                      {language === "zh" ? "累计金额" : "Total"} ¥
                      {totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>
              </motion.section>
            )}

            {/* 其他支持方式 */}
            <motion.section
              variants={effectsEnabled ? cardVariants : undefined}
              className={`rounded-2xl p-6 sm:p-8 ${
                isDark
                  ? "bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-500/20"
                  : "bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-200"
              }`}
            >
              <div className="text-center">
                <h2
                  className={`text-xl font-bold mb-4 ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  {language === "zh" ? "其他支持方式" : "Other Ways to Support"}
                </h2>
                <p
                  className={`text-sm mb-6 ${
                    isDark ? "text-white/60" : "text-gray-600"
                  }`}
                >
                  {language === "zh"
                    ? "除了打赏，你还可以通过以下方式支持我"
                    : "Besides donations, you can also support me by:"}
                </p>

                <div className="grid gap-3 sm:grid-cols-3">
                  <a
                    href="https://github.com/your-username"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`p-4 rounded-xl text-center transition-all ${
                      isDark
                        ? "bg-white/5 hover:bg-white/10"
                        : "bg-white hover:bg-gray-50"
                    }`}
                  >
                    <i className="fab fa-github text-2xl mb-2 text-gray-700"></i>
                    <p
                      className={`text-sm font-medium ${
                        isDark ? "text-white" : "text-gray-900"
                      }`}
                    >
                      Star
                    </p>
                    <p
                      className={`text-xs ${
                        isDark ? "text-white/50" : "text-gray-500"
                      }`}
                    >
                      {language === "zh" ? "给项目点星" : "Star my repos"}
                    </p>
                  </a>

                  <a
                    href="https://twitter.com/your-username"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`p-4 rounded-xl text-center transition-all ${
                      isDark
                        ? "bg-white/5 hover:bg-white/10"
                        : "bg-white hover:bg-gray-50"
                    }`}
                  >
                    <i className="fab fa-twitter text-2xl mb-2 text-blue-400"></i>
                    <p
                      className={`text-sm font-medium ${
                        isDark ? "text-white" : "text-gray-900"
                      }`}
                    >
                      Follow
                    </p>
                    <p
                      className={`text-xs ${
                        isDark ? "text-white/50" : "text-gray-500"
                      }`}
                    >
                      {language === "zh" ? "关注我的动态" : "Follow me"}
                    </p>
                  </a>

                  <a
                    href="/friends"
                    className={`p-4 rounded-xl text-center transition-all ${
                      isDark
                        ? "bg-white/5 hover:bg-white/10"
                        : "bg-white hover:bg-gray-50"
                    }`}
                  >
                    <i className="fas fa-link text-2xl mb-2 text-violet-500"></i>
                    <p
                      className={`text-sm font-medium ${
                        isDark ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {language === "zh" ? "友链" : "Links"}
                    </p>
                    <p
                      className={`text-xs ${
                        isDark ? "text-white/50" : "text-gray-500"
                      }`}
                    >
                      {language === "zh" ? "交换友情链接" : "Link exchange"}
                    </p>
                  </a>
                </div>
              </div>
            </motion.section>
          </motion.div>
        </div>

        {/* 二维码放大弹窗 */}
        {activeQR && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setActiveQR(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={`relative p-6 rounded-2xl max-w-sm w-full ${
                isDark ? "bg-[#141824]" : "bg-white"
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setActiveQR(null)}
                className={`absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                  isDark
                    ? "bg-white/10 text-white/70 hover:bg-white/20"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
              >
                <i className="fas fa-times"></i>
              </button>

              <h3
                className={`text-lg font-bold text-center mb-4 ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                {activeQR === "alipay"
                  ? language === "zh"
                    ? "支付宝扫一扫"
                    : "Scan with Alipay"
                  : language === "zh"
                  ? "微信扫一扫"
                  : "Scan with WeChat"}
              </h3>

              <div className="relative w-64 h-64 mx-auto rounded-xl overflow-hidden bg-white">
                <Image
                  src={
                    activeQR === "alipay"
                      ? "/reward/alipay.avif"
                      : "/reward/weixin.avif"
                  }
                  alt="QR Code"
                  fill
                  className="object-contain p-4"
                />
              </div>

              <p
                className={`text-sm text-center mt-4 ${
                  isDark ? "text-white/50" : "text-gray-500"
                }`}
              >
                {language === "zh"
                  ? "长按识别二维码"
                  : "Long press to scan"}
              </p>
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </>
  );
}
