// Auth page shell — "split" = coloured lobe side panel + form column; "centered" = corner blob + card.

import React from "react";
import { Link } from "react-router-dom";
import Logo from "./Logo";
import SiteFooter, { FeaturesOverview } from "./SiteFooter";

interface AuthLayoutProps {
  children: React.ReactNode;
  leftContent?: React.ReactNode;
  variant?: "split" | "centered";
  // Section colour key: today | tasks | events | notes | aura | know.
  color?: "today" | "tasks" | "events" | "notes" | "aura" | "know";
  // Place the centered-variant blob at the top-left or bottom-right.
  blob?: "tl" | "br";
}

const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  leftContent,
  variant = "split",
  color = "today",
  blob = "tl",
}) => {
  const sec = `sec-${color}`;

  if (variant === "centered") {
    return (
      <div className={`${sec} relative grid min-h-screen place-items-center overflow-hidden bg-water px-5 py-10 text-ink`}>
        <div
          aria-hidden="true"
          className={`absolute h-[620px] w-[760px] bg-sec ${
            blob === "tl"
              ? "-left-[120px] -top-[160px] rounded-[44%_56%_60%_40%/50%_42%_58%_50%]"
              : "-bottom-[180px] -right-[140px] rounded-[56%_44%_40%_60%/50%_58%_42%_50%]"
          }`}
        />
        <Link to="/" className="absolute left-8 top-6 text-[#1F211E]" aria-label="AuraOne home">
          <Logo textOnly />
        </Link>
        <div className="relative w-[min(520px,100%)]">{children}</div>
      </div>
    );
  }

  return (
    <div className={`${sec} min-h-screen bg-water text-ink`}>
    <div className="grid min-h-screen lg:grid-cols-[minmax(0,1fr)_minmax(0,560px)]">
      <div className="flex min-h-[320px] flex-col rounded-b-[50%_22%] bg-sec px-8 pb-14 pt-7 text-[#1F211E] lg:rounded-b-none lg:rounded-r-[52%_46%] lg:py-10 lg:pl-12 lg:pr-24 lg:pb-16 [&_*]:text-[#1F211E] lm-lobe-in" style={{ viewTransitionName: "auth-lobe" }}>
        <Link to="/" viewTransition aria-label="AuraOne home">
          <Logo textOnly />
        </Link>
        <div className="lm-stagger mt-auto">{leftContent}</div>
      </div>
      <div className="flex flex-col justify-center px-5 py-8 lg:px-14 lg:py-14" style={{ viewTransitionName: "auth-form" }}>{children}</div>
    </div>
    <div className="mx-auto max-w-[1440px]">
    <FeaturesOverview />
    <SiteFooter />
    </div>
    </div>
  );
};

export default AuthLayout;
