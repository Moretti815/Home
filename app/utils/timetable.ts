// 课程表数据处理工具

import type {
	TimetableData,
	TimetableCourse,
	TimetableSchedule,
	TimetableNodeTime,
	TimetableCourseView,
	TimetableDayColumn,
	TimetableNodeRow,
	TimetableViewModel,
} from "../types/timetable";

const WEEKDAY_LABELS: Record<number, string> = {
	1: "周一",
	2: "周二",
	3: "周三",
	4: "周四",
	5: "周五",
	6: "周六",
	7: "周日",
};

// 解析 ARGB 颜色为 RGB
export function parseArgbColor(raw: string): string | null {
	if (!raw || !raw.startsWith("#")) return null;
	if (raw.length === 9) {
		// ARGB 格式 #AARRGGBB
		const r = raw.slice(3, 5);
		const g = raw.slice(5, 7);
		const b = raw.slice(7, 9);
		return `#${r}${g}${b}`;
	}
	if (raw.length === 7) {
		// RGB 格式 #RRGGBB
		return raw;
	}
	return null;
}

// 计算当前周
export function resolveCurrentWeek(
	startDateText: string,
	maxWeek: number,
	now: Date = new Date()
): number {
	const parts = startDateText.split("-").map((p) => Number(p));
	if (parts.length !== 3 || parts.some((p) => !Number.isFinite(p))) {
		return 1;
	}
	const [year, month, day] = parts;
	const startDate = new Date(year, month - 1, day);

	const msPerDay = 24 * 60 * 60 * 1000;
	const diffDays = Math.floor((now.getTime() - startDate.getTime()) / msPerDay);
	const week = Math.floor(diffDays / 7) + 1;

	if (week < 1) return 1;
	if (week > maxWeek) return maxWeek;
	return week;
}

// 检查某周是否显示周末
export function shouldShowWeekend(
	data: TimetableData,
	week: number
): { showSat: boolean; showSun: boolean } {
	const { settings } = data;
	const weekendDisplay = settings.weekendDisplay;

	// 如果没有启用周末特殊显示，使用默认设置
	if (!weekendDisplay?.enabled) {
		return {
			showSat: settings.showSat,
			showSun: settings.showSun,
		};
	}

	// 检查当前周是否在允许的周列表中
	const isAllowedWeek = weekendDisplay.weeks.includes(week);
	const showSat =
		isAllowedWeek &&
		weekendDisplay.days.includes("sat") &&
		settings.showSat;
	const showSun =
		isAllowedWeek &&
		weekendDisplay.days.includes("sun") &&
		settings.showSun;

	return { showSat, showSun };
}

