/**
 * 技能展示组件
 * 展示技能列表和熟练度进度条
 * 支持滚动入场动画和进度条动画
 */
/* eslint-disable prefer-const */
"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "../../stores/language-store";
import { useThemeStore } from "../../stores/theme-store";
import { skillsConfig } from "../../site-config";
import { getThemeColors } from "../../themeConfig";
import { useScrollAnimation } from "../../hooks/useScrollAnimation";
import { useConfigStore } from "../../stores/config-store";

// 主题色配置
const THEME_COLORS = {
  dark: "#E18A3B",
  light: "#80A492",
};

export default function Skills() {
  const { t } = useTranslation();
  const { theme } = useThemeStore();
  const colors = getThemeColors(theme);
  const { siteContent } = useConfigStore();
  const primaryColor = theme === "dark" ? THEME_COLORS.dark : THEME_COLORS.light;
  // 动画进度值
  const [animatedLevels, setAnimatedLevels] = useState<Record<string, number>>({});

  // 滚动动画
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.1 });

  // 进度条动画：可见时启动
  useEffect(() => {
    if (isVisible && skillsConfig) {
      skillsConfig.forEach((skill) => {
        const start = 0;
        const end = skill.level;
        const duration = 1500;  // 动画持续时间
        const startTime = performance.now();

        // 缓动动画函数
        const animate = (currentTime: number) => {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          // easeOutQuart 缓动函数
          const easeOutQuart = 1 - Math.pow(1 - progress, 4);
          
          setAnimatedLevels((prev) => ({
            ...prev,
            [skill.name]: Math.round(start + (end - start) * easeOutQuart),
          }));

          if (progress < 1) {
            requestAnimationFrame(animate);
          }
        };

        requestAnimationFrame(animate);
      });
    }
  }, [isVisible]);

  // 如果配置隐藏技能展示，则不渲染
  if (siteContent?.showSkills === false) {
    return null;
  }

  return (
    <div id="skills" className="w-full max-w-3xl mx-auto">
      <div 
        ref={ref}
        className={`relative group transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
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
              <i className="fas fa-chart-line text-white text-sm"></i>
            </span>
            {t("skills")}
          </h3>

          <div className="space-y-4">
            {(skillsConfig || []).map((skill, index) => (
              <div key={skill.name} className="group/skill">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span 
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: primaryColor }}
                    >
                      <i className={`${skill.icon} text-white text-xs`}></i>
                    </span>
                    <span className={`font-medium ${colors.text}`}>{skill.name}</span>
                  </div>
                  <span className={`text-sm font-mono ${colors.textSecondary}`}>
                    {animatedLevels[skill.name] || 0}%
                  </span>
                </div>
                <div className={`h-2 rounded-full overflow-hidden ${
                  theme === "dark" 
                    ? "bg-white/10" 
                    : "bg-gray-200 border border-gray-100"
                }`}>
                  <div
                    className="h-full rounded-full transition-all duration-1000 ease-out group-hover/skill:brightness-110"
                    style={{ 
                      width: `${animatedLevels[skill.name] || 0}%`,
                      backgroundColor: primaryColor,
                      transitionDelay: `${index * 100}ms`
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
