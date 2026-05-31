/**
 * 自定义光标组件
 * 支持两种模式：
 * 1. 自定义光标图片（.cur 或 .png 文件）
 * 2. 光标跟随光晕效果
 * 3. CSS 绘制的备选光标
 */
"use client";

import { useEffect, useState, useCallback } from "react";
import { useThemeStore } from "../../stores/theme-store";
import configData from "../../../config.json";

// CSS 绘制的备选光标（红色圆点）
const CSS_CURSOR = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><circle cx="16" cy="16" r="10" fill="%23ff6b6b" stroke="white" stroke-width="2"/></svg>`;

export default function CustomCursor() {
	const { theme } = useThemeStore();
	// 光标位置状态
	const [position, setPosition] = useState({ x: 0, y: 0 });
	// 光标可见性状态
	const [isVisible, setIsVisible] = useState(false);
	// 是否在客户端
	const [isClient, setIsClient] = useState(false);
	// 使用备选光标
	const [useFallback, setUseFallback] = useState(false);

	// 从 config.json 直接读取配置
	const showCustomCursor = configData.showCustomCursor ?? false;
	const customCursorPath = configData.customCursorPath ?? "/cursors/default.cur";

	// 标记客户端渲染
	useEffect(() => {
		const timer = setTimeout(() => setIsClient(true), 0);
		return () => clearTimeout(timer);
	}, []);

	// 尝试加载光标图片
	useEffect(() => {
		if (!isClient || !showCustomCursor) return;

		const img = new Image();
		img.onload = () => {
			const timer = setTimeout(() => setUseFallback(false), 0);
			return () => clearTimeout(timer);
		};
		img.onerror = () => {
			const timer = setTimeout(() => setUseFallback(true), 0);
			return () => clearTimeout(timer);
		};
		img.src = customCursorPath;
	}, [isClient, showCustomCursor, customCursorPath]);

	// 鼠标移动处理
	const handleMouseMove = useCallback((e: MouseEvent) => {
		setPosition({ x: e.clientX, y: e.clientY });
		if (!isVisible) setIsVisible(true);
	}, [isVisible]);

	// 自定义光标模式：注入 CSS 样式
	useEffect(() => {
		if (!isClient) return;
		if (typeof window !== "undefined" && window.innerWidth < 768) return;
		
		if (showCustomCursor) {
			const cursorUrl = useFallback ? CSS_CURSOR : customCursorPath;
			
			// 先移除旧的样式
			const existingStyle = document.getElementById("custom-cursor-style");
			if (existingStyle) {
				existingStyle.remove();
			}
			
			const style = document.createElement("style");
			style.id = "custom-cursor-style";
			style.textContent = `
				html, body, * {
					cursor: url('${cursorUrl}') 16 16, auto !important;
				}
			`;
			document.head.appendChild(style);

			return () => {
				const existingStyle = document.getElementById("custom-cursor-style");
				if (existingStyle) {
					existingStyle.remove();
				}
			};
		}
	}, [showCustomCursor, customCursorPath, isClient, useFallback]);

	// 光晕跟随模式
	useEffect(() => {
		if (!isClient) return;
		if (showCustomCursor) return;

		const handleMouseLeave = () => setIsVisible(false);
		window.addEventListener("mousemove", handleMouseMove);
		document.addEventListener("mouseleave", handleMouseLeave);

		return () => {
			window.removeEventListener("mousemove", handleMouseMove);
			document.removeEventListener("mouseleave", handleMouseLeave);
		};
	}, [handleMouseMove, showCustomCursor, isClient]);

	// 服务端渲染时返回一个占位，避免 hydration 不匹配
	if (!isClient) return null;
	
	if (typeof window !== "undefined" && window.innerWidth < 768) return null;
	
	if (showCustomCursor) return null;

	// 渲染光晕效果
	return (
		<div
			className="pointer-events-none fixed z-[99999] rounded-full"
			style={{
				left: `${position.x}px`,
				top: `${position.y}px`,
				width: "400px",
				height: "400px",
				transform: "translate(-50%, -50%)",
				background: theme === "dark" 
					? "radial-gradient(circle, rgba(225,138,59,0.15) 0%, rgba(225,138,59,0.05) 40%, transparent 70%)"
					: "radial-gradient(circle, rgba(128,164,146,0.15) 0%, rgba(128,164,146,0.05) 40%, transparent 70%)",
				opacity: isVisible ? 1 : 0,
				transition: "opacity 0.3s ease",
			}}
		/>
	);
}
