/**
 * Memo Card 组件
 * 支持 Markdown/HTML 渲染，图片使用 Lightbox
 */
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { useThemeStore } from "../../stores/theme-store";
import { formatRelativeTime, formatFullDate, getImageUrl, isImageAttachment } from "../../utils/memo";
import type { Memo } from "../../types/memo";

interface MemoCardProps {
  memo: Memo;
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
  if (count === 1) return "memo-images-single";
  if (count === 2) return "memo-images-double";
  if (count === 3) return "memo-images-triple";
  return "memo-images-grid";
};

function extractMarkdownImageUrls(content: string): string[] {
  const urls: string[] = [];
  const imageRegex = /!\[[^\]]*]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
  let match;

  while ((match = imageRegex.exec(content)) !== null) {
    urls.push(match[1]);
  }

  return urls;
}

function uniqueUrls(urls: string[]): string[] {
  return Array.from(new Set(urls.filter(Boolean)));
}

export default function MemoCard({
  memo,
  index,
  effectsEnabled,
  minutesAgo = "分钟前",
  hoursAgo = "小时前",
  daysAgo = "天前",
}: MemoCardProps) {
  const { theme } = useThemeStore();
  const isDark = theme === "dark";
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const relativeTime = formatRelativeTime(memo.createTime, minutesAgo, hoursAgo, daysAgo);
  const fullDate = formatFullDate(memo.createTime);

  // 过滤图片附件
  const imageAttachments = memo.attachments.filter(isImageAttachment);
  const attachmentImageUrls = imageAttachments.map((attachment) => getImageUrl(attachment));

  // 处理图片点击
  const handleImageClick = (imgIndex: number) => {
    setLightboxIndex(imgIndex);
    setLightboxOpen(true);
  };

  // 处理内容中的链接
  const processContent = (content: string) => {
    // 移除标签
    const processed = content.replace(/#[^\s#]+\s*/g, "").trim();
    return processed;
  };

  const processedContent = processContent(memo.content);
  const markdownImageUrls = extractMarkdownImageUrls(processedContent);
  const lightboxImageUrls = uniqueUrls([...markdownImageUrls, ...attachmentImageUrls]);
  const lightboxSlides = lightboxImageUrls.map((image) => ({ src: image }));

  const handleMarkdownImageClick = (imageUrl: string) => {
    const imageIndex = lightboxImageUrls.indexOf(imageUrl);
    if (imageIndex < 0) return;
    setLightboxIndex(imageIndex);
    setLightboxOpen(true);
  };

  return (
    <>
    <motion.div
      variants={effectsEnabled ? getCardVariants(index) : undefined}
      initial={effectsEnabled ? "hidden" : "visible"}
      animate="visible"
      className={`memo-card group relative rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
        isDark
          ? "bg-[#141824] border border-white/10 hover:border-white/20"
          : "bg-white border border-black/10 hover:border-black/20"
      } ${memo.pinned ? "ring-2 ring-purple-500/50" : ""}`}
    >
      {/* 置顶标记 */}
      {memo.pinned && (
        <div className="absolute top-3 right-3 z-10">
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-purple-500/20 text-purple-400 text-xs">
            <i className="fas fa-thumbtack"></i>
            <span>置顶</span>
          </span>
        </div>
      )}

      <div className="p-5">
        {/* 内容 - Markdown 渲染 */}
        <div
          className={`prose prose-sm max-w-none mb-3 ${
            isDark ? "prose-invert" : ""
          }`}
        >
          <ReactMarkdown
            components={{
              a: ({ node, ...props }) => (
                <a
                  {...props}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`break-all ${isDark ? "text-purple-400 hover:text-purple-300" : "text-purple-600 hover:text-purple-700"}`}
                />
              ),
              img: ({ node, src = "", alt = "", ...props }) => (
                <img
                  {...props}
                  src={src}
                  alt={alt}
                  className="cursor-pointer rounded-lg"
                  onClick={(event) => {
                    event.preventDefault();
                    if (typeof src === "string") {
                      handleMarkdownImageClick(src);
                    }
                  }}
                />
              ),
              code: ({ node, className, children, ...props }) => {
                const isInline = !className?.includes('language-');
                return isInline ? (
                  <code
                    className={`px-1.5 py-0.5 rounded text-sm ${
                      isDark ? "bg-white/10 text-white/90" : "bg-gray-100 text-gray-800"
                    }`}
                    {...props}
                  >
                    {children}
                  </code>
                ) : (
                  <pre
                    className={`p-3 rounded-lg overflow-x-auto text-sm ${
                      isDark ? "bg-white/5" : "bg-gray-50"
                    }`}
                  >
                    <code className={className} {...props}>{children}</code>
                  </pre>
                );
              },
            }}
          >
            {processedContent}
          </ReactMarkdown>
        </div>

        {/* 图片 */}
        {imageAttachments.length > 0 && (
          <div className={`memo-images grid gap-2 mb-3 ${getImageLayoutClass(imageAttachments.length)}`}>
            {imageAttachments.map((attachment, imgIndex) => {
              const imageUrl = getImageUrl(attachment);
              return (
                <div
                  key={attachment.name}
                  className="relative rounded-lg overflow-hidden aspect-square cursor-pointer bg-gray-100 dark:bg-gray-800"
                  onClick={() => handleImageClick(imgIndex)}
                >
                  <img
                    src={imageUrl}
                    alt={`memo image ${imgIndex + 1}`}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              );
            })}
          </div>
        )}

        {/* 标签 */}
        {memo.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {memo.tags.map((tag) => (
              <span
                key={tag}
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs ${
                  isDark
                    ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                    : "bg-purple-100 text-purple-700 border border-purple-200"
                }`}
              >
                <i className="fas fa-hashtag text-[10px]"></i>
                {tag}
              </span>
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
            <time dateTime={memo.createTime} title={fullDate}>
              {relativeTime}
            </time>
          </div>

          {memo.location && (
            <div className="flex items-center gap-1">
              <i className="fas fa-map-marker-alt text-xs"></i>
              <span className="truncate max-w-[150px]">{memo.location.placeholder}</span>
            </div>
          )}
        </div>
      </div>

      {/* 悬停渐变遮罩 */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-xl"></div>
    </motion.div>
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
