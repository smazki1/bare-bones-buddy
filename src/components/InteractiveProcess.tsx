import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Palette, Users, Rocket } from "lucide-react";

// Utilities
const normalizeGithubRaw = (url: string) => {
  if (!url) return url;
  if (url.includes("github.com") && url.includes("/blob/")) {
    const withoutProto = url.replace(/^https?:\/\//, "");
    const parts = withoutProto.split("/");
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

// Demo assets
const DEMO_IMG = normalizeGithubRaw(
  "https://github.com/smazki1/images-stocks-/blob/7ec8efa4060c86fe6f871104412a8882478c9b7e/21706353-0.jpg"
);
const DEMO_LOGO = normalizeGithubRaw(
  "https://github.com/smazki1/images-stocks-/blob/7ec8efa4060c86fe6f871104412a8882478c9b7e/logo%20dark.png"
);

// Types
type StepImage = { type?: string; text?: string; url?: string };
type Step = {
  icon: React.ComponentType<any>;
  title: string;
  description: string;
  layout: "fan" | "grid" | "single" | "icon";
  images?: StepImage[];
};

// Config
const CONFIG: { colors: any; steps: Step[] } = {
  colors: {
    primary: "#8b1e3f",
    secondary: "#f3752b",
    background: "#f3f4f6",
    text: "#1f2937",
    card: "#ffffff",
  },
  steps: [
    {
      icon: Camera,
      title: "הנוסחה המנצחת: הכל מתחיל בקליק",
      description:
        "אתם שולחים 10-15 תמונות פשוטות של המוצר או השירות, מזוויות ותאורות שונות. לא צריך ציוד מקצועי, רק סמארטפון.",
      layout: "fan",
      images: [
        { type: "before", text: "טלפון #1", url: DEMO_IMG },
        { type: "after", text: "תוצאה #1", url: DEMO_IMG },
        { type: "after", text: "תוצאה #2", url: DEMO_IMG },
        { type: "after", text: "תוצאה #3", url: DEMO_IMG },
      ],
    },
    {
      icon: Palette,
      title: "הסגנון שלכם: DNA של המותג",
      description:
        "אתם בוחרים את הסגנון הויזואלי המדויק שמתאים למותג שלכם. בין אם זה נקי ומודרני, חם וביתי, יוקרתי ואלגנטי או נועז וצבעוני – אנחנו מתאימים את התמונות ל-DNA העיצובי של העסק שלכם",
      layout: "grid",
      images: [
        { type: "style", text: "מודרני", url: DEMO_IMG },
        { type: "style", text: "כפרי", url: DEMO_IMG },
        { type: "style", text: "יוקרתי", url: DEMO_IMG },
      ],
    },
    {
      icon: Users,
      title: "הייעוץ האישי: הטאץ' האנושי",
      description:
        "לפני שמתחילים, אתם נפגשים עם המעצב שלנו. בפגישה הזו מוודאים שהחזון שלכם ברור ושהתוצאה הסופית תהיה לא פחות ממושלמת ותואמת את הציפיות שלכם במדויק.",
      layout: "icon",
    },
    {
      icon: Rocket,
      title: "התוצאה: המראה החדש שלכם",
      description:
        "בתוך ימים ספורים, אתם מקבלים ספריית תמונות ברמה של מגזין. תמונות מרהיבות שמוכנות להזניק לכם את המכירות בכל פלטפורמה.",
      layout: "single",
      images: [{ type: "final", text: "התמונה שלי", url: DEMO_LOGO }],
    },
  ],
};

// Visual Stage
const Stage: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="relative" style={{ width: 640, height: 420, maxWidth: "90vw", maxHeight: "70vh" }}>
    {children}
  </div>
);

// Visual cards
const ImageCardFan: React.FC<{ index: number; total: number; image: StepImage }> = ({ index, total, image }) => {
  const angle = (index - (total - 1) / 2) * 12;
  const src = image?.url || DEMO_IMG;
  return (
    <motion.div
      className="absolute w-28 h-40 md:w-32 md:h-48 rounded-lg overflow-hidden shadow-2xl border-4"
      style={{ originX: "50%", originY: "150%", backgroundColor: CONFIG.colors.card, borderColor: CONFIG.colors.card }}
      initial={{ scale: 0.5, opacity: 0, rotate: angle, y: 150 }}
      animate={{ scale: 1, opacity: 1, rotate: angle, y: 0, transition: { type: "spring", stiffness: 150, damping: 20, delay: index * 0.08 } }}
      exit={{ scale: 0.5, opacity: 0, rotate: angle, y: 150, transition: { duration: 0.2, delay: index * 0.05 } }}
      whileHover={{ y: -10, scale: 1.05, transition: { type: "spring", stiffness: 300, damping: 15 } }}
    >
      <img src={src} alt={image?.text || "image"} className="w-full h-full object-cover" />
      <div className="absolute top-1 right-1 text-white text-[10px] px-1.5 py-0.5 rounded" style={{ backgroundColor: image?.type === "before" ? "rgba(0,0,0,0.6)" : CONFIG.colors.secondary }}>
        {image?.type === "before" ? "המקור" : "תוצאה"}
      </div>
    </motion.div>
  );
};

const ImageCardGrid: React.FC<{ index: number; image: StepImage }> = ({ index, image }) => {
  const slots = [
    { x: 0, y: -120 },
    { x: -140, y: 100 },
    { x: 140, y: 100 },
  ];
  const pos = slots[index % slots.length];
  const src = image?.url || DEMO_IMG;

  return (
    <motion.div
      className="absolute left-1/2 top-1/2 w-28 h-28 md:w-32 md:h-32 rounded-lg overflow-hidden shadow-2xl border-4"
      style={{ transform: "translate(-50%, -50%)", backgroundColor: CONFIG.colors.card, borderColor: CONFIG.colors.card }}
      initial={{ scale: 0, opacity: 0, x: 0, y: 0 }}
      animate={{ scale: 1, opacity: 1, x: pos.x, y: pos.y, transition: { type: "spring", stiffness: 150, damping: 20, delay: index * 0.1 } }}
      exit={{ scale: 0, opacity: 0, transition: { duration: 0.2, delay: index * 0.05 } }}
      whileHover={{ scale: 1.08, zIndex: 10, transition: { type: "spring", stiffness: 300 } }}
    >
      <img src={src} alt={image?.text || "image"} className="w-full h-full object-cover" />
      <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-center text-xs py-1 font-semibold">{image?.text || ""}</div>
    </motion.div>
  );
};

const ImageCardSingle: React.FC<{ image: StepImage }> = ({ image }) => {
  const src = image?.url || DEMO_IMG;
  return (
    <motion.div
      className="absolute left-1/2 top-1/2 w-48 h-64 md:w-64 md:h-80 rounded-lg overflow-hidden shadow-2xl border-4"
      style={{ transform: "translate(-50%, -50%)", backgroundColor: CONFIG.colors.card, borderColor: CONFIG.colors.card }}
      initial={{ scale: 0.5, opacity: 0, y: 50 }}
      animate={{ scale: 1, opacity: 1, y: 0, transition: { type: "spring", stiffness: 150, damping: 20 } }}
      exit={{ scale: 0.5, opacity: 0, y: 50, transition: { duration: 0.3 } }}
      whileHover={{ scale: 1.05, transition: { type: "spring", stiffness: 300 } }}
    >
      <img src={src} alt={image?.text || "image"} className="w-full h-full object-cover" />
      <div className="absolute top-1 right-1 text-white text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: CONFIG.colors.secondary }}>{image?.text || ""}</div>
    </motion.div>
  );
};

const IconDisplay: React.FC<{ icon: React.ComponentType<any> }> = ({ icon: Icon }) => (
  <motion.div
    className="absolute left-1/2 top-1/2"
    style={{ transform: "translate(-50%, -50%)" }}
    initial={{ scale: 0, opacity: 0, rotate: -45 }}
    animate={{ scale: 1, opacity: 1, rotate: 0, transition: { type: "spring", stiffness: 150, damping: 20 } }}
    exit={{ scale: 0, opacity: 0, rotate: 45, transition: { duration: 0.3 } }}
  >
    <div className="relative w-48 h-48 md:w-64 md:h-64 rounded-full flex items-center justify-center shadow-2xl" style={{ backgroundColor: CONFIG.colors.card }}>
      <Icon className="w-24 h-24 md:w-32 md:h-32" style={{ color: CONFIG.colors.primary }} />
    </div>
  </motion.div>
);

const InteractiveProcess: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const sectionRefs = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    const sections = sectionRefs.current.filter(Boolean) as HTMLDivElement[];
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) {
          const idx = sections.indexOf(visible.target as HTMLDivElement);
          if (idx !== -1 && idx !== activeStep) setActiveStep(idx);
        }
      },
      { root: null, threshold: [0.3, 0.5, 0.7] }
    );

    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [activeStep]);

  const CurrentVisuals: React.FC<{ stepIndex: number }> = ({ stepIndex }) => {
    const step = CONFIG.steps[stepIndex];
    if (!step) return null;

    return (
      <Stage>
        {step.layout === "fan" && step.images?.map((image, idx) => (
          <ImageCardFan key={`fan-${idx}`} index={idx} total={step.images!.length} image={image} />
        ))}
        {step.layout === "grid" && step.images?.map((image, idx) => (
          <ImageCardGrid key={`grid-${idx}`} index={idx} image={image} />
        ))}
        {step.layout === "single" && step.images && step.images.length > 0 && (
          <ImageCardSingle image={step.images[0]} />
        )}
        {step.layout === "icon" && <IconDisplay icon={step.icon} />}
      </Stage>
    );
  };

  useEffect(() => {
    console.assert(CONFIG.steps.length === 4, "Expected 4 steps");
    console.assert((CONFIG.steps[0].images?.length || 0) >= 4, "Step 1 should have 4+ images");
    console.assert((CONFIG.steps[1].images?.length || 0) === 3, "Step 2 should have exactly 3 images");
    console.assert(CONFIG.steps[2].layout === "icon", "Step 3 should be icon layout");
    console.assert((CONFIG.steps[3].images?.length || 0) >= 1, "Step 4 should have 1 image");
  }, []);

  return (
    <section style={{ backgroundColor: CONFIG.colors.background }} className="py-20 md:py-32 font-sans overflow-hidden" dir="rtl">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16 md:mb-24">
          <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: CONFIG.colors.primary }}>מצילום בטלפון לסטודיו מקצועי</h2>
          <p className="text-lg md:text-xl max-w-2xl mx-auto" style={{ color: CONFIG.colors.text, opacity: 0.8 }}>
            התהליך השקוף שלנו שחוסך לכם זמן, כסף ועצבים
          </p>
        </div>

        {/* Main grid */}
        <div className="relative md:grid md:grid-cols-2 md:gap-16 lg:gap-32 items-start">
          {/* Left: sticky visuals */}
          <div className="sticky top-0 h-[50vh] md:h-screen flex items-center justify-center py-12 md:py-0">
            <div className="relative w-full h-full flex items-center justify-center" style={{ perspective: "1000px" }}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStep}
                  className="absolute w-full h-full flex items-center justify-center"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.35 }}
                >
                  <CurrentVisuals stepIndex={activeStep} />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Right: steps */}
          <div className="relative z-10">
            {CONFIG.steps.map((step, index) => (
              <div
                key={index}
                ref={(el) => (sectionRefs.current[index] = el)}
                className="min-h-[60vh] md:min_h-[100vh] flex items-center py-8 md:py-0"
              >
                <motion.div
                  className="w-full"
                  animate={{ opacity: activeStep === index ? 1 : 0.3, y: activeStep === index ? 0 : 20 }}
                  transition={{ duration: 0.35 }}
                >
                  <div className="p-6 md:p-8 rounded-2xl" style={{ backgroundColor: CONFIG.colors.card, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.1)" }}>
                    <div className="flex items-center mb-4 gap-4">
                      <div className="flex-shrink-0 w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: CONFIG.colors.primary }}>
                        <step.icon className="w-6 h-6 md:w-8 md:h-8" style={{ color: CONFIG.colors.card }} />
                      </div>
                      <h3 className="text-xl md:text-3xl font-bold" style={{ color: CONFIG.colors.primary }}>{step.title}</h3>
                    </div>
                    <p className="text-base md:text-lg leading-relaxed" style={{ color: CONFIG.colors.text, opacity: 0.9 }}>{step.description}</p>
                  </div>
                </motion.div>
              </div>
            ))}
          </div>
        </div>

        {/* Preview controls */}
        <div className="fixed bottom-4 right-4 z-[1000] hidden md:flex gap-2 bg-white/90 backdrop-blur px-3 py-2 rounded-xl shadow-lg border">
          {CONFIG.steps.map((s, i) => (
            <button
              key={`btn-${i}`}
              onClick={() => sectionRefs.current[i]?.scrollIntoView({ behavior: "smooth", block: "center" })}
              className={`px-3 py-1 rounded-lg text-sm font-semibold transition ${i === activeStep ? "bg-[#f3752b] text-white" : "bg-gray-100 hover:bg-gray-200"}`}
              title={s.title}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default InteractiveProcess;


