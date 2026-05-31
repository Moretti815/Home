/**
 * Tab 切换组件
 * 用于切换说说和 Memos
 */
"use client";

import { motion } from "framer-motion";
import { useThemeStore } from "../../stores/theme-store";

interface Tab {
  value: string;
  label: string;
  icon: string;
}

interface TabSwitcherProps {
  tabs: Tab[];
  activeValue: string;
  onChange: (value: string) => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export default function TabSwitcher({ tabs, activeValue, onChange, onRefresh, isRefreshing }: TabSwitcherProps) {
  const { theme } = useThemeStore();
  const isDark = theme === "dark";

  return (
    <div className="flex items-center gap-2">
      <div
        className={`inline-flex items-center p-1 rounded-xl ${
          isDark ? "bg-white/5 border border-white/10" : "bg-gray-100 border border-gray-200"
        }`}
      >
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => onChange(tab.value)}
            className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
              activeValue === tab.value
                ? "text-white"
                : isDark
                ? "text-white/60 hover:text-white"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {activeValue === tab.value && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-purple-500 rounded-lg"
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
            <span className="relative z-10">
              <i className={`${tab.icon} text-xs`}></i>
            </span>
            <span className="relative z-10">{tab.label}</span>
          </button>
        ))}
      </div>
      
      {/* 刷新按钮 */}
      {onRefresh && (
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className={`p-2 rounded-xl transition-all duration-200 ${
            isDark
              ? "bg-white/5 border border-white/10 hover:bg-white/10 text-white/70 hover:text-white"
              : "bg-gray-100 border border-gray-200 hover:bg-gray-200 text-gray-600 hover:text-gray-900"
          } ${isRefreshing ? "opacity-50 cursor-not-allowed" : ""}`}
          title="刷新数据"
        >
          <motion.svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            animate={isRefreshing ? { rotate: 360 } : { rotate: 0 }}
            transition={isRefreshing ? { duration: 1, repeat: Infinity, ease: "linear" } : {}}
            className={isDark ? "text-white/70" : "text-gray-600"}
          >
            <path
              fill="currentColor"
              d="M12 20q-3.35 0-5.675-2.325T4 12t2.325-5.675T12 4q1.725 0 3.3.712T18 6.75V4h2v7h-7V9h4.2q-.8-1.4-2.187-2.2T12 6Q9.5 6 7.75 7.75T6 12t1.75 4.25T12 18q1.925 0 3.475-1.1T17.65 14h2.1q-.7 2.65-2.85 4.325T12 20"
            />
          </motion.svg>
        </button>
      )}
    </div>
  );
}
