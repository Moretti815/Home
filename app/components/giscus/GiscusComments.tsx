/**
 * Giscus 评论组件
 * 使用 GitHub Discussions 作为评论系统
 * 支持明暗模式切换
 */
"use client";

import { useEffect, useRef, useState } from "react";
import { useThemeStore } from "../../stores/theme-store";

interface GiscusCommentsProps {
  repo?: string;
  repoId?: string;
  category?: string;
  categoryId?: string;
}

export default function GiscusComments({
  repo = "Moretti815/Home",
  repoId = "R_kgDOSpV2uQ",
  category = "Announcements",
  categoryId = "DIC_kwDOSpV2uc4C-BWz",
}: GiscusCommentsProps) {
  const { theme } = useThemeStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  // 确保在客户端挂载后再渲染
  useEffect(() => {
    // 使用 requestAnimationFrame 避免同步调用 setState
    const timer = requestAnimationFrame(() => {
      setMounted(true);
    });
    return () => cancelAnimationFrame(timer);
  }, []);

  // 获取当前主题，确保有默认值
  const currentTheme = theme || "light";
  const giscusTheme = currentTheme === "dark" ? "dark" : "light";

  useEffect(() => {
    // 确保在客户端执行且已挂载
    if (typeof window === "undefined" || !mounted || !containerRef.current) return;

    // 清除旧内容
    containerRef.current.innerHTML = "";

    // 创建 Giscus 容器
    const giscusContainer = document.createElement("div");
    giscusContainer.className = "giscus";
    containerRef.current.appendChild(giscusContainer);

    // 创建并配置脚本
    const script = document.createElement("script");
    script.src = "https://giscus.app/client.js";
    script.setAttribute("data-repo", repo);
    script.setAttribute("data-repo-id", repoId);
    script.setAttribute("data-category", category);
    script.setAttribute("data-category-id", categoryId);
    script.setAttribute("data-mapping", "pathname");
    script.setAttribute("data-strict", "1");
    script.setAttribute("data-reactions-enabled", "1");
    script.setAttribute("data-emit-metadata", "0");
    script.setAttribute("data-input-position", "top");
    script.setAttribute("data-theme", giscusTheme);
    script.setAttribute("data-lang", "zh-CN");
    script.setAttribute("data-loading", "lazy");
    script.setAttribute("crossorigin", "anonymous");
    script.async = true;

    containerRef.current.appendChild(script);

    // 清理函数
    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
    };
  }, [repo, repoId, category, categoryId, giscusTheme, mounted]);

  // 监听主题变化
  useEffect(() => {
    if (!mounted || typeof window === "undefined") return;
    
    const iframe = document.querySelector<HTMLIFrameElement>("iframe.giscus-frame");
    if (iframe?.contentWindow) {
      iframe.contentWindow.postMessage(
        {
          giscus: {
            setConfig: {
              theme: giscusTheme,
            },
          },
        },
        "https://giscus.app"
      );
    }
  }, [giscusTheme, mounted]);

  // 未挂载时不渲染内容
  if (!mounted) {
    return (
      <div 
        className="giscus-container w-full flex items-center justify-center"
        style={{ minHeight: "400px" }}
      >
        <div className="animate-pulse text-gray-400">加载评论中...</div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef} 
      className="giscus-container w-full"
      style={{ minHeight: "400px" }}
    />
  );
}
