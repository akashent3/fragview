"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";

interface FeatureDiscoveryBannerProps {
  storageKey: string;
  icon: React.ReactNode;
  heading: string;
  description: string;
  steps?: string[];
  ctaText?: string;
  ctaHref?: string;
}

const FeatureDiscoveryBanner = ({
  storageKey,
  icon,
  heading,
  description,
  steps,
  ctaText,
  ctaHref,
}: FeatureDiscoveryBannerProps) => {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const dismissed = localStorage.getItem(storageKey);
      if (!dismissed) setVisible(true);
    } catch {}
  }, [storageKey]);

  const dismiss = () => {
    try {
      localStorage.setItem(storageKey, "1");
    } catch {}
    setVisible(false);
  };

  // Never render anything until after client mount — prevents hydration mismatch
  if (!mounted || !visible) return <span suppressHydrationWarning />;

  return (
    <div className="flex items-start gap-3 sm:gap-4 rounded-xl border border-[#ECE0CF] bg-[#FFF9EF] px-4 py-3 sm:px-5">
      {/* Left olive accent bar */}
      <div className="mt-0.5 h-auto w-1 self-stretch rounded-full bg-[#8A6A35] shrink-0" />

      {/* Icon */}
      <div className="mt-0.5 hidden sm:flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#ECE0CF] bg-white text-[#8A6A35]">
        {icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="font-hedvig text-[14px] sm:text-[15px] leading-[22px] text-[#211F1C]">
          {heading}
        </p>
        <p className="mt-0.5 font-inter text-[12px] sm:text-[13px] leading-[19px] text-[#4A4946]">
          {description}
        </p>

        {/* Compact numbered steps */}
        {steps && steps.length > 0 && (
          <ol className="mt-2 flex flex-col gap-1.5">
            {steps.map((step, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-[#ECE0CF] font-inter text-[10px] font-semibold leading-none text-[#8A6A35] mt-[1px]">
                  {i + 1}
                </span>
                <span className="font-inter text-[12px] leading-[18px] text-[#4A4946]">
                  {step}
                </span>
              </li>
            ))}
          </ol>
        )}

        {ctaText && ctaHref && (
          <Link
            href={ctaHref}
            className="mt-2 inline-block font-inter text-[12px] sm:text-[13px] font-medium leading-[20px] text-[#211F1C] underline underline-offset-2 hover:text-[#8A6A35] transition-colors"
          >
            {ctaText}
          </Link>
        )}
      </div>

      {/* Dismiss */}
      <button
        onClick={dismiss}
        aria-label="Dismiss hint"
        className="mt-0.5 shrink-0 text-[#737270] hover:text-[#211F1C] transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

export default FeatureDiscoveryBanner;
