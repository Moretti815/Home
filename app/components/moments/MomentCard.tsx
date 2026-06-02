/**
 * 说说卡片组件
 * 参考 Mizuki 的 MomentCard.astro 样式
 */
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { useThemeStore } from "../../stores/theme-store";
import { formatRelativeTime, formatFullDate } from "../../utils/moment";
import type { Moment } from "../../types/moment";

interface MomentCardProps {
  moment: Moment;
  index: number;
  effectsEnabled: boolean;
  minutesAgo?: string;
  hoursAgo?: string;
  daysAgo?: string;
}

// 获取卡片动画配置（使用 index 参数）
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

export default function MomentCard({
  moment,
  index,
  effectsEnabled,
  minutesAgo = "分钟前",
  hoursAgo = "小时前",
  daysAgo = "天前",
}: MomentCardProps) {
  const { theme } = useThemeStore();
  const isDark = theme === "dark";
  const cardVariants = getCardVariants(index);

  // Lightbox 状态
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const relativeTime = formatRelativeTime(moment.date, minutesAgo, hoursAgo, daysAgo);
  const fullDate = formatFullDate(moment.date);

  // 获取图片布局类名
  const getImageLayoutClass = (count: number) => {
    if (count === 1) return "moment-images-single";
    if (count === 2) return "moment-images-double";
    if (count === 3) return "moment-images-triple";
    return "moment-images-grid";
  };

  // 打开 Lightbox
  const openLightbox = (imgIndex: number) => {
    setLightboxIndex(imgIndex);
    setLightboxOpen(true);
  };

  // 准备 Lightbox 图片数据
  const lightboxSlides = moment.images?.map((image) => ({ src: image })) || [];

  return (
    <>
      <motion.div
        variants={effectsEnabled ? cardVariants : undefined}
        initial={effectsEnabled ? "hidden" : false}
        animate={effectsEnabled ? "visible" : false}
        className={`moment-card group relative rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
          isDark
            ? "bg-[#141824] border border-white/10 hover:border-white/20"
            : "bg-white border border-black/10 hover:border-black/20"
        }`}
        style={{
          animationDelay: `${index * 0.05}s`,
        }}
      >
        <div className="p-5">
          {/* 内容 */}
          <p
            className={`text-sm md:text-base leading-relaxed mb-3 whitespace-pre-wrap ${
              isDark ? "text-white/90" : "text-black/90"
            }`}
          >
            {moment.content}
          </p>

          {/* 图片 */}
          {moment.images && moment.images.length > 0 && (
            <div
              className={`moment-images grid gap-2 mb-3 ${getImageLayoutClass(
                moment.images.length
              )}`}
            >
              {moment.images.map((image, imgIndex) => (
                <div
                  key={imgIndex}
                  className="relative rounded-lg overflow-hidden aspect-square cursor-pointer"
                  onClick={() => openLightbox(imgIndex)}
                >
                  <Image
                    src={image}
                    alt={`moment image ${imgIndex + 1}`}
                    fill
                    className="object-cover transition-transform duration-300 hover:scale-105"
                    unoptimized
                  />
                </div>
              ))}
            </div>
          )}

          {/* 分割线 */}
          <hr
            className={`border-t my-3 ${
              isDark ? "border-white/5" : "border-black/5"
            }`}
          />

          {/* 底部信息 */}
          <div
            className={`flex items-center justify-between text-xs flex-wrap gap-2 ${
              isDark ? "text-white/50" : "text-black/50"
            }`}
          >
            <div className="flex items-center gap-1.5">
              <i className="fas fa-clock text-xs"></i>
              <time dateTime={moment.date} title={fullDate}>
                {relativeTime}
              </time>
            </div>

            <a
              href={moment.link}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-1 transition-colors ${
                isDark
                  ? "text-white/50 hover:text-white/80"
                  : "text-black/50 hover:text-black/80"
              }`}
            >
              <i className="fas fa-external-link-alt text-xs"></i>
              <span>查看原文</span>
            </a>
          </div>
        </div>

        {/* 悬停渐变遮罩 */}
        <div
          className={`absolute inset-0 bg-gradient-to-br from-pink-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-xl`}
        ></div>
      </motion.div>

      {/* Lightbox 灯箱 */}
      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        slides={lightboxSlides}
        index={lightboxIndex}
        carousel={{ finite: lightboxSlides.length <= 1 }}
        render={{ buttonPrev: lightboxSlides.length <= 1 ? () => null : undefined, buttonNext: lightboxSlides.length <= 1 ? () => null : undefined }}
      />
    </>
  );
}
