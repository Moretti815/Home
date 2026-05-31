/**
 * 课程表页面
 * 展示完整课程表，支持周切换和主题适配
 */

"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { useLanguageStore, useTranslation } from "../stores/language-store";
import { useThemeStore } from "../stores/theme-store";
import { useEffectsStore } from "../stores/effects-store";
import { usePageColors } from "../hooks/usePageColors";
import LoadingScreen from "../components/effects/LoadingScreen";
import PageTransition from "../components/effects/PageTransition";
import PageNav from "../components/layout/PageNav";
import SEOHead from "../components/seo/SEOHead";
import ParticleBackground from "../components/effects/ParticleBackground";
import DynamicLines from "../components/effects/DynamicLines";
import TopToolbar from "../components/ui/TopToolbar";
import type { TimetableData } from "../types/timetable";
import {
	buildTimetableViewModel,
	resolveCurrentWeek,
} from "../utils/timetable";

// 容器动画配置
const containerVariants = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: {
			staggerChildren: 0.1,
		},
	},
};

// 卡片动画配置
const cardVariants = {
	hidden: { opacity: 0, y: 20 },
	visible: {
		opacity: 1,
		y: 0,
		transition: {
			type: "spring" as const,
			stiffness: 100,
			damping: 15,
		},
	},
};

