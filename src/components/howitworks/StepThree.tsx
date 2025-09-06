import React from "react";
import { motion } from "framer-motion";
import { Users } from "lucide-react";

/**
 * STEP 3 ONLY — Clean, standalone section
 * Desktop: icon LEFT, card RIGHT
 * Mobile : card first, icon below
 */

const COLORS = {
  primary: "#8b1e3f",
  secondary: "#f3752b",
  background: "#f3f4f6",
  text: "#1f2937",
  card: "#ffffff",
};

const IconBadge: React.FC = () => (
  <motion.div
    className="relative w-48 h-48 md:w-64 md:h-64 rounded-full flex items-center justify-center shadow-2xl overflow-hidden"
    style={{ backgroundColor: COLORS.card }}
    initial={{ scale: 0, opacity: 0, rotate: -10 }}
    animate={{ scale: 1, opacity: 1, rotate: 0, transition: { type: "spring", stiffness: 160, damping: 20 } }}
    whileHover={{ scale: 1.04 }}
  >
    <img
      src="https://github.com/smazki1/images-stocks-/blob/e0676f8db08deea3ffc16c1960165b1906d9643c/image.png?raw=true"
      alt="שירות אישי"
      className="w-full h-full object-cover"
    />
  </motion.div>
);

const StepThree: React.FC = () => {
  return (
    <section style={{ backgroundColor: COLORS.background }} className="py-16 md:py-24 font-sans" dir="rtl">
      <div className="container mx-auto px-4">
        {/* 2-col layout: Mobile order = card first, icon second */}
        <div className="grid grid-cols-1 md:grid-cols-2 md:gap-16 lg:gap-24 items-start">
          {/* Icon (LEFT on desktop, HIDDEN on mobile) */}
          <div className="order-2 md:order-1 hidden md:flex items-center justify-center py-10 md:py-0">
            <div className="relative" style={{ width: 640, height: 420, maxWidth: "90vw", maxHeight: "70vh" }}>
              {/* Center the icon within the visual stage */}
              <div
                className="absolute left-1/2 top-1/2"
                style={{ transform: "translate(-50%, -50%)" }}
              >
                <IconBadge />
              </div>
            </div>
          </div>

          {/* Card (RIGHT on desktop, FIRST on mobile) */}
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
                  <Users className="w-6 h-6 md:w-8 md:h-8" style={{ color: COLORS.card }} />
                </div>
                <h3 className="text-xl md:text-3xl font-bold" style={{ color: COLORS.primary }}>
                  הייעוץ האישי: הטאץ' האנושי
                </h3>
              </div>
              <p className="text-base md:text-lg leading-relaxed" style={{ color: COLORS.text, opacity: 0.9 }}>
                לפני שמתחילים, אתם נפגשים עם המעצב שלנו. בפגישה הזו מוודאים שהחזון שלכם ברור
                ושהתוצאה הסופית תהיה לא פחות ממושלמת ותואמת את הציפיות שלכם במדויק.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StepThree;