// 构建课程表视图模型
export function buildTimetableViewModel(
	data: TimetableData,
	selectedWeek: number
): TimetableViewModel {
	const { settings, timeTable, courses, schedules } = data;
	const maxWeek = Math.max(1, settings.maxWeek || 1);
	const week = Math.min(Math.max(1, selectedWeek), maxWeek);

	// 判断当前周是否显示周末
	const { showSat, showSun } = shouldShowWeekend(data, week);

	// 构建星期列
	const dayColumns: TimetableDayColumn[] = [
		{ day: 1, label: WEEKDAY_LABELS[1] },
		{ day: 2, label: WEEKDAY_LABELS[2] },
		{ day: 3, label: WEEKDAY_LABELS[3] },
		{ day: 4, label: WEEKDAY_LABELS[4] },
		{ day: 5, label: WEEKDAY_LABELS[5] },
	];

	if (showSat) {
		dayColumns.push({ day: 6, label: WEEKDAY_LABELS[6] });
	}
	if (showSun) {
		dayColumns.push({ day: 7, label: WEEKDAY_LABELS[7] });
	}

	// 构建节次行
	const nodeRows: TimetableNodeRow[] = timeTable
		.filter((item) => item.node >= 1 && item.node <= settings.nodes)
		.sort((a, b) => a.node - b.node)
		.map((item) => ({
			node: item.node,
			startTime: item.startTime,
			endTime: item.endTime,
		}));

	// 构建课程映射
	const courseMap = new Map(courses.map((c) => [c.id, c]));

	// 按天分组课程
	const coursesByDay: Record<number, TimetableCourseView[]> = {};
	for (const column of dayColumns) {
		coursesByDay[column.day] = [];
	}

	for (const schedule of schedules) {
		if (schedule.day < 1 || schedule.day > 7) continue;
		if (week < schedule.startWeek || week > schedule.endWeek) continue;
		if (!(schedule.day in coursesByDay)) continue;

		const courseDef = courseMap.get(schedule.id);
		const courseName = courseDef?.courseName ?? `课程 #${schedule.id}`;
		const color = parseArgbColor(courseDef?.color ?? "") || "#666666";

		const startNode = schedule.startNode;
		const endNode = startNode + schedule.step - 1;
		const startNodeTime = nodeRows.find((n) => n.node === startNode);
		const endNodeTime = nodeRows.find((n) => n.node === endNode);

		const timeText = startNodeTime
			? `${startNodeTime.startTime} - ${endNodeTime?.endTime || startNodeTime.endTime}`
			: "";

		const courseView: TimetableCourseView = {
			courseId: schedule.id,
			courseName,
			color,
			teacher: schedule.teacher?.trim() || "未填写",
			room: schedule.room?.trim() || "未填写",
			day: schedule.day,
			startNode,
			endNode,
			durationNodes: schedule.step,
			startWeek: schedule.startWeek,
			endWeek: schedule.endWeek,
			timeText,
		};

		coursesByDay[schedule.day].push(courseView);
	}

	// 排序课程
	for (const day of Object.keys(coursesByDay)) {
		coursesByDay[Number(day)].sort(
			(a, b) => a.startNode - b.startNode || a.courseName.localeCompare(b.courseName)
		);
	}

	return {
		tableName: settings.tableName || "课表",
		maxWeek,
		currentWeek: week,
		weeks: Array.from({ length: maxWeek }, (_, i) => i + 1),
		dayColumns,
		nodeRows,
		coursesByDay,
	};
}

// 获取今天的课程
export function getTodayCourses(
	coursesByDay: Record<number, TimetableCourseView[]>,
	now: Date = new Date()
): TimetableCourseView[] {
	const day = now.getDay() === 0 ? 7 : now.getDay();
	return coursesByDay[day] || [];
}

// 获取下一周第一节课
export function getNextWeekFirstCourse(
	coursesByDay: Record<number, TimetableCourseView[]>,
	currentWeek: number,
	maxWeek: number
): { course: TimetableCourseView; weekDiff: number } | null {
	// 如果当前不是最后一周，找下一周周一第一节课
	if (currentWeek < maxWeek) {
		const nextWeekCourses = coursesByDay[1]; // 周一
		if (nextWeekCourses && nextWeekCourses.length > 0) {
			return { course: nextWeekCourses[0], weekDiff: 1 };
		}
	}
	return null;
}

// 解析时间字符串为分钟数
export function parseTimeToMinute(text: string): number | null {
	const parts = String(text || "").split(":");
	if (parts.length !== 2) return null;
	const hour = Number(parts[0]);
	const minute = Number(parts[1]);
	if (!Number.isFinite(hour) || !Number.isFinite(minute)) return null;
	return hour * 60 + minute;
}

// 提取时间范围
export function extractRangeMinutes(
	timeText: string
): { startMinute: number; endMinute: number } | null {
	const match = String(timeText || "").match(/(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/);
	if (!match) return null;
	const startMinute = parseTimeToMinute(match[1]);
	const endMinute = parseTimeToMinute(match[2]);
	if (startMinute === null || endMinute === null) return null;
	return { startMinute, endMinute };
}

// 格式化持续时间
export function formatDuration(totalSeconds: number): string {
	const safeSecs = Math.max(0, Math.floor(totalSeconds));
	const days = Math.floor(safeSecs / 86400);
	const hours = Math.floor((safeSecs % 86400) / 3600);
	const minutes = Math.floor((safeSecs % 3600) / 60);
	const seconds = safeSecs % 60;

	const parts: string[] = [];
	if (days > 0) parts.push(`${days}天`);
	if (hours > 0) parts.push(`${hours}时`);
	if (minutes > 0) parts.push(`${minutes}分钟`);
	if (seconds > 0 || parts.length === 0) parts.push(`${seconds}秒`);

	return parts.join("，");
}
