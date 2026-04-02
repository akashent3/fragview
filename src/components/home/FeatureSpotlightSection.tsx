"use client";
import React, { useState } from "react";
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

const features = [
  {
    id: "askfragview-ai",
    icon: <Sparkles className="h-5 w-5" />,
    iconLg: <Sparkles className="h-7 w-7" />,
    title: "AskFragview AI",
    description:
      "Ask our AI anything about a fragrance — longevity, occasion, how it compares. Get real answers, instantly.",
    href: "/features#askfragview-ai",
  },
  {
    id: "organise-wardrobe",
    icon: <FolderOpen className="h-5 w-5" />,
    iconLg: <FolderOpen className="h-7 w-7" />,
    title: "Organise Wardrobe",
    description:
      "Sort your collection into Daily Wear, Date Night, Wishlist, and more. Rename subcategories to match how you think.",
    href: "/features#organise-wardrobe",
  },
  {
    id: "export-wardrobe",
    icon: <Download className="h-5 w-5" />,
    iconLg: <Download className="h-7 w-7" />,
    title: "Export Collection",
    description:
      "Download your entire wardrobe as a formatted PDF or raw CSV — great for travel, gifting, or record-keeping.",
    href: "/features#export-wardrobe",
  },
  {
    id: "perfume-snapshot",
    icon: <Camera className="h-5 w-5" />,
    iconLg: <Camera className="h-7 w-7" />,
    title: "Perfume Snapshot",
    description:
      "Save a clean image card of any fragrance with its notes, accords, and ratings in one place.",
    href: "/features#perfume-snapshot",
  },
  {
    id: "tag-in-reviews",
    icon: <AtSign className="h-5 w-5" />,
    iconLg: <AtSign className="h-7 w-7" />,
    title: "Tag in Reviews",
    description:
      "Mention members with @ and reference perfumes with # directly inside your review text.",
    href: "/features#tag-in-reviews",
  },
  {
    id: "follow-brands-users",
    icon: <Users className="h-5 w-5" />,
    iconLg: <Users className="h-7 w-7" />,
    title: "Follow Brands & People",
    description:
      "Follow brands and collectors to see their activity and stay updated on new releases and reviews.",
    href: "/features#follow-brands-users",
  },
  {
    id: "notifications",
    icon: <Bell className="h-5 w-5" />,
    iconLg: <Bell className="h-7 w-7" />,
    title: "Notifications",
    description:
      "Get notified when someone follows you, marks your review helpful, or replies to your thread.",
    href: "/features#notifications",
  },
  {
    id: "the-drydown",
    icon: <BookOpen className="h-5 w-5" />,
    iconLg: <BookOpen className="h-7 w-7" />,
    title: "The Drydown",
    description:
      "Curated editorial stories about fragrances, brands, trends, and how people wear scent.",
    href: "/features#the-drydown",
  },
];

