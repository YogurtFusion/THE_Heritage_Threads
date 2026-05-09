import React from "react";
import Image from "next/image";
import CtaBg from "@/public/assets/cta/cta-bg.png";
import MainBtn from "../../components/ui/HomeBtn";

const Cta = () => {
  return (
    <section className="relative w-full h-[80vh] overflow-hidden bg-body">
      <div className="absolute inset-0 z-0 w-full h-full">
        <Image
          src={CtaBg}
          className="object-center object-cover"
          alt="background image of cta"
          fill
          priority
          sizes="100vw"
        />

        {/* Base dark overlay */}
        <div className="absolute inset-0 bg-black/55" />

        {/* Top fade — darkens the top edge */}
        <div className="absolute inset-x-0 top-0 h-40 bg-linear-to-b from-black/70 to-transparent" />

        {/* Bottom fade — darkens the bottom edge */}
        <div className="absolute inset-x-0 bottom-0 h-40 bg-linear-to-t from-black/70 to-transparent" />

        {/* Left warm vignette — adds traditional warmth */}
        <div className="absolute inset-y-0 left-0 w-1/3 bg-linear-to-r from-amber-950/40 to-transparent" />

        {/* Right warm vignette — mirrors left side */}
        <div className="absolute inset-y-0 right-0 w-1/3 bg-linear-to-l from-amber-950/40 to-transparent" />

        {/* Center radial glow — draws eye to content */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 60% at 50% 50%, transparent 30%, rgba(0,0,0,0.45) 100%)",
          }}
        />

        {/* Subtle warm gold tint overlay — premium traditional feel */}
        <div className="absolute inset-0 bg-amber-900/10 mix-blend-multiply" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex justify-center items-center gap-8 flex-col h-full px-6">
        {/* Decorative top line — traditional touch */}
        <div className="flex items-center gap-3">
          <div className="h-px w-12 bg-amber-400/70" />
          <span className="text-amber-400/80 text-xs tracking-[0.3em] uppercase font-light">
            Madhubani Heritage
          </span>
          <div className="h-px w-12 bg-amber-400/70" />
        </div>

        <h2 className="text-card text-center text-4xl md:text-6xl leading-[100%] w-full max-w-2xl">
          Own a <span className="text-secondary">piece</span> of the story.
        </h2>

        <p className="text-card/90 text-center text-base md:text-lg font-light tracking-wide leading-relaxed w-full max-w-xl">
          Every purchase supports our community of 40+ women artisans in
          Madhubani, preserving their heritage for generations to come.
        </p>

        <MainBtn
          mainClass="bg-primary text-card border-none px-10 py-4"
          hoverClass="bg-primary-hover"
          textHover="group-hover:text-card"
       href={"/collection"}
        />

        {/* Decorative bottom line — traditional touch */}
        <div className="flex items-center gap-3">
          <div className="h-px w-8 bg-card/30" />
          <div className="h-1 w-1 rounded-full bg-card/30" />
          <div className="h-px w-8 bg-card/30" />
        </div>
      </div>
    </section>
  );
};

export default Cta;
