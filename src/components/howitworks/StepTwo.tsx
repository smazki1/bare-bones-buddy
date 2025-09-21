import React from "react";
import { motion } from "framer-motion";
import { Palette } from "lucide-react";

// --- Mock Data (for preview purposes) ---
const COLORS = {
  background: "#f8f7f4",
  card: "#ffffff",
};

// ---------------------------
// Step 2 (Standalone)
// Desktop: images LEFT, card RIGHT
// Mobile : card first, images below
// ---------------------------
const StepTwo: React.FC = () => {
  const images = [
    { label: "כהה",   url: "https://raw.githubusercontent.com/smazki1/images-stocks-/8bcb812cad07c1949a3ce1e031560409d5402e0b/%D7%9B%D7%94%D7%94.png" },
    { label: "נקי", url: "https://raw.githubusercontent.com/smazki1/images-stocks-/8bcb812cad07c1949a3ce1e031560409d5402e0b/%D7%9C%D7%91%D7%9F.png" },
    { label: "קלאסי",   url: "https://raw.githubusercontent.com/smazki1/images-stocks-/8bcb812cad07c1949a3ce1e031560409d5402e0b/29091755-29091755-1.jpg" },
    { label: "צבעוני", url: "https://raw.githubusercontent.com/smazki1/images-stocks-/8bcb812cad07c1949a3ce1e031560409d5402e0b/%D7%A6%D7%91%D7%A2%D7%95%D7%A0%D7%99.png" },
  ];

  return (
    <section style={{ backgroundColor: COLORS.background }} className="py-16 md:py-24 font-sans">
      <div className="container mx-auto px-4">
        {/* 2-col layout: Mobile order = card first, images second */}
        <div className="grid grid-cols-1 md:grid-cols-2 md:gap-16 lg:gap-24 items-start">
          {/* Images (RIGHT on desktop, SECOND on mobile) */}
          <div className="order-2 md:order-2 flex items-center justify-center py-10 md:py-0">
            <div className="w-full max-w-md mx-auto">
              <div className="grid grid-cols-2 gap-4">
                {images.map((img, i) => (
                  <motion.div
                    key={i}
                    className="relative aspect-square rounded-xl overflow-hidden shadow-lg group"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                      transition: {
                        delay: i * 0.15,
                        type: "spring",
                        stiffness: 150,
                        damping: 20,
                      },
                    }}
                    whileHover={{ zIndex: 10, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" }}
                  >
                    <motion.img 
                      src={img.url} 
                      alt={img.label} 
                      className="w-full h-full object-cover"
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Card (LEFT on desktop, FIRST on mobile) */}
          <div className="order-1 md:order-1">
            <div
              className="p-6 md:p-8 rounded-2xl"
              style={{ backgroundColor: COLORS.card, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.1)" }}
            >
              <div className="flex items-center mb-4 gap-4">
                <div
                  className="flex-shrink-0 w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center bg-primary"
                >
                  <Palette className="w-6 h-6 md:w-8 md:h-8 text-white" />
                </div>
                <h3 className="text-xl md:text-3xl font-bold text-right text-primary">
                  הסגנון שלכם: DNA של המותג
                </h3>
              </div>
              <p className="text-base md:text-lg leading-relaxed text-right text-foreground/90">
                אתם בוחרים את הסגנון הויזואלי המדויק שמתאים למותג שלכם. בין אם זה נקי ומודרני, חם וביתי, יוקרתי ואלגנטי או נועז וצבעוני – אנחנו מתאימים את התמונות ל-DNA העיצובי של העסק שלכם
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StepTwo;


