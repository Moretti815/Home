/**
 * 课程表卡片组件
 * 展示今日课程状态，适配主页明暗模式
 */
"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useThemeStore } from "../../stores/theme-store";
import { useTranslation } from "../../stores/language-store";
import type { TimetableData, TimetableCourseView } from "../../types/timetable";
import {
	buildTimetableViewModel,
	resolveCurrentWeek,
	parseTimeToMinute,
	formatDuration,
} from "../../utils/timetable";

interface TimetableCardProps {
	data: TimetableData;
}

interface StatusLine {
	text: string;
	color?: string;
	bold?: boolean;
	strikethrough?: boolean;
}

export default function TimetableCard({ data }: TimetableCardProps) {
	const router = useRouter();
	const { theme } = useThemeStore();
	const { t } = useTranslation();
	const [statusLines, setStatusLines] = useState<StatusLine[][]>([]);
	const [loaded, setLoaded] = useState(false);

	const isDark = theme === "dark";

	// 点击跳转到课程表页面
	const handleClick = useCallback(() => {
		router.push("/timetable");
	}, [router]);

	// 获取今日课程
	const getTodayCourses = useCallback(
		(coursesByDay: Record<number, TimetableCourseView[]>, now: Date) => {
			const day = now.getDay() === 0 ? 7 : now.getDay();
			return coursesByDay[day] || [];
		},
		[]
	);

	// 解析实时状态
	const resolveLiveState = useCallback(
		(viewModel: ReturnType<typeof buildTimetableViewModel>): StatusLine[][] => {
			const now = new Date();
			const currentSecond = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
			const currentMinute = Math.floor(currentSecond / 60);
			const day = now.getDay() === 0 ? 7 : now.getDay();
			const { coursesByDay, currentWeek, maxWeek } = viewModel;

			// 周末
			if (day >= 6) {
				const allDays = Object.values(coursesByDay).flat();
				const nextWeekFirstCourse = allDays.find((c) => c.day === 1);

				if (nextWeekFirstCourse && currentWeek < maxWeek) {
					const daysUntilMonday = day === 6 ? 2 : 1;
					const courseStartMinute = parseTimeToMinute(
						nextWeekFirstCourse.timeText.split(" - ")[0]
					)!;
					const secondsUntilCourse =
						daysUntilMonday * 86400 +
						courseStartMinute * 60 -
						currentSecond;

					return [
						[{ text: "本周课毕", bold: true }],
						[
							{ text: "下周首节：" },
							{
								text: `${nextWeekFirstCourse.courseName} - ${nextWeekFirstCourse.room}`,
								bold: true,
								color: nextWeekFirstCourse.color,
							},
						],
						[
							{ text: "距上课还有：" },
							{ text: formatDuration(secondsUntilCourse), bold: true },
						],
					];
				}

				return [[{ text: "周末", bold: true }]];
			}

			const courses = getTodayCourses(coursesByDay, now);

			// 今日无课
			if (courses.length === 0) {
				const allDays = Object.values(coursesByDay).flat();
				const nextDayCourse = allDays.find((c) => c.day > day);

				if (nextDayCourse) {
					const daysUntil = nextDayCourse.day - day;
					const secondsUntilCourse =
						daysUntil * 86400 +
						parseTimeToMinute(nextDayCourse.timeText.split(" - ")[0])! * 60 -
						currentSecond;

					return [
						[{ text: "今日课毕", bold: true }],
						[
							{ text: "翌日首节：" },
							{
								text: `${nextDayCourse.courseName} - ${nextDayCourse.room}`,
								bold: true,
								color: nextDayCourse.color,
							},
						],
						[
							{ text: "距上课还有：" },
							{ text: formatDuration(secondsUntilCourse), bold: true },
						],
					];
				}

				return [[{ text: "今日无课", bold: true }]];
			}

			// 查找当前状态
			for (let index = 0; index < courses.length; index++) {
				const current = courses[index];
				const prev = index > 0 ? courses[index - 1] : null;
				const next = courses[index + 1] || null;

				const currentStartMin = parseTimeToMinute(current.timeText.split(" - ")[0])!;
				const currentEndMin = parseTimeToMinute(current.timeText.split(" - ")[1])!;

				// 上课中
				if (currentMinute >= currentStartMin && currentMinute < currentEndMin) {
					const remainSeconds = currentEndMin * 60 - currentSecond;

					return [
						[{ text: "上课中", bold: true }],
						...(prev
							? [
									[
										{ text: "上节：", strikethrough: true },
										{
											text: `${prev.courseName} - ${prev.room}`,
											strikethrough: true,
											color: prev.color,
										},
									],
								]
							: []),
						[
							{ text: "本节：" },
							{
								text: `${current.courseName} - ${current.room}`,
								bold: true,
								color: current.color,
							},
						],
						...(next
							? [
									[
										{ text: "下节：" },
										{
											text: `${next.courseName} - ${next.room}`,
											color: next.color,
										},
									],
								]
							: []),
						[
							{ text: "距下课还有：" },
							{ text: formatDuration(remainSeconds), bold: true },
						],
					];
				}

				// 课间
				if (next) {
					const nextStartMin = parseTimeToMinute(next.timeText.split(" - ")[0])!;
					if (currentMinute >= currentEndMin && currentMinute < nextStartMin) {
						const remainSeconds = nextStartMin * 60 - currentSecond;

						return [
							[{ text: "课间", bold: true }],
							[
								{ text: "上节：", strikethrough: true },
								{
									text: `${current.courseName} - ${current.room}`,
									strikethrough: true,
									color: current.color,
								},
							],
							[
								{ text: "下节：" },
								{
									text: `${next.courseName} - ${next.room}`,
									bold: true,
									color: next.color,
								},
							],
							[
								{ text: "距上课还有：" },
								{ text: formatDuration(remainSeconds), bold: true },
							],
						];
					}
				}
			}

			// 今日课毕
			const lastCourse = courses[courses.length - 1];
			const lastEndMin = parseTimeToMinute(lastCourse.timeText.split(" - ")[1])!;

			if (currentMinute >= lastEndMin) {
				const allDays = Object.values(coursesByDay).flat();
				const nextDayCourse = allDays.find((c) => c.day > day);

				if (nextDayCourse) {
					const daysUntil = nextDayCourse.day - day;
					const secondsUntilCourse =
						daysUntil * 86400 +
						parseTimeToMinute(nextDayCourse.timeText.split(" - ")[0])! * 60 -
						currentSecond;

					return [
						[{ text: "今日课毕", bold: true }],
						[
							{ text: "翌日首节：" },
							{
								text: `${nextDayCourse.courseName} - ${nextDayCourse.room}`,
								bold: true,
								color: nextDayCourse.color,
							},
						],
						[
							{ text: "距上课还有：" },
							{ text: formatDuration(secondsUntilCourse), bold: true },
						],
					];
				}

				return [[{ text: "今日课毕", bold: true }]];
			}

			// 第一节课前
			const firstCourse = courses[0];
			const firstStartMin = parseTimeToMinute(firstCourse.timeText.split(" - ")[0])!;
			const remainSeconds = firstStartMin * 60 - currentSecond;

			return [
				[{ text: "课前", bold: true }],
				[
					{ text: "首节：" },
					{
						text: `${firstCourse.courseName} - ${firstCourse.room}`,
						bold: true,
						color: firstCourse.color,
					},
				],
				[{ text: "距上课还有：" }, { text: formatDuration(remainSeconds), bold: true }],
			];
		},
		[getTodayCourses]
	);

	// 更新状态
	useEffect(() => {
		const currentWeek = resolveCurrentWeek(
			data.settings.startDate,
			data.settings.maxWeek
		);
		const viewModel = buildTimetableViewModel(data, currentWeek);

		const updateStatus = () => {
			const newStatusLines = resolveLiveState(viewModel);
			setStatusLines(newStatusLines);
			setLoaded(true);
		};

		updateStatus();
		const interval = setInterval(updateStatus, 1000);

		return () => clearInterval(interval);
	}, [data, resolveLiveState]);

	// 主题颜色
	const colors = {
		bg: isDark ? "bg-white/10" : "bg-white/80",
		border: isDark ? "border-white/20" : "border-gray-200",
		text: isDark ? "text-white" : "text-gray-800",
		textSecondary: isDark ? "text-white/70" : "text-gray-600",
		hover: isDark ? "hover:bg-white/20" : "hover:bg-gray-50",
	};

	return (
		<div
			onClick={handleClick}
			className={`w-full rounded-xl border backdrop-blur-md transition-all duration-300 cursor-pointer ${colors.bg} ${colors.border} ${colors.hover}`}
		>
			<div className="px-4 py-3">
				{loaded ? (
					<div className="space-y-1">
						{statusLines.map((line, lineIndex) => (
							<div key={lineIndex} className="flex flex-wrap items-center gap-1 text-sm">
								{line.map((segment, segIndex) => (
									<span
										key={segIndex}
										className={`transition-colors ${
											segment.bold ? "font-bold" : ""
										} ${segment.strikethrough ? "line-through opacity-60" : ""}`}
										style={{ color: segment.color || "inherit" }}
									>
										{segment.text}
									</span>
									))}
								</div>
							))}
						</div>
					) : (
						<div className="space-y-2 animate-pulse">
							<div className={`h-4 w-24 rounded ${isDark ? "bg-white/20" : "bg-gray-200"}`} />
							<div className={`h-3 w-48 rounded ${isDark ? "bg-white/10" : "bg-gray-100"}`} />
							<div className={`h-3 w-36 rounded ${isDark ? "bg-white/10" : "bg-gray-100"}`} />
						</div>
					)}
				</div>
			</div>
		);
}
