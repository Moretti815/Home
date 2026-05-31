/**
 * Filter Tabs 筛选标签组件
 * 参考 Mizuki FilterTabs.astro 样式
 */
"use client";

import { motion } from "framer-motion";
import { useThemeStore } from "../../stores/theme-store";
import type { FilterTab } from "../../types/memo";

interface FilterTabsProps {
  tabs: FilterTab[];
  activeValue: string;
  onChange: (value: string) => void;
}

export default function FilterTabs({ tabs, activeValue, onChange }: FilterTabsProps) {
  const { theme } = useThemeStore();
  const isDark = theme === "dark";

  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map((tab) => (
        <motion.button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap ${
            activeValue === tab.value
              ? isDark
                ? "bg-purple-500 text-white border border-purple-500"
                : "bg-purple-500 text-white border border-purple-500"
              : isDark
              ? "bg-white/5 border border-white/10 text-white/70 hover:border-purple-500/50 hover:text-white"
              : "bg-white border border-gray-200 text-gray-600 hover:border-purple-500/50 hover:text-gray-900"
          }`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {tab.icon && (
            <i className={`${tab.icon} text-sm ${activeValue === tab.value ? "opacity-100" : "opacity-70"}`}></i>
          )}
          <span>{tab.label}</span>
          {tab.count !== undefined && (
            <span className={`text-xs ${activeValue === tab.value ? "text-white/80" : "opacity-60"}`}>
              ({tab.count})
            </span>
          )}
        </motion.button>
      ))}
    </div>
  );
}
