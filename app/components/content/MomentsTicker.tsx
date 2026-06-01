/**
 * 说说滚动条组件
 * 展示最新的说说数据，支持自动循环滚动
 * 适配明暗模式和多端布局
 */
"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useThemeStore } from "../../stores/theme-store";
import { useTranslation } from "../../stores/language-store";
import configData from "../../../config.json";

interface MomentItem {
	id: string;
	content: string;
	date: string;
	type?: "text" | "image" | "music" | "video" | "link";
}

interface MomentsConfig {
	enabled: boolean;
	dataSource: "memos" | "moments" | "tgtalk";
	maxItems: number;
	scrollSpeed: number;
}

export default function MomentsTicker() {
	const router = useRouter();
	const { theme } = useThemeStore();
	const { t } = useTranslation();
	const [moments, setMoments] = useState<MomentItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [currentIndex, setCurrentIndex] = useState(0);
	const intervalRef = useRef<NodeJS.Timeout | null>(null);
	const containerRef = useRef<HTMLDivElement>(null);

	// 从配置读取说说滚动条配置
	const momentsConfig: MomentsConfig = {
		enabled: configData.momentsTicker?.enabled ?? false,
		dataSource: (configData.momentsTicker?.dataSource as "memos" | "moments" | "tgtalk") ?? "memos",
		maxItems: configData.momentsTicker?.maxItems ?? 5,
		scrollSpeed: configData.momentsTicker?.scrollSpeed ?? 3000,
	};

	// 获取说说数据（无缓存）
	const fetchMoments = useCallback(async () => {
		if (!momentsConfig.enabled) return;

		try {
			setLoading(true);
			setError(null);
			const response = await fetch(
				`/api/moments-ticker?source=${momentsConfig.dataSource}&max=${momentsConfig.maxItems}`,
				{
					cache: "no-store",
					headers: { "Cache-Control": "no-cache" },
				}
			);

			if (!response.ok) {
				throw new Error(`Failed to fetch: ${response.status}`);
			}

			const data = await response.json();
			console.log("[MomentsTicker] Fetched data:", data);
			setMoments(data);
			setCurrentIndex(0);
		} catch (err) {
			console.error("[MomentsTicker] Failed to fetch moments:", err);
			setError(err instanceof Error ? err.message : "Unknown error");
		} finally {
			setLoading(false);
		}
	}, [momentsConfig.dataSource, momentsConfig.enabled, momentsConfig.maxItems]);

	// 自动滚动 - 循环播放
	useEffect(() => {
		if (!momentsConfig.enabled || moments.length === 0) return;

		intervalRef.current = setInterval(() => {
			setCurrentIndex((prev) => {
				const nextIndex = prev + 1;
				// 如果到达最后一条，继续向下滚动（会显示第一条的复制）
				return nextIndex;
			});
		}, momentsConfig.scrollSpeed);

		return () => {
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
			}
		};
	}, [moments, momentsConfig.enabled, momentsConfig.scrollSpeed]);

	// 处理过渡结束，实现无缝循环
	const handleTransitionEnd = useCallback(() => {
		if (moments.length === 0) return;
		
		// 当滚动到复制的数据时，瞬间重置到开头（无动画）
		if (currentIndex >= moments.length) {
			// 先禁用过渡动画
			if (containerRef.current) {
				containerRef.current.style.transition = 'none';
			}
			setCurrentIndex(0);
			// 恢复过渡动画
			setTimeout(() => {
				if (containerRef.current) {
					containerRef.current.style.transition = '';
				}
			}, 50);
		}
	}, [currentIndex, moments.length]);

	// 初始加载数据
	useEffect(() => {
		fetchMoments();
	}, [fetchMoments]);

	// 如果未启用，不渲染
	if (!momentsConfig.enabled) return null;

	// 主题颜色
	const colors = {
		bg: theme === "dark" ? "bg-white/10" : "bg-white/80",
		border: theme === "dark" ? "border-white/20" : "border-gray-200",
		text: theme === "dark" ? "text-white" : "text-gray-800",
		textSecondary: theme === "dark" ? "text-white/70" : "text-gray-600",
		icon: theme === "dark" ? "text-white/80" : "text-gray-500",
		hover: theme === "dark" ? "hover:bg-white/20" : "hover:bg-gray-50",
	};

	// 获取图标类型
	const getTypeIcon = (type?: string) => {
		switch (type) {
			case "image":
				return "fa-image";
			case "music":
				return "fa-disc";
			case "video":
				return "fa-video";
			case "link":
				return "fa-link";
			default:
				return "fa-newspaper";
		}
	};

	// 解码 HTML 实体
	const decodeHtmlEntities = (text: string): string => {
		const textarea = document.createElement('textarea');
		textarea.innerHTML = text;
		return textarea.value;
	};

	// 复制数据用于无缝循环
	const displayMoments = moments.length > 0 ? [...moments, ...moments] : moments;

	return (
		<div
			className={`w-full rounded-xl border backdrop-blur-md transition-all duration-300 ${colors.bg} ${colors.border} ${colors.hover}`}
		>
			<div className="flex items-center gap-3 px-4 py-3">
				{/* Logo 图标 */}
				<i
					className={`fas fa-newspaper fa-bounce text-lg cursor-pointer transition-opacity hover:opacity-80 ${colors.icon}`}
					onClick={() => router.push("/moments")}
					title={t("viewMoments")}
				/>

				{/* 滚动内容区域 */}
				<div className="flex-1 overflow-hidden relative h-6">
					{loading ? (
						<div className={`text-sm ${colors.textSecondary}`}>{t("loading")}...</div>
					) : error ? (
						<div className={`text-sm ${colors.textSecondary}`}>{t("loadFailed")}</div>
					) : moments.length === 0 ? (
						<div className={`text-sm ${colors.textSecondary}`}>{t("noMoments")}</div>
					) : (
						<div
							ref={containerRef}
							className="transition-transform duration-500 ease-in-out"
							style={{ transform: `translateY(-${currentIndex * 24}px)` }}
							onTransitionEnd={handleTransitionEnd}
						>
							{displayMoments.map((moment, index) => (
								<div
									key={`moment-${index}`}
									className="h-6 flex items-center gap-2 cursor-pointer"
									onClick={() => router.push("/moments")}
								>
									<span className={`text-sm truncate flex-1 ${colors.text}`}>
									{decodeHtmlEntities(moment.content)}
								</span>
									{moment.type && moment.type !== "text" && (
										<i className={`fas ${getTypeIcon(moment.type)} text-xs ${colors.icon}`} />
									)}
									<span className={`text-xs whitespace-nowrap ${colors.textSecondary}`}>
										{moment.date}
									</span>
								</div>
							))}
						</div>
					)}
				</div>

				{/* 跳转按钮 */}
				<i
					className={`fas fa-circle-chevron-right text-lg cursor-pointer transition-all hover:scale-110 ${colors.icon}`}
					onClick={() => router.push("/moments")}
					title={t("viewAllMoments")}
				/>
			</div>

			{/* 指示器 */}
			{!loading && !error && moments.length > 0 && (
				<div className="flex justify-center gap-1 pb-2">
					{moments.map((_, index) => (
						<div
							key={index}
							className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
								index === currentIndex % moments.length
									? theme === "dark"
										? "bg-white"
										: "bg-gray-800"
									: theme === "dark"
										? "bg-white/30"
										: "bg-gray-300"
							}`}
						/>
					))}
				</div>
			)}
		</div>
	);
}
