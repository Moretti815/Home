/**
 * TGTalk Card 组件
 * 支持 HTML 渲染，图片使用 Lightbox
 */
"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useThemeStore } from "../../stores/theme-store";
import { formatRelativeTime, formatFullDate, cleanContent, filterImages, ensureFullUrl } from "../../utils/tgtalk";
import type { TGTalkItem } from "../../types/tgtalk";

interface TGTalkCardProps {
  item: TGTalkItem;
  index: number;
  effectsEnabled: boolean;
  minutesAgo?: string;
  hoursAgo?: string;
  daysAgo?: string;
}

// 获取卡片动画配置
const getCardVariants = (index: number) => ({
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 15,
      delay: index * 0.05,
    },
  },
});

// 获取图片布局类名
const getImageLayoutClass = (count: number) => {
  if (count === 1) return "tgtalk-images-single";
  if (count === 2) return "tgtalk-images-double";
  if (count === 3) return "tgtalk-images-triple";
  return "tgtalk-images-grid";
};

export default function TGTalkCard({
  item,
  index,
  effectsEnabled,
  minutesAgo = "分钟前",
  hoursAgo = "小时前",
  daysAgo = "天前",
}: TGTalkCardProps) {
  const { theme } = useThemeStore();
  const isDark = theme === "dark";
  const [lightboxLoaded, setLightboxLoaded] = useState(false);

  const relativeTime = formatRelativeTime(item.time, minutesAgo, hoursAgo, daysAgo);
  const fullDate = formatFullDate(item.time);

  // 过滤图片
  const filteredImages = filterImages(item.image);

  // 加载 Lightbox
  useEffect(() => {
    if (typeof window === "undefined" || filteredImages.length === 0) return;

    const script = document.createElement("script");
    script.src = "https://cdn.jsdmirror.com/gh/Moretti815/blog@main/static/Lightbox/lightbox.js";
    script.async = true;
    script.onload = () => {
      setLightboxLoaded(true);
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [filteredImages.length]);

  // 处理图片点击
  const handleImageClick = (imageUrl: string, imgIndex: number) => {
    if (typeof window !== "undefined" && (window as unknown as { lightbox?: { open: (urls: string[], index: number) => void } }).lightbox) {
      const urls = filteredImages.map((img) => ensureFullUrl(img));
      (window as unknown as { lightbox: { open: (urls: string[], index: number) => void } }).lightbox.open(urls, imgIndex);
    }
  };

  // 清理后的内容
  const content = cleanContent(item.text);

  return (
    <motion.div
      variants={effectsEnabled ? getCardVariants(index) : undefined}
      initial={effectsEnabled ? "hidden" : false}
      animate={effectsEnabled ? "visible" : false}
      className={`tgtalk-card group relative rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
        isDark
          ? "bg-[#141824] border border-white/10 hover:border-white/20"
          : "bg-white border border-black/10 hover:border-black/20"
      }`}
    >
      <div className="p-5">
        {/* 内容 - HTML 渲染 */}
        <div
          className={`prose prose-sm max-w-none mb-3 ${
            isDark ? "prose-invert" : ""
          }`}
          dangerouslySetInnerHTML={{ __html: content }}
        />

        {/* 图片 */}
        {filteredImages.length > 0 && (
          <div className={`tgtalk-images grid gap-2 mb-3 ${getImageLayoutClass(filteredImages.length)}`}>
            {filteredImages.map((imageUrl, imgIndex) => (
              <div
                key={imgIndex}
                className="relative rounded-lg overflow-hidden aspect-square cursor-pointer bg-gray-100 dark:bg-gray-800"
                onClick={() => handleImageClick(imageUrl, imgIndex)}
              >
                <img
                  src={ensureFullUrl(imageUrl)}
                  alt={`image ${imgIndex + 1}`}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  loading="lazy"
                  decoding="async"
                />
                {!lightboxLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <i className="fas fa-spinner fa-spin text-gray-400"></i>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* 分割线 */}
        <hr className={`border-t my-3 ${isDark ? "border-white/5" : "border-black/5"}`} />

        {/* 底部信息 */}
        <div
          className={`flex items-center justify-between text-xs flex-wrap gap-2 ${
            isDark ? "text-white/50" : "text-black/50"
          }`}
        >
          <div className="flex items-center gap-1.5">
            <i className="fas fa-clock text-xs"></i>
            <time dateTime={new Date(item.time).toISOString()} title={fullDate}>
              {relativeTime}
            </time>
          </div>

          <div className="flex items-center gap-1">
            <i className="fas fa-eye text-xs"></i>
            <span>{item.views}</span>
          </div>
        </div>
      </div>

      {/* 悬停渐变遮罩 */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-xl"></div>
    </motion.div>
  );
}
