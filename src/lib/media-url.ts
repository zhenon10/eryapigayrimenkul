// İstemci tarafında da kullanılabilmesi için sunucu bağımlılığı olmayan yardımcılar.
export type ImageSize = "sm" | "md" | "lg";

export type ImageRef = { key: string; width: number; height: number; alt: string };

export const mediaUrl = (key: string, size: ImageSize = "md") => `/media/${key}-${size}.webp`;

export const mediaSrcSet = (key: string) =>
  `${mediaUrl(key, "sm")} 480w, ${mediaUrl(key, "md")} 1024w, ${mediaUrl(key, "lg")} 1920w`;
