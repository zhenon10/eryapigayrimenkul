import { mediaSrcSet, mediaUrl, type ImageRef } from "@/lib/media-url";

type Props = {
  image: ImageRef;
  sizes: string;
  className?: string;
  alt?: string;
  priority?: boolean;
};

/**
 * Yükleme sırasında üretilen WebP varyantlarını srcset ile sunar. next/image yerine
 * düz <img>: görseller zaten optimize edildiği için ikinci bir işleme gerek yok.
 */
export function MediaImage({ image, sizes, className, alt, priority }: Props) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={mediaUrl(image.key, "md")}
      srcSet={mediaSrcSet(image.key)}
      sizes={sizes}
      width={image.width}
      height={image.height}
      alt={alt ?? image.alt}
      className={className}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : undefined}
      decoding="async"
    />
  );
}
