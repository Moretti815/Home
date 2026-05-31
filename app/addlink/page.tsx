/**
 * 友链申请页面
 * 展示友链申请说明和要求
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
import { siteConfig } from "../site-config";

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

// 申请流程步骤
const flowSteps = [
  {
    number: "01",
    title: "确认要求",
    description: "确认贵站符合基本要求，并先添加本站友链。",
  },
  {
    number: "02",
    title: "整理信息",
    description: "按照申请格式整理站点信息，尽量提供稳定可访问的图片链接。",
  },
  {
    number: "03",
    title: "提交申请",
    description: "通过邮件或社交媒体提交申请，审核通过后我会添加并回复。",
  },
];

// 友链要求
const requirements = [
  {
    title: "站点定位",
    content: "优先接受个人博客、技术笔记、生活记录、开源项目主页等非强商业化站点；暂不接受纯广告、采集、营销或跳转聚合站。",
  },
  {
    title: "内容质量",
    content: "希望站点有稳定且真实的内容输出，原创或认真整理的内容均可；请避免整站搬运、AI 批量灌水和严重同质化内容。",
  },
  {
    title: "合规底线",
    content: "站点不得包含违法违规、色情、赌博、暴力、诈骗、恶意下载、侵权盗版等内容。",
  },
  {
    title: "访问体验",
    content: "站点应能稳定访问，并尽量保证国内访问体验。少量广告可以理解，但请不要出现遮挡内容、强制跳转或影响阅读的弹窗。",
  },
  {
    title: "安全与证书",
    content: "建议启用 HTTPS，并保持证书有效。如果站点连续一周无法访问，或证书长期异常，我可能会暂时下架友链。",
  },
  {
    title: "互惠原则",
    content: "申请前请尽量先添加本站友链，或在留言中说明预计添加时间。一般不接受长期单向友链。",
  },
  {
    title: "更新与维护",
    content: "建议站点仍在维护中。若长期停止更新也没关系，但希望页面、链接和基础信息保持可用。",
  },
  {
    title: "文章数量",
    content: "直接申请建议已有 10 篇以上文章；如果我们已经有过多次互动，或站点质量较高，这条可以适当放宽。",
  },
];

// 域名说明
const domainNotes = [
  {
    title: "付费域名",
    content: "常见顶级域名如 .com、.cn、.net、.org、.fun、.top 等均可。",
  },
  {
    title: "可信免费域名",
    content: "github.io、eu.org、Cloudflare Pages 等可接受，前提是内容稳定合规。",
  },
  {
    title: "小众二级分发域名",
    content: "来自不知名分发服务的二级域名需要额外审核，主要考虑稳定性和安全风险。",
  },
  {
    title: "暂不接受",
    content: "暂不接受访问异常、被墙严重、存在明显安全风险或频繁变更的域名。",
  },
];

export default function AddLinkPage() {
  const { t } = useTranslation();
  const { hydrated, hydrate, language } = useLanguageStore();
  const { theme } = useThemeStore();
  const { effectsEnabled } = useEffectsStore();
  const colors = usePageColors();
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);
  const isDark = theme === "dark";

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://your-site.com";
  const siteInfo = siteConfig;

  // 本站信息代码块
  const siteInfoCode = `name: ${siteInfo.name}
link: ${siteUrl}
avatar: ${siteUrl}/avatar.png
descr: ${siteInfo.description}
siteshot: ${siteUrl}/siteshot.png
atom: ${siteUrl}/atom.xml`;

  useEffect(() => {
    hydrate();
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, [hydrate]);

  const handleCopy = () => {
    navigator.clipboard.writeText(siteInfoCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const pageTitle = language === "zh" ? "友链申请" : "Apply Friend Link";
  const pageSubtitle =
    language === "zh"
      ? "想交换友链？请先阅读下面的申请说明"
      : "Want to exchange links? Please read the application guidelines first";

  return (
    <>
      <LoadingScreen />
      <PageTransition hydrated={hydrated} mounted={mounted} />
      <SEOHead
        title={pageTitle}
        description={pageSubtitle}
        url={`${siteUrl}/addlink`}
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
                    backgroundColor: "#3271AE",
                    boxShadow: "0 10px 25px -5px rgba(50, 113, 174, 0.4)",
                  }}
                >
                  <i className="fas fa-handshake text-white text-2xl"></i>
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
                          ? "text-white/60 hover:text-white"
                          : "text-gray-600 hover:text-gray-900"
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
                    <span
                      className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                        isDark
                          ? "bg-violet-500 text-white shadow-lg"
                          : "bg-white text-violet-600 shadow-sm"
                      }`}
                    >
                      <i className="fas fa-plus mr-2"></i>
                      {language === "zh" ? "申请" : "Apply"}
                    </span>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </motion.header>

          {/* 内容区域 */}
          <motion.div
            className="space-y-8"
            variants={effectsEnabled ? containerVariants : undefined}
          >
            {/* 申请流程 */}
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
                  style={{ backgroundColor: "rgba(50, 113, 174, 0.1)" }}
                >
                  <i
                    className="fas fa-stream text-lg"
                    style={{ color: "#3271AE" }}
                  ></i>
                </div>
                <h2
                  className={`text-xl font-bold ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  {language === "zh" ? "申请流程" : "Application Process"}
                </h2>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {flowSteps.map((step, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-xl ${
                      isDark ? "bg-white/5" : "bg-gray-50"
                    }`}
                  >
                    <div
                      className="text-3xl font-bold mb-2"
                      style={{ color: "#3271AE" }}
                    >
                      {step.number}
                    </div>
                    <h3
                      className={`font-semibold mb-1 ${
                        isDark ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {step.title}
                    </h3>
                    <p
                      className={`text-sm ${
                        isDark ? "text-white/50" : "text-gray-500"
                      }`}
                    >
                      {step.description}
                    </p>
                  </div>
                ))}
              </div>
            </motion.section>

            {/* 友链要求 */}
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
                  style={{ backgroundColor: "rgba(50, 113, 174, 0.1)" }}
                >
                  <i
                    className="fas fa-clipboard-check text-lg"
                    style={{ color: "#3271AE" }}
                  ></i>
                </div>
                <h2
                  className={`text-xl font-bold ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  {language === "zh" ? "友链要求" : "Requirements"}
                </h2>
              </div>

              <div className="space-y-4">
                {requirements.map((req, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-xl ${
                      isDark ? "bg-white/5" : "bg-gray-50"
                    }`}
                  >
                    <h3
                      className={`font-semibold mb-2 ${
                        isDark ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {req.title}
                    </h3>
                    <p
                      className={`text-sm ${
                        isDark ? "text-white/60" : "text-gray-600"
                      }`}
                    >
                      {req.content}
                    </p>
                  </div>
                ))}
              </div>
            </motion.section>

            {/* 域名说明 */}
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
                  style={{ backgroundColor: "rgba(50, 113, 174, 0.1)" }}
                >
                  <i
                    className="fas fa-globe text-lg"
                    style={{ color: "#3271AE" }}
                  ></i>
                </div>
                <h2
                  className={`text-xl font-bold ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  {language === "zh" ? "域名说明" : "Domain Guidelines"}
                </h2>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {domainNotes.map((note, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-xl ${
                      isDark ? "bg-white/5" : "bg-gray-50"
                    }`}
                  >
                    <h3
                      className={`font-semibold mb-2 ${
                        isDark ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {note.title}
                    </h3>
                    <p
                      className={`text-sm ${
                        isDark ? "text-white/60" : "text-gray-600"
                      }`}
                    >
                      {note.content}
                    </p>
                  </div>
                ))}
              </div>
            </motion.section>

            {/* 本站信息 */}
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
                  style={{ backgroundColor: "rgba(50, 113, 174, 0.1)" }}
                >
                  <i
                    className="fas fa-info-circle text-lg"
                    style={{ color: "#3271AE" }}
                  ></i>
                </div>
                <h2
                  className={`text-xl font-bold ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  {language === "zh" ? "本站信息" : "My Site Info"}
                </h2>
              </div>

              <p
                className={`text-sm mb-4 ${
                  isDark ? "text-white/60" : "text-gray-600"
                }`}
              >
                {language === "zh"
                  ? "如果您愿意在贵站添加本站，可以直接使用下面的信息："
                  : "If you'd like to add my site to yours, you can use the following info:"}
              </p>

              <div className="relative">
                <pre
                  className={`p-4 rounded-xl text-sm overflow-x-auto ${
                    isDark
                      ? "bg-black/30 text-white/80"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  <code>{siteInfoCode}</code>
                </pre>
                <button
                  onClick={handleCopy}
                  className={`absolute top-2 right-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    copied
                      ? "bg-green-500 text-white"
                      : isDark
                      ? "bg-white/10 text-white/70 hover:bg-white/20"
                      : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                  }`}
                >
                  <i className={`fas ${copied ? "fa-check" : "fa-copy"} mr-1`}></i>
                  {copied
                    ? language === "zh"
                      ? "已复制"
                      : "Copied"
                    : language === "zh"
                    ? "复制"
                    : "Copy"}
                </button>
              </div>

              <div className="mt-4 p-4 rounded-xl bg-violet-500/10 border border-violet-500/20">
                <p
                  className={`text-sm ${
                    isDark ? "text-violet-300" : "text-violet-600"
                  }`}
                >
                  <i className="fas fa-lightbulb mr-2"></i>
                  {language === "zh"
                    ? "siteshot 和 atom 为可选项。若未提供站点截图，本站会尝试使用截图服务自动生成。"
                    : "siteshot and atom are optional. If not provided, we'll try to generate them automatically."}
                </p>
              </div>
            </motion.section>

            {/* 申请格式 */}
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
                  style={{ backgroundColor: "rgba(50, 113, 174, 0.1)" }}
                >
                  <i
                    className="fas fa-edit text-lg"
                    style={{ color: "#3271AE" }}
                  ></i>
                </div>
                <h2
                  className={`text-xl font-bold ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  {language === "zh" ? "申请格式" : "Application Format"}
                </h2>
              </div>

              <p
                className={`text-sm mb-4 ${
                  isDark ? "text-white/60" : "text-gray-600"
                }`}
              >
                {language === "zh"
                  ? "请按如下格式提交信息，字段越完整越方便审核："
                  : "Please submit your info in the following format:"}
              </p>

              <div
                className={`p-4 rounded-xl ${
                  isDark ? "bg-white/5" : "bg-gray-50"
                }`}
              >
                <div className="space-y-2 text-sm">
                  <div className="flex gap-2">
                    <span
                      className={`font-mono ${
                        isDark ? "text-violet-400" : "text-violet-600"
                      }`}
                    >
                      name:
                    </span>
                    <span className={isDark ? "text-white/70" : "text-gray-600"}>
                      {language === "zh" ? "站点名称" : "Site name"}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <span
                      className={`font-mono ${
                        isDark ? "text-violet-400" : "text-violet-600"
                      }`}
                    >
                      link:
                    </span>
                    <span className={isDark ? "text-white/70" : "text-gray-600"}>
                      {language === "zh" ? "站点地址" : "Site URL"}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <span
                      className={`font-mono ${
                        isDark ? "text-violet-400" : "text-violet-600"
                      }`}
                    >
                      avatar:
                    </span>
                    <span className={isDark ? "text-white/70" : "text-gray-600"}>
                      {language === "zh" ? "头像地址" : "Avatar URL"}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <span
                      className={`font-mono ${
                        isDark ? "text-violet-400" : "text-violet-600"
                      }`}
                    >
                      descr:
                    </span>
                    <span className={isDark ? "text-white/70" : "text-gray-600"}>
                      {language === "zh" ? "一句话描述" : "Description"}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <span
                      className={`font-mono ${
                        isDark ? "text-violet-400" : "text-violet-600"
                      }`}
                    >
                      siteshot:
                    </span>
                    <span className={isDark ? "text-white/70" : "text-gray-600"}>
                      {language === "zh"
                        ? "站点截图（可选）"
                        : "Screenshot (optional)"}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <span
                      className={`font-mono ${
                        isDark ? "text-violet-400" : "text-violet-600"
                      }`}
                    >
                      atom:
                    </span>
                    <span className={isDark ? "text-white/70" : "text-gray-600"}>
                      {language === "zh"
                        ? "RSS / Atom 订阅地址（可选）"
                        : "RSS / Atom feed (optional)"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-500/20">
                <p
                  className={`text-sm ${
                    isDark ? "text-white/70" : "text-gray-600"
                  }`}
                >
                  <i
                    className="fas fa-heart mr-2"
                    style={{ color: "#3271AE" }}
                  ></i>
                  {language === "zh"
                    ? "友链的重点是「友」，如果我们已经常有互动，规则可以更灵活一点。"
                    : "The key is 'friend'. If we already interact often, rules can be more flexible."}
                </p>
              </div>
            </motion.section>

            {/* 联系方式 */}
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
                  {language === "zh" ? "准备好申请了吗？" : "Ready to apply?"}
                </h2>
                <p
                  className={`text-sm mb-6 ${
                    isDark ? "text-white/60" : "text-gray-600"
                  }`}
                >
                  {language === "zh"
                    ? "您可以通过以下方式提交友链申请"
                    : "You can submit your application via:"}
                </p>

                <div className="flex flex-wrap justify-center gap-3">
                  <a
                    href="mailto:your-email@example.com?subject=友链申请"
                    className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                      isDark
                        ? "bg-violet-500 text-white hover:bg-violet-600"
                        : "bg-violet-500 text-white hover:bg-violet-600"
                    }`}
                    style={{ boxShadow: "0 10px 25px -5px rgba(139, 92, 246, 0.4)" }}
                  >
                    <i className="fas fa-envelope"></i>
                    {language === "zh" ? "发送邮件" : "Send Email"}
                  </a>
                  <a
                    href="https://github.com/your-username"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                      isDark
                        ? "bg-white/10 text-white hover:bg-white/20 border border-white/10"
                        : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                    }`}
                  >
                    <i className="fab fa-github"></i>
                    GitHub
                  </a>
                  <a
                    href="https://twitter.com/your-username"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                      isDark
                        ? "bg-white/10 text-white hover:bg-white/20 border border-white/10"
                        : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                    }`}
                  >
                    <i className="fab fa-twitter"></i>
                    Twitter
                  </a>
                </div>
              </div>
            </motion.section>
          </motion.div>
        </div>
      </motion.div>
    </>
  );
}
