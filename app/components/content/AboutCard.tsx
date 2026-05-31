/**
 * 关于我卡片组件
 * 展示个人信息、技术栈、当前专注方向和座右铭
 * 支持滚动入场动画
 */
"use client";

import { useLanguageStore, useTranslation } from "../../stores/language-store";
import { useThemeStore } from "../../stores/theme-store";
import { techStackConfig, aboutMeConfig } from "../../site-config";
import { getThemeColors } from "../../themeConfig";
import { useScrollAnimation } from "../../hooks/useScrollAnimation";

// 主题色配置
const THEME_COLORS = {
  dark: "#E18A3B",
  light: "#80A492",
};

export default function AboutCard() {
  const { language } = useLanguageStore();
  const { t } = useTranslation();
  const { theme } = useThemeStore();
  const colors = getThemeColors(theme);
  const primaryColor = theme === "dark" ? THEME_COLORS.dark : THEME_COLORS.light;

  // 滚动动画 refs
  const { ref: aboutRef, isVisible: aboutVisible } = useScrollAnimation({ threshold: 0.1 });
  const { ref: techRef, isVisible: techVisible } = useScrollAnimation({ threshold: 0.1 });
  const { ref: focusRef, isVisible: focusVisible } = useScrollAnimation({ threshold: 0.1 });
  const { ref: mottoRef, isVisible: mottoVisible } = useScrollAnimation({ threshold: 0.1 });

  return (
    <div id="about" className="w-full max-w-3xl mx-auto space-y-8">
      {/* 关于我 */}
      <div 
        ref={aboutRef}
        className={`relative group transition-all duration-1000 ${
          aboutVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        {/* 发光边框效果 */}
        <div 
          className="absolute -inset-1 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition duration-500"
          style={{ backgroundColor: `${primaryColor}30` }}
        ></div>
        <div className={`relative ${colors.cardBackground}/80 backdrop-blur-md rounded-2xl p-6 shadow-xl border ${colors.border} hover:${colors.borderHover} transition-all duration-300`}>
          <h3 className={`text-lg font-semibold mb-5 flex items-center gap-2 ${colors.text}`}>
            <span 
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: primaryColor }}
            >
              <i className="fas fa-rocket text-white text-sm"></i>
            </span>
            {t("aboutMe")}
          </h3>
          
          {/* 个人信息网格 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { icon: "fas fa-user", value: aboutMeConfig.name },
              { icon: "fas fa-map-marker-alt", value: aboutMeConfig.location[language] },
              { icon: "fas fa-briefcase", value: aboutMeConfig.focus[language] },
              { icon: "fas fa-heart", value: aboutMeConfig.hobbies[language] },
            ].map((item) => (
              <div 
                key={item.icon}
                className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 hover:translate-x-1 ${
                  theme === "dark" 
                    ? "bg-white/5 hover:bg-white/10" 
                    : "bg-gray-50 hover:bg-gray-100 border border-gray-100"
                }`}
              >
                <span 
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: primaryColor }}
                >
                  <i className={`${item.icon} text-white text-xs`}></i>
                </span>
                <span className={`text-sm ${colors.textSecondary}`}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 技术栈 */}
      <div 
        ref={techRef as React.RefObject<HTMLDivElement>}
        className={`relative group transition-all duration-1000 delay-200 ${
          techVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <div 
          className="absolute -inset-1 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition duration-500"
          style={{ backgroundColor: `${primaryColor}30` }}
        ></div>
        <div className={`relative ${colors.cardBackground}/80 backdrop-blur-md rounded-2xl p-6 shadow-xl border ${colors.border} hover:${colors.borderHover} transition-all duration-300`}>
          <h3 className={`text-lg font-semibold mb-5 flex items-center gap-2 ${colors.text}`}>
            <span 
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: primaryColor }}
            >
              <i className="fas fa-tools text-white text-sm"></i>
            </span>
            {t("techStack")}
          </h3>

          <div className="space-y-5">
            {[
              { key: "backend", data: techStackConfig.backend, icon: "fas fa-server" },
              { key: "mobile", data: techStackConfig.mobile, icon: "fas fa-mobile-alt" },
              { key: "frontend", data: techStackConfig.frontend, icon: "fas fa-laptop-code" },
            ].filter(category => category.data && category.data.length > 0).map((category) => (
              <div key={category.key}>
                <p className={`text-xs mb-2 flex items-center gap-2 ${colors.textSecondary}`}>
                  <i className={category.icon}></i>
                  {t(category.key as "backend" | "mobile" | "frontend")}
                </p>
                <div className="flex flex-wrap gap-2">
                  {category.data.map((tech) => (
                    <span
                      key={tech.name}
                      className="relative group/tag"
                    >
                      <span className="absolute inset-0 bg-white/20 rounded-full blur-sm group-hover/tag:blur-md transition-all duration-300 opacity-0 group-hover/tag:opacity-100"></span>
                      <span
                        className="relative text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 hover:scale-110 transition-all duration-300 cursor-default shadow-lg"
                        style={{ backgroundColor: primaryColor }}
                      >
                        {tech.icon?.startsWith('http') ? (
                          <img src={tech.icon} alt={tech.name} className="w-3.5 h-3.5 object-contain" />
                        ) : (
                          <i className={tech.icon}></i>
                        )}
                        {tech.name}
                      </span>
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 当前关注 */}
      <div 
        ref={focusRef as React.RefObject<HTMLDivElement>}
        className={`relative group transition-all duration-1000 delay-400 ${
          focusVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <div 
          className="absolute -inset-1 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition duration-500"
          style={{ backgroundColor: `${primaryColor}30` }}
        ></div>
        <div className={`relative ${colors.cardBackground}/80 backdrop-blur-md rounded-2xl p-6 shadow-xl border ${colors.border} hover:${colors.borderHover} transition-all duration-300`}>
          <h3 className={`text-lg font-semibold mb-5 flex items-center gap-2 ${colors.text}`}>
            <span 
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: primaryColor }}
            >
              <i className="fas fa-bullseye text-white text-sm"></i>
            </span>
            {t("currentFocus")}
          </h3>

          <div className="space-y-3">
            {aboutMeConfig.currentFocus.map((item, index) => (
              <div 
                key={index} 
                className={`flex items-start gap-4 p-3 rounded-xl transition-all duration-300 hover:translate-x-1 ${
                  theme === "dark" 
                    ? "bg-white/5 hover:bg-white/10" 
                    : "bg-gray-50 hover:bg-gray-100 border border-gray-100"
                }`}
              >
                <span 
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                  style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}
                >
                  <i className={item.icon}></i>
                </span>
                <span className={`text-sm leading-relaxed ${colors.textSecondary}`}>{item.text[language]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 座右铭 */}
      <div 
        ref={mottoRef}
        className={`relative transition-all duration-1000 delay-600 ${
          mottoVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <div 
          className="absolute inset-0 blur-xl"
          style={{ backgroundColor: `${primaryColor}10` }}
        ></div>
        <div className="relative text-center py-6 px-8">
          <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-full border ${
            theme === "dark" 
              ? "bg-white/5 border-white/10" 
              : "bg-white/80 border-gray-200 shadow-sm"
          }`}>
            <span className="text-2xl">💡</span>
            <p className={`text-sm italic ${
              theme === "dark" ? "text-white/80" : "text-gray-700"
            }`}>
              &quot;{aboutMeConfig.motto[language]}&quot;
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