export default function FeatureSpotlightSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = features[activeIndex];

  return (
    <section className="bg-[#FFFCF7]">
      <style>{`
        @keyframes fv-panel-in {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fv-panel-in { animation: fv-panel-in 0.22s ease-out both; }
      `}</style>

      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-[72px] py-5">

        {/* ── Section header ── */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 sm:gap-6">
          <div className="flex flex-col gap-1">
            <span className="font-hedvig text-[20px] leading-[28px] lg:text-[24px] lg:leading-[32px] text-[#8A6A35]">
              What you can do
            </span>
            <h2 className="font-hedvig font-normal text-[28px] leading-[36px] lg:text-[40px] lg:leading-[56px] text-[#211F1C]">
              Everything FragView gives you
            </h2>
          </div>
          <Link
            href="/features"
            className="hidden sm:inline-flex items-center gap-2 shrink-0 font-inter font-medium text-[16px] leading-[26px] text-[#211F1C] underline underline-offset-2 hover:text-[#8A6A35] transition-colors"
          >
            See all features
            <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </Link>
        </div>

        {/* ── Mobile: 2-col grid tabs + panel below ── */}
        <div className="mt-6 lg:hidden">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {features.map((f, i) => (
              <button
                key={f.id}
                onClick={() => setActiveIndex(i)}
                className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border px-3 py-3 text-center transition-all ${
                  activeIndex === i
                    ? "border-[#211F1C] bg-[#211F1C] text-white"
                    : "border-[#E2E1E1] bg-white text-[#211F1C] hover:border-[#ECE0CF] hover:bg-[#FFF9EF]"
                }`}
              >
                <span className={activeIndex === i ? "text-white" : "text-[#8A6A35]"}>
                  {f.icon}
                </span>
                <span className="font-inter text-[11px] sm:text-[12px] font-medium leading-[16px]">
                  {f.title}
                </span>
              </button>
            ))}
          </div>

          {/* Mobile content panel */}
          <div
            key={`mobile-${activeIndex}`}
            className="fv-panel-in mt-4 rounded-2xl border border-[#ECE0CF] bg-[#FFF9EF] p-5"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#ECE0CF] bg-white text-[#8A6A35]">
                {active.iconLg}
              </div>
              <h3 className="font-hedvig text-[20px] leading-[28px] text-[#211F1C]">
                {active.title}
              </h3>
            </div>
            <p className="font-inter text-[14px] leading-[22px] text-[#4A4946]">
              {active.description}
            </p>
            <Link
              href={active.href}
              className="mt-3 inline-flex items-center gap-1.5 font-inter text-[13px] font-medium text-[#211F1C] underline underline-offset-2 hover:text-[#8A6A35] transition-colors"
            >
              See full guide
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>

          {/* Mobile CTA */}
          <div className="mt-4 flex justify-center sm:hidden">
            <Link
              href="/features"
              className="inline-flex items-center justify-between py-2 px-4 gap-4 bg-[#211F1C] rounded-[12px] font-inter font-medium text-[15px] leading-[26px] text-white hover:bg-[#211F1C]/90 transition-colors"
            >
              See all features
              <span className="flex items-center justify-center w-8 h-8 bg-white rounded-lg shrink-0">
                <ArrowRight className="h-4 w-4 text-[#211F1C]" aria-hidden="true" />
              </span>
            </Link>
          </div>
        </div>

        {/* ── Desktop: left tab list + right panel ── */}
        <div className="mt-8 hidden lg:flex gap-5 items-stretch min-h-[420px]">

          {/* Left tab list */}
          <div className="flex flex-col gap-2 w-[256px] xl:w-[280px] shrink-0">
            {features.map((f, i) => (
              <button
                key={f.id}
                onClick={() => setActiveIndex(i)}
                className={`flex items-center gap-3 rounded-xl px-4 h-12 text-left w-full transition-all group ${
                  activeIndex === i
                    ? "bg-[#211F1C] text-white shadow-sm"
                    : "bg-white border border-[#E2E1E1] text-[#211F1C] hover:border-[#ECE0CF] hover:bg-[#FFF9EF]"
                }`}
              >
                <span
                  className={`shrink-0 transition-colors ${
                    activeIndex === i
                      ? "text-white"
                      : "text-[#8A6A35] group-hover:text-[#8A6A35]"
                  }`}
                >
                  {f.icon}
                </span>
                <span className="font-inter text-[14px] font-medium leading-[20px] truncate">
                  {f.title}
                </span>
                {activeIndex === i && (
                  <ArrowRight className="h-4 w-4 ml-auto shrink-0 text-white opacity-60" />
                )}
              </button>
            ))}
          </div>

          {/* Right content panel */}
          <div className="flex-1 rounded-2xl border border-[#ECE0CF] bg-[#FFF9EF] p-8 xl:p-10 flex flex-col justify-between">
            <div key={`desktop-${activeIndex}`} className="fv-panel-in flex flex-col gap-5">
              {/* Icon */}
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[#ECE0CF] bg-white text-[#8A6A35]">
                {active.iconLg}
              </div>

              {/* Text */}
              <div className="flex flex-col gap-2">
                <h3 className="font-hedvig font-normal text-[28px] xl:text-[34px] leading-[36px] xl:leading-[44px] text-[#211F1C]">
                  {active.title}
                </h3>
                <p className="font-inter text-[15px] xl:text-[17px] leading-[24px] xl:leading-[26px] text-[#4A4946] max-w-[520px]">
                  {active.description}
                </p>
              </div>

              {/* Feature counter */}
              <div className="flex items-center gap-2 flex-wrap">
                {features.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveIndex(i)}
                    className={`h-1.5 rounded-full transition-all ${
                      activeIndex === i
                        ? "w-6 bg-[#8A6A35]"
                        : "w-1.5 bg-[#ECE0CF] hover:bg-[#C4B89A]"
                    }`}
                    aria-label={`View ${features[i].title}`}
                  />
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="mt-8 flex items-center justify-between gap-4">
              <Link
                href={active.href}
                className="inline-flex items-center gap-2 font-inter font-medium text-[15px] leading-[22px] text-[#211F1C] underline underline-offset-2 hover:text-[#8A6A35] transition-colors"
              >
                See full step-by-step guide
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <span className="font-inter text-[13px] text-[#737270]">
                {activeIndex + 1} / {features.length}
              </span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
