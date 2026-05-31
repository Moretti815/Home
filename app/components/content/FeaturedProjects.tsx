/**
 * 精选项目展示组件
 * 展示精选项目列表，支持图片预览和技术标签
 * 支持滚动入场动画和响应式布局
 */
/* eslint-disable react-hooks/refs */
"use client";

import Image from "next/image";
import { useLanguageStore, useTranslation } from "../../stores/language-store";
import { useThemeStore } from "../../stores/theme-store";
import { projectsConfig, moreProjectsConfig } from "../../site-config";
import { getThemeColors } from "../../themeConfig";
import { useScrollAnimation } from "../../hooks/useScrollAnimation";
import { useConfigStore } from "../../stores/config-store";

// 主题色配置
const THEME_COLORS = {
  dark: "#E18A3B",
  light: "#80A492",
};

export default function FeaturedProjects() {
  const { language } = useLanguageStore();
  const { t } = useTranslation();
  const { theme } = useThemeStore();
  const colors = getThemeColors(theme);
  const { siteContent } = useConfigStore();
  const primaryColor = theme === "dark" ? THEME_COLORS.dark : THEME_COLORS.light;

  // 滚动动画
  const projectsSection = useScrollAnimation({ threshold: 0.1 });

  // 如果配置隐藏项目展示，则不渲染
  if (siteContent?.showProjects === false) {
    return null;
  }

  return (
    <div id="projects" className="w-full max-w-5xl mx-auto">
      <div 
        ref={projectsSection.ref as React.RefObject<HTMLDivElement>}
        className={`relative group transition-all duration-1000 ${
          projectsSection.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        {/* 发光边框效果 */}
        <div 
          className="absolute -inset-1 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition duration-500"
          style={{ backgroundColor: `${primaryColor}30` }}
        ></div>
        <div className={`relative ${colors.cardBackground}/80 backdrop-blur-md rounded-2xl p-6 shadow-xl border ${colors.border} hover:${colors.borderHover} transition-all duration-300`}>
          <h3 className={`text-lg font-semibold mb-6 flex items-center gap-2 ${colors.text}`}>
            <span 
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: primaryColor }}
            >
              <i className="fas fa-star text-white text-sm"></i>
            </span>
            {t("featuredProjects")}
          </h3>

          {/* 项目网格 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projectsConfig.map((project) => (
              <a
                key={project.id}
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`group/project relative overflow-hidden rounded-xl transition-all duration-500 ${
                  theme === "dark" 
                    ? "bg-white/5 hover:bg-white/10" 
                    : "bg-white border border-gray-200"
                }`}
              >
                {/* 边框流光效果 */}
                <div className="absolute inset-0 rounded-xl opacity-0 group-hover/project:opacity-100 transition-opacity duration-500 pointer-events-none">
                  <div 
                    className="absolute inset-0 rounded-xl"
                    style={{
                      padding: '2px',
                      backgroundColor: primaryColor,
                    }}
                  >
                    <div className={`w-full h-full rounded-xl ${
                      theme === "dark" ? "bg-gray-900/95" : "bg-white/95"
                    }`}></div>
                  </div>
                </div>

                {/* 悬停阴影扩散 */}
                <div 
                  className="absolute inset-0 rounded-xl transition-all duration-500 opacity-0 group-hover/project:opacity-100 pointer-events-none"
                  style={{ boxShadow: `0 0 40px ${primaryColor}40` }}
                ></div>

                {/* 项目封面图 */}
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={project.image}
                    alt={project.name}
                    fill
                    className="object-cover transition-transform duration-700 ease-out group-hover/project:scale-125"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  
                  {/* 渐变遮罩动画 */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                  <div 
                    className="absolute inset-0 transition-opacity duration-500 opacity-0 group-hover/project:opacity-100"
                    style={{ backgroundColor: `${primaryColor}20` }}
                  ></div>
                  
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span 
                        className="w-8 h-8 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover/project:scale-110"
                        style={{ backgroundColor: primaryColor }}
                      >
                        <i className={`${project.icon} text-white text-xs`}></i>
                      </span>
                      <h4 className="text-white font-semibold text-lg transition-transform duration-300 group-hover/project:translate-x-1">{project.name}</h4>
                    </div>
                  </div>
                </div>

                <div className="p-4 relative">
                  <p className={`text-sm mb-4 line-clamp-2 ${colors.textSecondary}`}>
                    {project.description[language]}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.tags.map((tag, index) => (
                      <span
                        key={tag}
                        className={`text-xs px-2 py-1 rounded-full transition-all duration-300 ${
                          theme === "dark" 
                            ? "bg-white/10 text-white/80 hover:bg-white/20" 
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                        style={{
                          animationDelay: `${index * 50}ms`,
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div 
                    className={`flex items-center gap-2 text-sm transition-all duration-300 ${colors.textSecondary}`}
                    style={{ color: theme === "dark" ? "rgba(255,255,255,0.8)" : primaryColor }}
                  >
                    <span>{t("viewProject")}</span>
                    <i className="fas fa-arrow-right transition-transform duration-300 group-hover/project:translate-x-2"></i>
                  </div>
                </div>
              </a>
            ))}
          </div>

          <div className="mt-6 text-center">
            <a
              href={moreProjectsConfig.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg text-white"
              style={{ backgroundColor: primaryColor }}
            >
              <span>{moreProjectsConfig.title[language]}</span>
              <i className="fab fa-github"></i>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
