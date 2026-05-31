/**
 * 主题颜色配置
 * 浅色模式: #80A492 (青绿色)
 * 深色模式: #E18A3B (橙黄色)
 */

export const themeColors = {
    light: {
        primary: "#80A492",
        primaryHover: "#d4bc4a",
        primaryLight: "rgba(236, 212, 82, 0.1)",
        primaryMedium: "rgba(236, 212, 82, 0.3)",
    },
    dark: {
        primary: "#E18A3B",
        primaryHover: "#c97a32",
        primaryLight: "rgba(225, 138, 59, 0.1)",
        primaryMedium: "rgba(225, 138, 59, 0.3)",
    },
};

// 获取当前主题的颜色
export function getThemeColors(theme: "light" | "dark") {
    return themeColors[theme];
}
