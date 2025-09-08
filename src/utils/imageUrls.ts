// Utilities to optimize Supabase Storage image delivery via the Render endpoint
// Docs: https://supabase.com/docs/guides/storage/image-transformations

const PROJECT_HOST = "https://uvztokbjkaosjxnziizt.supabase.co";

export function isSupabasePublicUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return (
      u.origin === PROJECT_HOST &&
      u.pathname.startsWith("/storage/v1/object/public/")
    );
  } catch {
    return false;
  }
}

// Convert an object/public URL to render/image/public with width/quality params
export function toSupabaseRenderUrl(
  url: string,
  opts: { width?: number; quality?: number; format?: string } = {}
): string {
  try {
    const u = new URL(url);
    if (!isSupabasePublicUrl(url)) return url; // fallback

    // Transform path: /storage/v1/object/public/<bucket>/<path>
    // -> /storage/v1/render/image/public/<bucket>/<path>
    const pathAfterPublic = u.pathname.split("/storage/v1/object/public/")[1];
    const renderPath = `/storage/v1/render/image/public/${pathAfterPublic}`;
    const renderUrl = new URL(renderPath, PROJECT_HOST);

    if (opts.width) renderUrl.searchParams.set("width", String(opts.width));
    if (opts.quality) renderUrl.searchParams.set("quality", String(opts.quality));
    // auto format to webp/avif when possible
    renderUrl.searchParams.set("resize", "contain");

    return renderUrl.toString();
  } catch {
    return url;
  }
}

export function buildSupabaseSrcSet(
  url: string,
  widths: number[] = [400, 600, 900, 1200],
  quality = 75
): string | undefined {
  if (!isSupabasePublicUrl(url)) return undefined;
  const parts = widths.map((w) => `${toSupabaseRenderUrl(url, { width: w, quality })} ${w}w`);
  return parts.join(", ");
}

export function optimalWidthForSize(size?: "small" | "medium" | "large"): number {
  switch (size) {
    case "small":
      return 640;
    case "large":
      return 1280;
    case "medium":
    default:
      return 960;
  }
}
