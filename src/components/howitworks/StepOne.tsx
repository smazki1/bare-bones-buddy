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

// --- Visual card for the "fan" layout ---
const FanCard: React.FC<{ idx: number; total: number; label: string; url?: string }> = ({ idx, total, label, url }) => {
  const angle = (idx - (total - 1) / 2) * 12; // spread
  const src = url || DEMO_IMG;
  return (
    <motion.div
      className="absolute w-28 h-40 md:w-32 md:h-48 rounded-lg overflow-hidden shadow-2xl border-4"
      style={{ originX: "50%", originY: "150%", backgroundColor: COLORS.card, borderColor: COLORS.card }}
      initial={{ scale: 0.5, opacity: 0, rotate: angle, y: 140 }}
      animate={{ scale: 1, opacity: 1, rotate: angle, y: 0, transition: { type: "spring", stiffness: 160, damping: 20, delay: idx * 0.08 } }}
      whileHover={{ y: -10, scale: 1.05, transition: { type: "spring", stiffness: 300, damping: 16 } }}
    >
      <img src={src} alt={label} className="w-full h-full object-cover" />
      <div className="absolute top-1 right-1 text-white text-[10px] px-1.5 py-0.5 rounded" style={{ backgroundColor: COLORS.secondary }}>
        {label}
      </div>
    </motion.div>
  );
};

const StepOne: React.FC = () => {
  const images = [
    { label: "טלפון #1", url: DEMO_IMG },
    { label: "תוצאה #1", url: DEMO_IMG },
    { label: "תוצאה #2", url: DEMO_IMG },
    { label: "תוצאה #3", url: DEMO_IMG },
  ];

  return (
    <section style={{ backgroundColor: COLORS.background }} className="py-16 md:py-24 font-sans">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-10 md:mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-3" style={{ color: COLORS.primary }}>מצילום בטלפון לסטודיו מקצועי</h2>
          <p className="text-lg md:text-xl max-w-2xl mx-auto" style={{ color: COLORS.text, opacity: 0.8 }}>התהליך השקוף שלנו שחוסך לכם זמן, כסף ועצבים</p>
        </div>

        {/* 2-col layout: Mobile order = card first, images second */}
        <div className="grid grid-cols-1 md:grid-cols-2 md:gap-16 lg:gap-24 items-start">
          {/* Images (LEFT on desktop, SECOND on mobile) */}
          <div className="order-2 md:order-1 flex items-center justify-center py-10 md:py-0">
            <div className="relative" style={{ width: 640, height: 420, maxWidth: "90vw", maxHeight: "70vh" }}>
              {images.map((img, i) => (
                <FanCard key={i} idx={i} total={images.length} label={img.label} url={img.url} />
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


