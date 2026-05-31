// 课程表类型定义

export interface TimetableNodeTime {
    node: number;
    startTime: string;
    endTime: string;
}

export interface TimetableCourse {
    id: number;
    courseName: string;
    color: string;
}

export interface TimetableSchedule {
    id: number;
    day: number;
    startNode: number;
    step: number;
    startWeek: number;
    endWeek: number;
    room: string;
    teacher: string;
}

export interface TimetableWeekendDisplay {
    enabled: boolean;
    weeks: number[];
    days: string[];
}

export interface TimetableData {
    courseLen: number;
    id: number;
    name: string;
    timeTable: TimetableNodeTime[];
    settings: {
        tableName: string;
        maxWeek: number;
        nodes: number;
        startDate: string;
        showSat: boolean;
        showSun: boolean;
        weekendDisplay: TimetableWeekendDisplay;
    };
    courses: TimetableCourse[];
    schedules: TimetableSchedule[];
}

export interface TimetableCourseView {
    courseId: number;
    courseName: string;
    color: string;
    teacher: string;
    room: string;
    day: number;
    startNode: number;
    endNode: number;
    durationNodes: number;
    startWeek: number;
    endWeek: number;
    timeText: string;
}

export interface TimetableDayColumn {
    day: number;
    label: string;
}

export interface TimetableNodeRow {
    node: number;
    startTime: string;
    endTime: string;
}

export interface TimetableViewModel {
    tableName: string;
    maxWeek: number;
    currentWeek: number;
    weeks: number[];
    dayColumns: TimetableDayColumn[];
    nodeRows: TimetableNodeRow[];
    coursesByDay: Record<number, TimetableCourseView[]>;
}
