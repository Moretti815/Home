/**
 * Icefox card component.
 */
"use client";

import { useState, type MouseEvent } from "react";
import { motion } from "framer-motion";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { useThemeStore } from "../../stores/theme-store";
import {
  formatCount,
  formatFullDate,
  formatRelativeTime,
  getPostCommentsCount,
  getPostViews,
  normalizeContent,
  normalizeMedia,
  toTimestamp,
} from "../../utils/icefox";
import type { IcefoxComment, IcefoxPost } from "../../types/icefox";

interface IcefoxCardProps {
  post: IcefoxPost;
  index: number;
  effectsEnabled: boolean;
  minutesAgo?: string;
  hoursAgo?: string;
  daysAgo?: string;
}

const getCardVariants = (index: number) => ({
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 15,
      delay: index * 0.05,
    },
  },
});

function extractImageSources(html: string): string[] {
  const imageSources: string[] = [];
  const imageRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
  let match;

  while ((match = imageRegex.exec(html)) !== null) {
    imageSources.push(match[1]);
  }

  return imageSources;
}

function uniqueUrls(urls: Array<string | undefined | null>): string[] {
  const urlSet = new Set<string>();

  urls.forEach((url) => {
    if (url?.trim()) urlSet.add(url.trim());
  });

  return Array.from(urlSet);
}

