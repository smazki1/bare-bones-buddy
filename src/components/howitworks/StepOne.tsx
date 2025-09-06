import React from "react";
import { motion } from "framer-motion";
import { Camera } from "lucide-react";

/**
 * STEP 1 ONLY — Clean, standalone section
 * Desktop: images LEFT, card RIGHT
 * Mobile : card first, images below
 */

// --- Utilities ---
const normalizeGithubRaw = (url: string) => {
  if (!url) return url;
  if (url.includes("github.com") && url.includes("/blob/")) {
    const parts = url.replace(/^https?:\/\//, "").split("/");
    if (parts.length > 5 && parts[0] === "github.com") {
      const user = parts[1];
      const repo = parts[2];
      const commit = parts[4];
      const path = parts.slice(5).join("/");
      return `https://raw.githubusercontent.com/${user}/${repo}/${commit}/${path}`;
    }
  }
  return url;
};

// Demo image (you can swap later)
const DEMO_IMG = normalizeGithubRaw(
  "https://github.com/smazki1/images-stocks-/blob/7ec8efa4060c86fe6f871104412a8882478c9b7e/21706353-0.jpg"
);

const COLORS = {
  primary: "#8b1e3f",
  secondary: "#f3752b",
  background: "#f3f4f6",
  text: "#1f2937",
  card: "#ffffff",
};

// --- New visual card for the "Vertical Stack" layout ---
type StackedCardProps = { idx: number; label: string; url?: string };
const StackedCard: React.FC<StackedCardProps> = ({ idx, label, url }) => {
  // A clean, centered, vertically stacked layout (3 cards)
  const positions: { y: number; scale: number; zIndex: number }[] = [
    { y: 0, scale: 1.0, zIndex: 3 },
    { y: 80, scale: 0.95, zIndex: 2 },
    { y: 160, scale: 0.9, zIndex: 1 },
  ];
  const { y, scale, zIndex } = positions[idx];
  const src = url || DEMO_IMG;

  return (
    <motion.div
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-56 md:w-48 md:h-64 rounded-lg overflow-hidden shadow-2xl border-4"
      style={{ backgroundColor: COLORS.card, borderColor: COLORS.card, transformOrigin: 'center center' }}
      initial={{ scale: 0.5, opacity: 0, y: 100 }}
      animate={{ scale, opacity: 1, y, zIndex, transition: { type: 'spring', stiffness: 120, damping: 20, delay: idx * 0.1 } }}
      whileHover={{ zIndex: 4, scale: 1.05, y: y - 10, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', transition: { type: 'spring', stiffness: 300, damping: 20 } }}
    >
      <img src={src} alt={label} className="w-full h-full object-contain bg-white" />
    </motion.div>
  );
};

const StepOne: React.FC = () => {
  // Use first 3 of the provided images for a clean vertical stack
  const images = [
    { label: "טלפון #1", url: normalizeGithubRaw("https://github.com/smazki1/images-stocks-/blob/c954d8e20f1323083129aef2032f662899812414/PHOTO-2025-05-22-22-13-52.jpg") },
    { label: "תוצאה #1", url: normalizeGithubRaw("https://github.com/smazki1/images-stocks-/blob/c954d8e20f1323083129aef2032f662899812414/PHOTO-2025-05-22-22-13-51.jpg") },
    { label: "תוצאה #2", url: normalizeGithubRaw("https://github.com/smazki1/images-stocks-/blob/c954d8e20f1323083129aef2032f662899812414/PHOTO-2025-05-22-22-13-51%202.jpg") },
    { label: "תוצאה #3", url: normalizeGithubRaw("https://github.com/smazki1/images-stocks-/blob/c954d8e20f1323083129aef2032f662899812414/PHOTO-2025-05-22-22-13-50.jpg") },
  ];

  return (
    <section style={{ backgroundColor: COLORS.background }} className="py-16 md:py-24 font-sans">
      <div className="container mx-auto px-4">

        {/* 2-col layout: Mobile order = card first, images second */}
        <div className="grid grid-cols-1 md:grid-cols-2 md:gap-16 lg:gap-24 items-center">
          {/* Images (LEFT on desktop, SECOND on mobile) - 2x2 GRID LAYOUT */}
          <div className="order-2 md:order-1 flex items-center justify-center py-10 md:py-0">
            <div className="grid grid-cols-2 gap-4 md:gap-5">
              {images.map((img, i) => (
                <motion.div
                  key={i}
                  className="w-36 h-52 md:w-40 md:h-56 rounded-lg overflow-hidden shadow-2xl border-4 p-2 pb-6"
                  style={{ backgroundColor: COLORS.card, borderColor: COLORS.card }}
                  initial={{ opacity: 0, y: 50, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 100, damping: 20, delay: i * 0.15 } }}
                  whileHover={{ scale: 1.05, zIndex: 10, y: -5, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2), 0 10px 10px -5px rgba(0,0,0,0.1)' }}
                >
                  <img src={img.url} alt={img.label} className="w-full h-full object-cover rounded-sm" />
                </motion.div>
              ))}
            </div>
          </div>

          {/* Card (RIGHT on desktop, FIRST on mobile) */}
          <div className="order-1 md:order-2">
            <div className="p-6 md:p-8 rounded-2xl" style={{ backgroundColor: COLORS.card, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.1)" }}>
              <div className="flex items-center mb-4 gap-4">
                <div className="flex-shrink-0 w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: COLORS.primary }}>
                  <Camera className="w-6 h-6 md:w-8 md:h-8" style={{ color: COLORS.card }} />
                </div>
                <h3 className="text-xl md:text-3xl font-bold" style={{ color: COLORS.primary }}>
                  הנוסחה המנצחת: הכל מתחיל בקליק
                </h3>
              </div>
              <p className="text-base md:text-lg leading-relaxed" style={{ color: COLORS.text, opacity: 0.9 }}>
                אתם שולחים 10-15 תמונות פשוטות של המוצר או השירות, מזוויות ותאורות שונות. לא צריך ציוד מקצועי, רק סמארטפון. המגוון הזה הוא חומר הגלם לקסם שאנחנו יוצרים.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StepOne;


