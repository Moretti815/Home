/**
 * Next.js 应用配置文件
 * 包含输出模式、图片域名白名单、安全头配置等
 */
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    // 输出模式：standalone 适用于 Docker 容器化部署
    output: 'standalone',

    // 图片域名白名单配置
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'trae-api-cn.mchost.guru',
                pathname: '/api/ide/v1/text_to_image/**',
            },
            {
                protocol: 'https',
                hostname: 'img.wkds.eu.org',
                pathname: '/**',
            },
        ],
        // 禁用图片优化（解决私有IP问题）
        unoptimized: true,
    },

    // HTTP 安全头配置
    async headers() {
        return [
            {
                source: '/:path*',
                headers: [
                    // 防止页面被 iframe 嵌套，防御点击劫持攻击
                    {
                        key: 'X-Frame-Options',
                        value: 'DENY',
                    },
                    // 防止 MIME 类型嗅探，增强安全性
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff',
                    },
                    // 启用浏览器 XSS 过滤器
                    {
                        key: 'X-XSS-Protection',
                        value: '1; mode=block',
                    },
                    // 控制引用来源信息，保护隐私
                    {
                        key: 'Referrer-Policy',
                        value: 'strict-origin-when-cross-origin',
                    },
                    // 禁用浏览器权限（摄像头、麦克风、地理位置）
                    {
                        key: 'Permissions-Policy',
                        value: 'camera=(), microphone=(), geolocation=()',
                    },
                    // 内容安全策略：控制资源加载来源
                    // - script-src: 脚本来源（包含百度统计、Vercel 脚本、Giscus、Friend Circle Lite CDN）
                    // - style-src: 样式来源（包含 Friend Circle Lite CDN）
                    // - img-src: 图片来源（包含 Waline 表情包、百度分享、Friend Circle Lite）
                    // - connect-src: 网络请求来源（包含 Friend Circle Lite API）
                    // - frame-src: 允许嵌入的 iframe 来源（Giscus）
                    {
                        key: 'Content-Security-Policy',
                        value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' va.vercel-scripts.com http://push.zhanzhang.baidu.com https://zz.bdstatic.com https://giscus.app https://fastly.jsdelivr.net; style-src 'self' 'unsafe-inline' https://giscus.app https://fastly.jsdelivr.net; img-src 'self' data: https: blob: http://unpkg.com https://unpkg.com http://api.share.baidu.com https://api.share.baidu.com https://pic.imgdb.cn; font-src 'self' data:; connect-src 'self' https: http://unpkg.com https://unpkg.com https://fc-lite.268682.xyz; frame-src 'self' https://giscus.app; frame-ancestors 'none';",
                    },
                ],
            },
        ];
    },
};

export default nextConfig;