function CommentList({ comments, level = 0, isDark }: { comments: IcefoxComment[]; level?: number; isDark: boolean }) {
  return (
    <div className={level === 0 ? "space-y-3" : "mt-3 space-y-3"}>
      {comments.map((comment) => {
        const commentDate = formatFullDate(comment.created);
        const commentTimestamp = toTimestamp(comment.created);

        return (
          <div
            key={comment.coid}
            className={level > 0 ? `ml-4 border-l pl-3 ${isDark ? "border-white/10" : "border-black/10"}` : ""}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                {comment.url ? (
                  <a
                    href={comment.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`text-xs font-semibold ${isDark ? "text-white/80" : "text-black/75"}`}
                  >
                    {comment.author || "Anonymous"}
                  </a>
                ) : (
                  <span className={`text-xs font-semibold ${isDark ? "text-white/80" : "text-black/75"}`}>
                    {comment.author || "Anonymous"}
                  </span>
                )}
                <p className={`mt-1 text-sm break-words ${isDark ? "text-white/70" : "text-black/70"}`}>
                  {comment.text}
                </p>
              </div>
              {commentTimestamp > 0 && (
                <time
                  dateTime={new Date(commentTimestamp).toISOString()}
                  title={commentDate}
                  className={`shrink-0 text-[11px] ${isDark ? "text-white/40" : "text-black/40"}`}
                >
                  {commentDate}
                </time>
              )}
            </div>

            {comment.replies && comment.replies.length > 0 && (
              <CommentList comments={comment.replies} level={level + 1} isDark={isDark} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function IcefoxCard({
  post,
  index,
  effectsEnabled,
  minutesAgo = "分钟前",
  hoursAgo = "小时前",
  daysAgo = "天前",
}: IcefoxCardProps) {
  const { theme } = useThemeStore();
  const isDark = theme === "dark";
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const relativeTime = formatRelativeTime(post.created, minutesAgo, hoursAgo, daysAgo);
  const fullDate = formatFullDate(post.created);
  const timestamp = toTimestamp(post.created);
  const videos = normalizeMedia(post.video);
  const musicTracks = normalizeMedia(post.music);
  const comments = post.comments ?? [];
  const linkCardUrl = post.linkCard?.url || post.linkCard?.link;
  const content = normalizeContent(post.content);
  const contentImages = extractImageSources(content);
  const postImages = post.images ?? [];
  const lightboxImageUrls = uniqueUrls([...contentImages, ...postImages]);
  const extraImages = postImages.filter((image) => !contentImages.includes(image));
  const lightboxSlides = lightboxImageUrls.map((image) => ({ src: image }));

  const openLightbox = (imageUrl: string) => {
    const imageIndex = lightboxImageUrls.indexOf(imageUrl);
    if (imageIndex < 0) return;
    setLightboxIndex(imageIndex);
    setLightboxOpen(true);
  };

  const handleContentClick = (event: MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    const image = target.closest("img") as HTMLImageElement | null;
    if (!image?.src) return;
    event.preventDefault();
    openLightbox(image.getAttribute("src") || image.src);
  };

  return (
    <>
    <motion.article
      variants={effectsEnabled ? getCardVariants(index) : undefined}
      initial={effectsEnabled ? "hidden" : "visible"}
      animate="visible"
      className={`icefox-card group relative rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
        isDark
          ? "bg-[#141824] border border-white/10 hover:border-white/20"
          : "bg-white border border-black/10 hover:border-black/20"
      } ${post.isTop ? "ring-2 ring-purple-500/50" : ""} ${post.isAd ? "border-amber-400/50" : ""}`}
    >
      <div className="p-5">
        {(post.isTop || post.isAd) && (
          <div className="mb-3 flex flex-wrap gap-2">
            {post.isTop && (
              <span className="inline-flex items-center gap-1 rounded-lg bg-purple-500/20 px-2 py-1 text-xs text-purple-400">
                <i className="fas fa-thumbtack"></i>
                <span>置顶</span>
              </span>
            )}
            {post.isAd && (
              <span className="inline-flex items-center gap-1 rounded-lg bg-amber-500/20 px-2 py-1 text-xs text-amber-500">
                <i className="fas fa-bullhorn"></i>
                <span>广告</span>
              </span>
            )}
          </div>
        )}

        <div
          className={`prose prose-sm max-w-none whitespace-pre-wrap break-words [&_img]:cursor-pointer ${
            isDark ? "prose-invert" : ""
          }`}
          onClick={handleContentClick}
          dangerouslySetInnerHTML={{ __html: content }}
        />

        {extraImages.length > 0 && (
          <div className={`mt-4 grid gap-2 ${extraImages.length === 1 ? "grid-cols-1 max-w-[360px]" : "grid-cols-2 sm:grid-cols-3"}`}>
            {extraImages.map((image, imageIndex) => (
              <button
                key={`${image}-${imageIndex}`}
                type="button"
                className="relative aspect-square overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800"
                onClick={() => openLightbox(image)}
              >
                <img
                  src={image}
                  alt={`icefox image ${imageIndex + 1}`}
                  className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                  loading="lazy"
                  decoding="async"
                />
              </button>
            ))}
          </div>
        )}

        {videos.length > 0 && (
          <div className="mt-4 space-y-3">
            {videos.map((video, videoIndex) => (
              video.url ? (
                <video
                  key={`${video.url}-${videoIndex}`}
                  src={video.url}
                  poster={video.poster}
                  controls
                  className="w-full rounded-lg bg-black"
                />
              ) : null
            ))}
          </div>
        )}

        {musicTracks.length > 0 && (
          <div className="mt-4 space-y-2">
            {musicTracks.map((track, trackIndex) => (
              <div
                key={`${track.url || track.title || "music"}-${trackIndex}`}
                className={`rounded-lg border p-3 ${isDark ? "border-white/10 bg-white/[0.03]" : "border-black/10 bg-black/[0.02]"}`}
              >
                <div className="flex items-center gap-3">
                  {track.cover && (
                    <img
                      src={track.cover}
                      alt={track.title || "music cover"}
                      className="h-10 w-10 rounded-md object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className={`truncate text-sm font-medium ${isDark ? "text-white/85" : "text-black/80"}`}>
                      {track.title || "Music"}
                    </p>
                    {track.artist && (
                      <p className={`truncate text-xs ${isDark ? "text-white/50" : "text-black/50"}`}>
                        {track.artist}
                      </p>
                    )}
                  </div>
                </div>
                {track.url && (
                  <audio src={track.url} controls className="mt-3 w-full" />
                )}
              </div>
            ))}
          </div>
        )}

        {post.linkCard && linkCardUrl && (
          <a
            href={linkCardUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`mt-4 flex items-center gap-3 rounded-lg border p-3 transition-colors ${
              isDark
                ? "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"
                : "border-black/10 bg-black/[0.02] hover:bg-black/[0.04]"
            }`}
          >
            {post.linkCard.icon && (
              <img
                src={post.linkCard.icon}
                alt=""
                className="h-10 w-10 shrink-0 rounded-lg object-cover"
                loading="lazy"
                decoding="async"
              />
            )}
            <div className="min-w-0 flex-1">
              <p className={`truncate text-sm font-semibold ${isDark ? "text-white/85" : "text-black/80"}`}>
                {post.linkCard.title || linkCardUrl}
              </p>
              {post.linkCard.description && (
                <p className={`mt-0.5 line-clamp-2 text-xs ${isDark ? "text-white/55" : "text-black/55"}`}>
                  {post.linkCard.description}
                </p>
              )}
              {post.linkCard.url && (
                <p className={`mt-1 truncate text-[11px] ${isDark ? "text-white/35" : "text-black/35"}`}>
                  {post.linkCard.url}
                </p>
              )}
            </div>
            <i className={`fas fa-arrow-up-right-from-square text-xs ${isDark ? "text-white/40" : "text-black/40"}`}></i>
          </a>
        )}

        {(post.tags?.length || post.position) && (
          <div className="mt-4 flex flex-wrap gap-2">
            {post.position && (
              post.position.url ? (
                <a
                  href={post.position.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs ${
                    isDark ? "bg-sky-500/15 text-sky-300" : "bg-sky-100 text-sky-700"
                  }`}
                >
                  <i className="fas fa-map-marker-alt text-[10px]"></i>
                  {post.position.name}
                </a>
              ) : (
                <span
                  className={`inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs ${
                    isDark ? "bg-sky-500/15 text-sky-300" : "bg-sky-100 text-sky-700"
                  }`}
                >
                  <i className="fas fa-map-marker-alt text-[10px]"></i>
                  {post.position.name}
                </span>
              )
            )}

            {post.tags?.map((tag) => (
              tag.permalink ? (
                <a
                  key={tag.slug || tag.name}
                  href={tag.permalink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs ${
                    isDark
                      ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                      : "bg-purple-100 text-purple-700 border border-purple-200"
                  }`}
                >
                  <i className="fas fa-hashtag text-[10px]"></i>
                  {tag.name}
                </a>
              ) : (
                <span
                  key={tag.slug || tag.name}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs ${
                    isDark
                      ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                      : "bg-purple-100 text-purple-700 border border-purple-200"
                  }`}
                >
                  <i className="fas fa-hashtag text-[10px]"></i>
                  {tag.name}
                </span>
              )
            ))}
          </div>
        )}

        <hr className={`border-t my-4 ${isDark ? "border-white/5" : "border-black/5"}`} />

        <div
          className={`flex items-center justify-between gap-3 text-xs flex-wrap ${
            isDark ? "text-white/50" : "text-black/50"
          }`}
        >
          <div className="flex items-center gap-1.5">
            <i className="fas fa-clock text-xs"></i>
            {timestamp > 0 ? (
              <time dateTime={new Date(timestamp).toISOString()} title={fullDate}>
                {relativeTime || fullDate}
              </time>
            ) : (
              <span>{post.created}</span>
            )}
          </div>

          <div className="flex items-center gap-4">
            {post.permalink && (
              <a
                href={post.permalink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 hover:text-purple-500"
              >
                <i className="fas fa-link text-xs"></i>
                <span>原文</span>
              </a>
            )}
            <span className="inline-flex items-center gap-1">
              <i className="fas fa-eye text-xs"></i>
              {formatCount(getPostViews(post))}
            </span>
            <span className="inline-flex items-center gap-1">
              <i className="fas fa-heart text-xs"></i>
              {formatCount(post.likesCount)}
            </span>
            <span className="inline-flex items-center gap-1">
              <i className="fas fa-comment text-xs"></i>
              {formatCount(getPostCommentsCount(post))}
            </span>
          </div>
        </div>

        {comments.length > 0 && (
          <div className={`mt-4 rounded-lg border p-3 ${isDark ? "border-white/10 bg-white/[0.02]" : "border-black/10 bg-black/[0.02]"}`}>
            <div className={`mb-3 flex items-center gap-2 text-sm font-medium ${isDark ? "text-white/75" : "text-black/75"}`}>
              <i className="fas fa-comments text-xs"></i>
              <span>评论</span>
              <span className={isDark ? "text-white/40" : "text-black/40"}>
                {formatCount(getPostCommentsCount(post))}
              </span>
            </div>
            <CommentList comments={comments} isDark={isDark} />
          </div>
        )}
      </div>

      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-xl"></div>
    </motion.article>
    <Lightbox
      open={lightboxOpen}
      close={() => setLightboxOpen(false)}
      slides={lightboxSlides}
      index={lightboxIndex}
      carousel={{ finite: lightboxSlides.length <= 1 }}
      render={{ buttonPrev: lightboxSlides.length <= 1 ? () => null : undefined, buttonNext: lightboxSlides.length <= 1 ? () => null : undefined }}
    />
    </>
  );
}
