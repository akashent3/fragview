import React from "react";
import Link from "next/link";
import {
  Sparkles,
  Download,
  FolderOpen,
  Camera,
  AtSign,
  Users,
  Bell,
  BookOpen,
  ArrowRight,
} from "lucide-react";

export const metadata = {
  title: "Features — What You Can Do on FragView",
  description:
    "Discover everything FragView offers — AI-powered fragrance answers, personal wardrobe management, PDF exports, community follows, editorial content, and more.",
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_BASE_URL || "https://www.fragview.com"}/features`,
  },
};

const features = [
  {
    id: "askfragview-ai",
    icon: <Sparkles className="h-7 w-7" />,
    label: "AI-Powered",
    title: "AskFragview AI",
    summary: "Ask our AI anything about any fragrance — instantly.",
    description:
      "Ever read a dozen reviews and still not know if a fragrance suits you? AskFragview uses AI to answer your specific questions about any perfume — longevity, occasion, comparison to something you own, and more. Available directly inside the review section of every perfume page.",
    steps: [
      "Open any perfume page on FragView.",
      "Scroll down to the Community Reviews section.",
      "In the Write a Review box, start your text with @askfragview.",
      "Type your question right after — e.g. @askfragview how does this wear in summer?",
      "Submit the form. An AI-generated answer streams in instantly below your input.",
    ],
    cta: "Try it on any perfume",
    ctaHref: "/perfumes",
    bg: "bg-[#FFFCF7]",
  },
  {
    id: "organise-wardrobe",
    icon: <FolderOpen className="h-7 w-7" />,
    label: "Personal",
    title: "Organise Your Wardrobe",
    summary: "Your collection, sorted exactly how you think about it.",
    description:
      "My Wardrobe gives you three top-level tabs — My Bottles, Wishlist, and Past Bottles — each with subcategories like Daily Wear, Date Night, Office, High Priority, To Sample, Used Up, and more. You can rename any subcategory or create your own so it reflects how you actually think about your scents.",
    steps: [
      "Go to My Wardrobe from the navbar or your profile.",
      "Choose a top-level tab: My Bottles, Wishlist, or Past Bottles.",
      "Click a subcategory (e.g. Daily Wear) to filter your collection by it.",
      "Add a fragrance using the Add Fragrance button and select the right subcategory.",
      "To rename a subcategory, long-press or hover it and use the edit option.",
    ],
    cta: "Open My Wardrobe",
    ctaHref: "/wardrobe",
    bg: "bg-white",
  },
  {
    id: "export-wardrobe",
    icon: <Download className="h-7 w-7" />,
    label: "Export",
    title: "Download Your Collection",
    summary: "Export your wardrobe as a PDF or CSV — anytime.",
    description:
      "Heading to a fragrance store? Buying a gift? Cataloguing your bottles? With one click you can export your entire wardrobe as a formatted PDF or a raw CSV. The PDF includes perfume names, brands, categories, and notes. The CSV is ready to import anywhere you like.",
    steps: [
      "Go to My Wardrobe.",
      "Look for the Download button near the top of your collection.",
      "Click it to open the export options.",
      "Choose PDF for a formatted printable version, or CSV for a raw spreadsheet.",
      "Your file downloads to your device instantly.",
    ],
    cta: "Go to My Wardrobe",
    ctaHref: "/wardrobe",
    bg: "bg-[#FFFCF7]",
  },
  {
    id: "perfume-snapshot",
    icon: <Camera className="h-7 w-7" />,
    label: "Share",
    title: "Perfume Snapshot",
    summary: "Save a clean snapshot card of any fragrance.",
    description:
      "On any perfume page you can download a snapshot — a cleanly formatted image showing the fragrance name, brand, accords, notes pyramid, and rating. Perfect for sharing with a friend, posting on social media, or keeping a visual record of something you're considering.",
    steps: [
      "Open any perfume page.",
      "Find the snapshot or camera icon near the perfume's header section.",
      "Click it — a snapshot card is generated from the perfume's details.",
      "Preview the card and click Download to save it as an image.",
      "Share it anywhere — messages, social media, or keep it for reference.",
    ],
    cta: "Browse perfumes",
    ctaHref: "/perfumes",
    bg: "bg-white",
  },
  {
    id: "tag-in-reviews",
    icon: <AtSign className="h-7 w-7" />,
    label: "Community",
    title: "Tag Members & Perfumes in Reviews",
    summary: "Bring people and fragrances into the conversation.",
    description:
      "When writing a review, you can mention another member or reference another perfume directly inside your text. It creates a clickable link — great for recommending an alternative, crediting someone who introduced you to a fragrance, or starting a thread between collectors.",
    steps: [
      "Open any perfume page and scroll to the Write a Review form.",
      "Start typing your review text in the review box.",
      "Type @ to mention a member — a suggestion dropdown appears as you type.",
      "Type # to reference another perfume — another dropdown appears.",
      "Select the right person or perfume from the list and continue writing.",
      "When you post, the tag becomes a clickable link and they receive a notification.",
    ],
    cta: "Leave a review",
    ctaHref: "/perfumes",
    bg: "bg-[#FFFCF7]",
  },
  {
    id: "follow-brands-users",
    icon: <Users className="h-7 w-7" />,
    label: "Social",
    title: "Follow Brands & Collectors",
    summary: "Stay close to what you love and who inspires you.",
    description:
      "Follow any fragrance brand to get updates when new perfumes are added to their catalog. Follow other collectors to see their activity — what they've reviewed, what they're adding to their wardrobe, and what they're discussing.",
    steps: [
      "To follow a brand: open any brand page and click the Follow button below the brand name.",
      "To follow a user: visit their profile at /u/username and click Follow.",
      "If their profile is private, your follow request will be sent for their approval.",
      "Once followed, their activity appears in your personal activity feed.",
      "You'll receive a notification whenever they add a review or update their collection.",
    ],
    cta: "Explore brands",
    ctaHref: "/brands",
    bg: "bg-white",
  },
  {
    id: "notifications",
    icon: <Bell className="h-7 w-7" />,
    label: "Stay Updated",
    title: "Notifications",
    summary: "Never miss something that matters to you.",
    description:
      "FragView sends you in-app notifications when someone follows you, marks your review as helpful, replies to your thread, or when a submission you made gets approved. You can control what you hear about in your settings.",
    steps: [
      "Click the bell icon in the top navbar to open your notifications panel.",
      "All your recent notifications are listed there — follows, votes, replies, approvals.",
      "Click any notification to go directly to the relevant page.",
      "To manage what you get notified about, go to Settings → Notifications.",
      "You can also opt in to a weekly email digest from your settings.",
    ],
    cta: "View notifications",
    ctaHref: "/notifications",
    bg: "bg-[#FFFCF7]",
  },
  {
    id: "the-drydown",
    icon: <BookOpen className="h-7 w-7" />,
    label: "Editorial",
    title: "The Drydown",
    summary: "Fragrance writing worth reading — not just listings.",
    description:
      "The Drydown is FragView's editorial section. It's where you'll find curated stories about perfumes, brand deep-dives, trend pieces, seasonal guides, and how people actually wear scent in daily life. Published by the team and community contributors.",
    steps: [
      "Click Drydown in the top navbar or footer.",
      "Browse articles by category using the tabs at the top — News, Reviews, Trends, and more.",
      "Click any article to read it in full.",
      "Scroll to the bottom of the article to leave a comment.",
      "Use the share buttons to share an article with your network.",
    ],
    cta: "Read The Drydown",
    ctaHref: "/drydown",
    bg: "bg-white",
  },
];

export default function FeaturesPage() {
  return (
    <main className="bg-white">

      {/* ── Hero ── */}
      <section className="bg-fv-parchment border-b border-[#ECE0CF] overflow-hidden">
        {/* Float animations for SVG bottles */}
        <style>{`
          @keyframes fv-float-a{0%,100%{transform:translateY(0);}50%{transform:translateY(-12px);}}
          @keyframes fv-float-b{0%,100%{transform:translateY(0);}50%{transform:translateY(-8px);}}
          @keyframes fv-float-c{0%,100%{transform:translateY(0);}50%{transform:translateY(-10px);}}
          .fv-bctr{animation:fv-float-a 5s ease-in-out infinite;}
          .fv-blft{animation:fv-float-b 6s ease-in-out infinite 0.8s;}
          .fv-brgt{animation:fv-float-c 5.5s ease-in-out infinite 1.5s;}
        `}</style>
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-[72px] py-10 lg:py-14">
          <div className="flex flex-col lg:flex-row lg:items-center gap-8 lg:gap-10 xl:gap-16">

            {/* Left: text content */}
            <div className="flex-1 lg:max-w-[580px]">
              <span className="font-hedvig text-[20px] leading-[28px] lg:text-[24px] lg:leading-[32px] text-[#8A6A35]">
                What you can do
              </span>
              <h1 className="mt-1 font-hedvig font-normal text-[32px] leading-[40px] lg:text-[48px] lg:leading-[58px] text-[#211F1C]">
                Everything FragView gives you — all free, no catch
              </h1>
              <p className="mt-4 font-inter text-[16px] sm:text-[18px] leading-[26px] text-[#4A4946] max-w-[560px]">
                FragView is built around discovery, not sales. Here&apos;s
                everything you can do — from AI answers to personal wardrobe
                exports, editorial content, and community tools.
              </p>

              {/* Quick jump links */}
              <div className="mt-6 flex flex-wrap gap-2">
                {features.map((f) => (
                  <a
                    key={f.id}
                    href={`#${f.id}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#E2E1E1] bg-white font-inter text-[13px] font-medium text-[#211F1C] hover:border-[#ECE0CF] hover:bg-[#FFF9EF] transition-colors"
                  >
                    {f.title}
                  </a>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/perfumes"
                  className="inline-flex items-center justify-between pl-4 pr-1 py-1 h-[46px] bg-[#211F1C] text-white rounded-xl font-inter font-medium text-[15px] hover:bg-[#211F1C]/90 transition-colors gap-3"
                >
                  Explore Perfumes
                  <span className="flex items-center justify-center w-9 h-9 bg-white rounded-lg text-[#211F1C]">
                    <ArrowRight className="h-5 w-5" aria-hidden="true" />
                  </span>
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center h-[46px] px-5 border border-[#E2E1E1] bg-white text-[#211F1C] rounded-xl font-inter font-medium text-[15px] hover:bg-[#F9F7F5] transition-colors"
                >
                  Create free account
                </Link>
              </div>
            </div>

            {/* Right: decorative SVG illustration — three perfume bottles */}
            <div className="hidden lg:flex flex-1 items-center justify-center py-6" aria-hidden="true">
              <svg
                viewBox="0 0 480 500"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full"
                style={{ maxWidth: "400px" }}
              >
                {/* Soft background circle */}
                <circle cx="248" cy="268" r="196" fill="#ECE0CF" fillOpacity="0.22" />

                {/* ── LEFT BOTTLE (round / oval) ── */}
                <g className="fv-blft">
                  <path d="M 103,193 C 99,179 107,166 101,153 C 95,140 102,129 99,118" stroke="#8A6A35" strokeWidth="1" strokeOpacity="0.3" strokeLinecap="round" />
                  <rect x="82" y="195" width="48" height="23" rx="8" stroke="#8A6A35" strokeWidth="1.5" fill="#FFF9EF" />
                  <path d="M 106,385 C 68,385 54,360 54,326 C 54,282 70,264 83,258 L 83,230 C 83,220 88,215 95,215 L 115,215 C 122,215 127,220 127,230 L 127,258 C 140,264 156,282 156,326 C 156,360 142,385 106,385 Z" stroke="#8A6A35" strokeWidth="1.5" fill="#FFF9EF" fillOpacity="0.72" />
                  <ellipse cx="106" cy="323" rx="33" ry="42" stroke="#8A6A35" strokeWidth="0.75" strokeOpacity="0.4" />
                </g>

                {/* ── CENTER BOTTLE (main, tall rectangular flacon) ── */}
                <g className="fv-bctr">
                  <path d="M 232,67 C 227,53 237,39 231,25 C 225,11 233,1 229,-5" stroke="#8A6A35" strokeWidth="1.1" strokeOpacity="0.4" strokeLinecap="round" />
                  <path d="M 249,65 C 255,50 246,36 253,22 C 260,8 252,-1 256,-7" stroke="#8A6A35" strokeWidth="0.9" strokeOpacity="0.26" strokeLinecap="round" />
                  <rect x="206" y="71" width="68" height="28" rx="10" stroke="#8A6A35" strokeWidth="1.5" fill="#FFF9EF" />
                  <line x1="217" y1="85" x2="263" y2="85" stroke="#8A6A35" strokeWidth="0.75" strokeOpacity="0.55" />
                  <path d="M 240,400 C 210,400 198,392 198,380 L 198,170 C 198,157 208,147 220,142 L 220,108 C 220,99 225,95 233,95 L 247,95 C 255,95 260,99 260,108 L 260,142 C 272,147 282,157 282,170 L 282,380 C 282,392 270,400 240,400 Z" stroke="#8A6A35" strokeWidth="1.5" fill="#FFF9EF" fillOpacity="0.8" />
                  <rect x="212" y="208" width="56" height="100" rx="3" stroke="#8A6A35" strokeWidth="0.75" strokeOpacity="0.4" />
                  <line x1="224" y1="228" x2="256" y2="228" stroke="#8A6A35" strokeWidth="0.9" strokeOpacity="0.5" />
                  <line x1="220" y1="248" x2="260" y2="248" stroke="#8A6A35" strokeWidth="0.65" strokeOpacity="0.36" />
                  <line x1="222" y1="262" x2="258" y2="262" stroke="#8A6A35" strokeWidth="0.65" strokeOpacity="0.36" />
                </g>

                {/* ── RIGHT BOTTLE (slim cylindrical) ── */}
                <g className="fv-brgt">
                  <path d="M 372,172 C 368,158 376,146 370,134 C 364,122 371,113 368,103" stroke="#8A6A35" strokeWidth="0.9" strokeOpacity="0.28" strokeLinecap="round" />
                  <rect x="351" y="175" width="46" height="24" rx="10" stroke="#8A6A35" strokeWidth="1.5" fill="#FFF9EF" />
                  <line x1="361" y1="187" x2="387" y2="187" stroke="#8A6A35" strokeWidth="0.65" strokeOpacity="0.5" />
                  <path d="M 374,392 C 351,392 344,381 344,360 L 344,246 C 344,235 350,228 358,226 L 358,208 C 358,199 362,196 368,196 L 380,196 C 386,196 390,199 390,208 L 390,226 C 398,228 404,235 404,246 L 404,360 C 404,381 397,392 374,392 Z" stroke="#8A6A35" strokeWidth="1.5" fill="#FFF9EF" fillOpacity="0.72" />
                  <line x1="358" y1="244" x2="358" y2="357" stroke="#8A6A35" strokeWidth="0.75" strokeOpacity="0.3" />
                </g>

                {/* ── ACCENT DOTS ── */}
                <circle cx="47" cy="172" r="3.5" fill="#ECE0CF" stroke="#8A6A35" strokeWidth="1" strokeOpacity="0.52" />
                <circle cx="163" cy="124" r="4" fill="#ECE0CF" stroke="#8A6A35" strokeWidth="1" strokeOpacity="0.48" />
                <circle cx="329" cy="127" r="3" fill="#ECE0CF" stroke="#8A6A35" strokeWidth="1" strokeOpacity="0.48" />
                <circle cx="445" cy="212" r="3.5" fill="#ECE0CF" stroke="#8A6A35" strokeWidth="1" strokeOpacity="0.42" />
                <circle cx="443" cy="354" r="4.5" fill="#ECE0CF" stroke="#8A6A35" strokeWidth="1" strokeOpacity="0.38" />
                <circle cx="46" cy="360" r="3.5" fill="#ECE0CF" stroke="#8A6A35" strokeWidth="1" strokeOpacity="0.38" />
                <circle cx="177" cy="460" r="4" fill="#ECE0CF" stroke="#8A6A35" strokeWidth="1" strokeOpacity="0.35" />
                <circle cx="311" cy="463" r="3" fill="#ECE0CF" stroke="#8A6A35" strokeWidth="1" strokeOpacity="0.32" />

                {/* ── DIAMOND ACCENTS ── */}
                <path d="M 49,144 L 53,148 L 49,152 L 45,148 Z" stroke="#8A6A35" strokeWidth="1" strokeOpacity="0.45" />
                <path d="M 441,278 L 445,282 L 441,286 L 437,282 Z" stroke="#8A6A35" strokeWidth="1" strokeOpacity="0.4" />
                <path d="M 191,93 L 194,96 L 191,99 L 188,96 Z" stroke="#8A6A35" strokeWidth="0.9" strokeOpacity="0.33" />
              </svg>
            </div>

          </div>
        </div>
      </section>

      {/* ── Features ── */}
      {features.map((feature, idx) => (
        <section key={feature.id} id={feature.id} className={feature.bg}>
          <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-[72px] py-10 lg:py-14">
            <div
              className={`flex flex-col lg:flex-row gap-10 lg:gap-16 xl:gap-24 lg:items-start ${
                idx % 2 !== 0 ? "lg:flex-row-reverse" : ""
              }`}
            >
              {/* Left: Icon + label + title + description */}
              <div className="flex flex-col gap-4 lg:w-[45%] shrink-0">
                <div className="flex items-center gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#ECE0CF] bg-[#FFF9EF] text-[#8A6A35] shrink-0">
                    {feature.icon}
                  </div>
                  <span className="inline-flex items-center px-3 py-1 rounded-full border border-[#ECE0CF] bg-[#FFF9EF] font-inter text-[11px] font-semibold leading-[18px] text-[#8A6A35] uppercase tracking-wide">
                    {feature.label}
                  </span>
                </div>

                <div className="flex flex-col gap-2">
                  <h2 className="font-hedvig font-normal text-[26px] leading-[34px] lg:text-[32px] lg:leading-[42px] text-[#211F1C]">
                    {feature.title}
                  </h2>
                  <p className="font-inter font-medium text-[15px] lg:text-[16px] leading-[24px] text-[#211F1C]">
                    {feature.summary}
                  </p>
                  <p className="font-inter text-[14px] lg:text-[15px] leading-[22px] lg:leading-[24px] text-[#4A4946]">
                    {feature.description}
                  </p>
                </div>

                <Link
                  href={feature.ctaHref}
                  className="inline-flex items-center gap-2 w-fit font-inter font-medium text-[14px] leading-[22px] text-[#211F1C] underline underline-offset-2 hover:text-[#8A6A35] transition-colors"
                >
                  {feature.cta}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>

              {/* Right: How to use — numbered steps */}
              <div className="flex-1">
                <div className="rounded-2xl border border-[#ECE0CF] bg-[#FFF9EF] p-5 sm:p-6 lg:p-8">
                  <p className="font-hedvig text-[16px] leading-[24px] text-[#8A6A35] mb-4">
                    How to use
                  </p>
                  <ol className="flex flex-col gap-4">
                    {feature.steps.map((step, i) => (
                      <li key={i} className="flex items-start gap-4">
                        {/* Step number */}
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#ECE0CF] bg-white font-inter text-[13px] font-semibold text-[#8A6A35] mt-[1px]">
                          {i + 1}
                        </span>
                        {/* Step text */}
                        <p className="font-inter text-[14px] sm:text-[15px] leading-[22px] sm:leading-[24px] text-[#4A4946] pt-0.5">
                          {step}
                        </p>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>
          </div>

          {/* Section divider */}
          {idx < features.length - 1 && (
            <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-[72px]">
              <div className="h-px bg-[#E2E1E1]" />
            </div>
          )}
        </section>
      ))}

      {/* ── Bottom CTA ── */}
      <section className="bg-fv-parchment border-t border-[#ECE0CF]">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-[72px] py-10 lg:py-14">
          <div className="flex flex-col gap-1 max-w-[600px]">
            <span className="font-hedvig text-[20px] leading-[28px] lg:text-[24px] lg:leading-[32px] text-[#8A6A35]">
              Ready to explore
            </span>
            <h2 className="font-hedvig font-normal text-[28px] leading-[36px] lg:text-[40px] lg:leading-[56px] text-[#211F1C]">
              Everything is free. No subscriptions, no ads.
            </h2>
            <p className="mt-2 font-inter text-[14px] lg:text-[16px] leading-[22px] lg:leading-[24px] text-[#4A4946]">
              FragView is a community platform built for fragrance lovers. Every
              feature listed here is available to all users at no cost.
            </p>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/signup"
              className="inline-flex items-center justify-between pl-4 pr-1 py-1 h-[46px] bg-[#211F1C] text-white rounded-xl font-inter font-medium text-[15px] hover:bg-[#211F1C]/90 transition-colors gap-3"
            >
              Get started free
              <span className="flex items-center justify-center w-9 h-9 bg-white rounded-lg text-[#211F1C]">
                <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </span>
            </Link>
            <Link
              href="/perfumes"
              className="inline-flex items-center justify-center h-[46px] px-5 border border-[#E2E1E1] bg-white text-[#211F1C] rounded-xl font-inter font-medium text-[15px] hover:bg-[#F9F7F5] transition-colors"
            >
              Browse without signing up
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
