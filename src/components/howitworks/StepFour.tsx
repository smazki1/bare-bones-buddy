import React from "react";
import { motion } from "framer-motion";
import { Rocket } from "lucide-react";

/**
 * STEP 4 ONLY — Clean, standalone section
 * Desktop: 4-image gallery LEFT, single info card RIGHT
 * Mobile : single info card first, 4-image gallery below
 */

// --- Utilities ---
const normalizeGithubRaw = (url: string) => {
  if (!url) return url;
  if (url.includes("github.com") && url.includes("/blob/")) {
    // Converts a GitHub blob URL to its raw content URL
    return url.replace("github.com", "raw.githubusercontent.com").replace("/blob/", "/");
  }
  return url;
};

// Demo images (can be replaced later)
const DEMO_FINAL_IMG = normalizeGithubRaw(
  "https://github.com/smazki1/images-stocks-/blob/550dc93d54426ae879504ae38af795c3ac368ffd/29779915-2.jpg"
);
const DEMO_FINAL_IMG_2 = normalizeGithubRaw(
  "https://github.com/smazki1/images-stocks-/blob/550dc93d54426ae879504ae38af795c3ac368ffd/26889960-2.jpg"
);
const DEMO_FINAL_IMG_3 = normalizeGithubRaw(
  "https://github.com/smazki1/images-stocks-/blob/550dc93d54426ae879504ae38af795c3ac368ffd/29780131-2.jpg"
);
const DEMO_FINAL_IMG_4 = normalizeGithubRaw(
  "https://github.com/smazki1/images-stocks-/blob/550dc93d54426ae879504ae38af795c3ac368ffd/29780125-1.jpg"
);

const COLORS = {
  primary: "#8b1e3f",
  secondary: "#f3752b",
  background: "#f3f4f6",
  text: "#1f2937",
  card: "#ffffff",
};

const SingleCard: React.FC<{
  url?: string;
  label?: string;
  animationDelay?: number;
}> = ({ url = DEMO_FINAL_IMG, label = "התוצאה", animationDelay = 0 }) => (
  <motion.div
    className="relative w-32 h-48 md:w-40 md:h-56 rounded-lg overflow-hidden shadow-lg border-4"
    style={{ backgroundColor: COLORS.card, borderColor: COLORS.card }}
    initial={{ scale: 0.8, opacity: 0, y: 50 }}
    animate={{
      scale: 1,
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 170, damping: 22, delay: animationDelay },
    }}
    whileHover={{
      scale: 1.05,
      y: -10,
      zIndex: 10,
      transition: { type: "spring", stiffness: 300, damping: 20 },
    }}
  >
    <img src={url} alt={label} className="w-full h-full object-cover" />
    <div
      className="absolute top-1 right-1 text-white text-xs px-1.5 py-0.5 rounded"
      style={{ backgroundColor: COLORS.secondary }}
    >
      {label}
    </div>
  </motion.div>
);

const StepFour: React.FC = () => {
  return (
    <section style={{ backgroundColor: COLORS.background }} className="py-16 md:py-24 font-sans" dir="rtl">
      <div className="container mx-auto px-4">
        {/* 2-col layout: Mobile order = card first, image second */}
        <div className="grid grid-cols-1 md:grid-cols-2 md:gap-16 lg:gap-24 items-center">
          {/* Image Side (LEFT on desktop, SECOND on mobile) */}
          <div className="order-2 md:order-1 flex items-center justify-center py-10 md:py-0 min-h-[360px] md:min-h-[420px]">
            <div className="grid grid-cols-2 gap-4">
              <SingleCard url={DEMO_FINAL_IMG} label="סגנון 1" animationDelay={0} />
              <SingleCard url={DEMO_FINAL_IMG_2} label="סגנון 2" animationDelay={0.1} />
              <SingleCard url={DEMO_FINAL_IMG_3} label="סגנון 3" animationDelay={0.2} />
              <SingleCard url={DEMO_FINAL_IMG_4} label="סגנון 4" animationDelay={0.3} />
            </div>
          </div>

          {/* Info Card (RIGHT on desktop, FIRST on mobile) */}
          <div className="order-1 md:order-2">
            <div
              className="p-6 md:p-8 rounded-2xl"
              style={{ backgroundColor: COLORS.card, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.1)" }}
            >
              <div className="flex items-center mb-4 gap-4">
                <div
                  className="flex-shrink-0 w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: COLORS.primary }}
                >
                  <Rocket className="w-6 h-6 md:w-8 md:h-8" style={{ color: COLORS.card }} />
                </div>
                <h3 className="text-xl md:text-3xl font-bold" style={{ color: COLORS.primary }}>
                  התוצאה: המראה החדש שלכם
                </h3>
              </div>
              <p className="text-base md:text-lg leading-relaxed" style={{ color: COLORS.text, opacity: 0.9 }}>
                בתוך ימים ספורים, אתם מקבלים ספריית תמונות ברמה של מגזין. תמונות מרהיבות שמוכנות להזניק
                לכם את המכירות בכל פלטפורמה.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StepFour;