export default function TimetablePage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const { t } = useTranslation();
	const { hydrated, hydrate, language } = useLanguageStore();
	const { theme } = useThemeStore();
	const { effectsEnabled } = useEffectsStore();
	const colors = usePageColors();
	const [mounted, setMounted] = useState(false);
	const [timetableData, setTimetableData] = useState<TimetableData | null>(null);
	const [currentWeek, setCurrentWeek] = useState(1);
	const [selectedWeek, setSelectedWeek] = useState(1);
	const [isCurrentWeek, setIsCurrentWeek] = useState(true);

	const isDark = theme === "dark";

	const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://your-site.com";

	// 加载课程表数据
	useEffect(() => {
		const fetchTimetable = async () => {
			try {
				const response = await fetch("/大三下.json");
				const data = await response.json();

				// 转换数据格式
				const timetable: TimetableData = {
					courseLen: data.courseLen,
					id: data.id,
					name: data.name,
					timeTable: data.timeTable,
					settings: {
						tableName: data.settings.tableName,
						maxWeek: data.settings.maxWeek,
						nodes: data.settings.nodes,
						startDate: data.settings.startDate,
						showSat: data.settings.showSat,
						showSun: data.settings.showSun,
						weekendDisplay: data.settings.weekendDisplay,
					},
					courses: data.courses,
					schedules: data.schedules,
				};

				setTimetableData(timetable);

				// 计算当前周
				const week = resolveCurrentWeek(
					timetable.settings.startDate,
					timetable.settings.maxWeek
				);
				setCurrentWeek(week);

				// 从 URL 获取选中的周
				const weekParam = searchParams.get("week");
				if (weekParam) {
					const requestedWeek = Number(weekParam);
					if (
						Number.isInteger(requestedWeek) &&
						requestedWeek > 0 &&
						requestedWeek <= timetable.settings.maxWeek
					) {
						setSelectedWeek(requestedWeek);
						setIsCurrentWeek(requestedWeek === week);
					} else {
						setSelectedWeek(week);
						setIsCurrentWeek(true);
					}
				} else {
					setSelectedWeek(week);
					setIsCurrentWeek(true);
				}
			} catch (error) {
				console.error("Failed to fetch timetable:", error);
			}
		};

		fetchTimetable();
	}, [searchParams]);

	useEffect(() => {
		hydrate();
	}, [hydrate]);

	useEffect(() => {
		if (hydrated) {
			const timer = setTimeout(() => setMounted(true), 0);
			return () => clearTimeout(timer);
		}
	}, [hydrated]);

	// 周切换
	const goToPreviousWeek = useCallback(() => {
		if (selectedWeek > 1) {
			const newWeek = selectedWeek - 1;
			setSelectedWeek(newWeek);
			setIsCurrentWeek(newWeek === currentWeek);
			router.push(`/timetable?week=${newWeek}`);
		}
	}, [selectedWeek, currentWeek, router]);

	const goToNextWeek = useCallback(() => {
		if (timetableData && selectedWeek < timetableData.settings.maxWeek) {
			const newWeek = selectedWeek + 1;
			setSelectedWeek(newWeek);
			setIsCurrentWeek(newWeek === currentWeek);
			router.push(`/timetable?week=${newWeek}`);
		}
	}, [selectedWeek, currentWeek, timetableData, router]);

	const pageTitle = language === "zh" ? "课程表" : "Timetable";
	const pageSubtitle =
		language === "zh" ? "查看本周课程安排" : "View this week's schedule";

	// 构建视图模型
	const viewModel = timetableData
		? buildTimetableViewModel(timetableData, selectedWeek)
		: null;

	return (
		<>
			<LoadingScreen />
			<PageTransition hydrated={hydrated} mounted={mounted} />
			<SEOHead
				title={pageTitle}
				description={pageSubtitle}
				url={`${siteUrl}/timetable`}
			/>
			<motion.div
				className={`min-h-screen ${colors.background} relative overflow-hidden`}
				initial={effectsEnabled ? "hidden" : false}
				animate={effectsEnabled ? "visible" : false}
				variants={effectsEnabled ? containerVariants : undefined}
			>
				{/* 顶部工具栏 */}
				<TopToolbar />

				{/* 粒子背景 */}
				<ParticleBackground theme={theme} />

				{/* 动态线条 */}
				<DynamicLines theme={theme} />

				<div className="max-w-6xl mx-auto px-4 py-8 relative z-10">
					{/* 页面头部 */}
					<motion.div
						className="text-center mb-8"
						variants={effectsEnabled ? cardVariants : undefined}
					>
						<PageNav
							cardClass={isDark ? "bg-white/10" : "bg-white/80"}
							textClass={isDark ? "text-white" : "text-gray-800"}
							hoverClass={isDark ? "hover:bg-white/20" : "hover:bg-gray-50"}
						/>

						<h1
							className={`text-3xl md:text-4xl font-bold mb-4 ${
								isDark ? "text-white" : "text-gray-900"
							}`}
						>
							{pageTitle}
						</h1>
						<p
							className={`text-lg ${
								isDark ? "text-white/70" : "text-gray-600"
							}`}
						>
							{pageSubtitle}
						</p>
					</motion.div>

					{/* 周选择器 */}
					<motion.div
						className="flex flex-wrap items-center justify-center gap-3 mb-8"
						variants={effectsEnabled ? cardVariants : undefined}
					>
						<div className="inline-flex items-center gap-1">
							<button
								onClick={goToPreviousWeek}
								disabled={selectedWeek <= 1}
								className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
									isDark
										? "bg-white/10 hover:bg-white/20 disabled:opacity-30"
										: "bg-white hover:bg-gray-100 disabled:opacity-30"
								} border ${isDark ? "border-white/20" : "border-gray-200"}`}
							>
								<i className="fas fa-chevron-left" />
							</button>
							<span
								className={`min-w-[5rem] px-4 py-2 text-center font-medium rounded-lg ${
									isDark
										? "bg-white/10 text-white"
										: "bg-white text-gray-900"
								} border ${isDark ? "border-white/20" : "border-gray-200"}`}
							>
								第 {selectedWeek} 周
							</span>
							<button
								onClick={goToNextWeek}
								disabled={
									!timetableData || selectedWeek >= timetableData.settings.maxWeek
								}
								className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
									isDark
										? "bg-white/10 hover:bg-white/20 disabled:opacity-30"
										: "bg-white hover:bg-gray-100 disabled:opacity-30"
								} border ${isDark ? "border-white/20" : "border-gray-200"}`}
							>
								<i className="fas fa-chevron-right" />
							</button>
							{isCurrentWeek && (
								<span
									className={`ml-2 px-3 py-1 text-sm rounded-full ${
										isDark
											? "bg-white/20 text-white"
											: "bg-gray-200 text-gray-700"
									}`}
								>
									当前周
								</span>
							)}
						</div>
					</motion.div>

					{/* 课程表 */}
					{viewModel ? (
						<motion.div
							className={`rounded-2xl overflow-hidden ${
								isDark ? "bg-white/5" : "bg-white"
							} border ${isDark ? "border-white/10" : "border-gray-200"}`}
							variants={effectsEnabled ? cardVariants : undefined}
						>
							{/* 桌面端表格 */}
							<div className="hidden md:block overflow-x-auto">
								<table className="w-full">
									<colgroup>
										<col className="w-28" />
										{viewModel.dayColumns.map((_, i) => (
											<col key={i} />
										))}
									</colgroup>
									<thead>
										<tr
											className={`border-b ${
												isDark ? "border-white/10" : "border-gray-200"
											}`}
										>
											<th
												className={`px-4 py-3 text-left text-sm font-semibold ${
													isDark ? "text-white/80" : "text-gray-700"
												}`}
											>
												节次
											</th>
											{viewModel.dayColumns.map((day) => (
												<th
													key={day.day}
													className={`px-4 py-3 text-left text-sm font-semibold ${
														isDark ? "text-white/80" : "text-gray-700"
													}`}
												>
													{day.label}
												</th>
											))}
										</tr>
									</thead>
									<tbody>
										{viewModel.nodeRows
											.filter((row) => row.node % 2 === 1)
											.map((row) => {
												const endNode = Math.min(
													row.node + 1,
													viewModel.nodeRows.length
												);
												const endRow = viewModel.nodeRows.find(
													(r) => r.node === endNode
												);
												return (
													<tr
														key={row.node}
														className={`border-b last:border-b-0 ${
															isDark
																? "border-white/10"
																: "border-gray-100"
														}`}
													>
														<td className="px-4 py-3 align-top">
															<p
																className={`text-sm font-medium ${
																	isDark
																		? "text-white"
																		: "text-gray-900"
																}`}
															>
																第 {row.node}-{endNode} 节
															</p>
															<p
																className={`text-xs mt-1 ${
																	isDark
																		? "text-white/50"
																		: "text-gray-500"
																}`}
															>
																{row.startTime} - {endRow?.endTime || row.endTime}
															</p>
														</td>
														{viewModel.dayColumns.map((day) => {
														const rowEndNode = Math.min(
															row.node + 1,
															viewModel.nodeRows.length
														);
														const courses =
															viewModel.coursesByDay[day.day]?.filter(
																(c) =>
																	c.startNode <= rowEndNode &&
																	c.endNode >= row.node
															) || [];
														return (
															<td
																key={day.day}
																className="px-4 py-3 align-top"
															>
																	{courses.length > 0 ? (
																		<div className="space-y-2">
																			{courses.map((course) => (
																				<div
																					key={`${course.courseId}-${course.startNode}`}
																					className="rounded-lg border-l-4 p-3 text-sm"
																					style={{
																						borderLeftColor: course.color,
																						backgroundColor: `${course.color}20`,
																					}}
																				>
																					<div
																									className={`font-semibold mb-1 ${
																										isDark ? "text-white" : "text-gray-900"
																									}`}
																								>
																									{course.courseName}
																								</div>
																					<div
																						className={`text-xs space-y-0.5 ${
																							isDark
																								? "text-white/60"
																								: "text-gray-500"
																						}`}
																					>
																						<div>
																							{course.startWeek}-{course.endWeek}周
																						</div>
																						<div>教室：{course.room}</div>
																						<div>教师：{course.teacher}</div>
																					</div>
																				</div>
																			))}
																		</div>
																	) : (
																		<div
																			className={`text-center text-xs ${
																				isDark
																					? "text-white/30"
																					: "text-gray-300"
																			}`}
																		>
																			—
																		</div>
																	)}
																</td>
															);
															})}
													</tr>
												);
											})}
									</tbody>
								</table>
							</div>

							{/* 移动端列表 */}
							<div className="md:hidden space-y-4 p-4">
								{viewModel.dayColumns.map((day) => {
									const courses = viewModel.coursesByDay[day.day] || [];
									return (
										<div
											key={day.day}
											className={`rounded-xl p-4 ${
												isDark ? "bg-white/5" : "bg-gray-50"
											}`}
										>
											<h3
												className={`text-lg font-semibold mb-3 ${
													isDark ? "text-white" : "text-gray-900"
												}`}
											>
												{day.label}
											</h3>
											{courses.length > 0 ? (
												<div className="space-y-3">
													{courses.map((course) => (
														<div
															key={`${course.courseId}-${course.startNode}`}
															className="rounded-lg border-l-4 p-3"
															style={{
																borderLeftColor: course.color,
																backgroundColor: `${course.color}20`,
															}}
														>
															<div className="font-semibold mb-2 text-gray-900 dark:text-white">
																{course.courseName}
															</div>
															<div
																className={`text-sm space-y-1 ${
																	isDark
																		? "text-white/60"
																		: "text-gray-500"
																}`}
															>
																<div>时间：{course.timeText}</div>
																<div>
																	周次：{course.startWeek}-{course.endWeek}周
																</div>
																<div>教室：{course.room}</div>
																<div>教师：{course.teacher}</div>
															</div>
														</div>
													))}
												</div>
											) : (
												<p
													className={`text-sm ${
														isDark ? "text-white/50" : "text-gray-500"
													}`}
												>
													本周暂无课程
										</p>
									)}
								</div>
								);
								})}
							</div>
						</motion.div>
					) : (
						<motion.div
							className="flex items-center justify-center py-20"
							variants={effectsEnabled ? cardVariants : undefined}
						>
							<div className="animate-pulse space-y-4">
								<div
									className={`h-4 w-32 rounded ${
										isDark ? "bg-white/20" : "bg-gray-200"
									}`}
								/>
								<div
									className={`h-64 w-full max-w-4xl rounded ${
										isDark ? "bg-white/10" : "bg-gray-100"
									}`}
								/>
							</div>
						</motion.div>
					)}
				</div>
			</motion.div>
		</>
	);
}
