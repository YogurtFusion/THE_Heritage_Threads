import React from "react";
import HeroImg from "@/public/assets/about/hero.png";
import Image from "next/image";
import SunIcon from "@/components/Icons/SunIcon";
import TreeIcon from "@/components/Icons/TreeIcon";

export default function AboutPage() {
  return (
    <main className="bg-body  py-12 px-6 md:px-12 lg:px-24 ">
      {/* Hero Section */}

      <section className=" relative  max-w-6xl mx-auto flex flex-col-reverse lg:flex-row items-center justify-end lg:justify-between gap-12 min-h-[85vh] lg:min-h-0 lg:gap-24 mb-16 lg:mb-24  pt-8 overflow-hidden lg:overflow-visible">
        {/* Left: Text Content */}
        <div className="relative z-10 flex flex-col justify-center items-center lg:items-start  w-full lg:w-1/2 px-6 lg:px-0">
          <h1 className=" text-heading text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight text-center lg:text-left">
            Artisanal <br />
            Integrity.
          </h1>
          <div className="relative z-10 max-w-xs mx-auto lg:mx-0 md:max-w-md text-center md:text-left ">
            <div className=" lg:hidden absolute inset-0 z-0 bg-white/50 backdrop-blur-md p-6 md:p-8 rounded-lg "></div>
            <p className="relative text-body-text text-base md:text-lg leading-relaxed md:px-4 md:py-2 ">
              Weaving a 3,000-year legacy of Madhubani art into modern,
              structured utility. Every thread tells a story of heritage and
              precision.
            </p>
          </div>
        </div>

        {/* Right: Featured Image */}
        <div className=" absolute inset-0 lg:relative w-full lg:w-1/2 lg:flex lg:justify-end  ">
          <div className=" relative w-full h-full lg:max-w-md lg:aspect-4/5 bg-card  overflow-hidden">
            <div className="absolute z-10 inset-0 opacity-10 pointer-events-none mix-blend-overlay "></div>
            <Image
              src={HeroImg}
              alt="Artisan working on Madhubani art"
              className="w-full h-full object-cover "
            />
          </div>
        </div>
      </section>

      {/* The Legacy Section */}
      <section className="  max-w-6xl mx-auto flex flex-col md:flex-row gap-12 lg:gap-16  md:mb-24  lg:py-24 px-6 lg:px-0 ">
        {/* Left: Title & Badge */}
        <div className="w-full md:w-5/12 shrink-0">
          <div className="inline-block border-b border-section/60 px-2 py-1 mb-6">
            <span className=" text-heading text-xs font-bold tracking-[0.2em] uppercase">
              The Legacy
            </span>
          </div>
          <h2 className=" text-heading text-4xl md:text-5xl font-bold leading-tight pr-4">
            3,000 Years of <br />
            Structured <br />
            Warmth.
          </h2>
        </div>

        {/* Right: Description (with vertical border on desktop) */}
        <div className="w-full md:w-7/12 md:border-l border-section/30 md:pl-12 lg:pl-16 flex flex-col justify-center">
          <p className=" text-body-text text-sm md:text-base leading-relaxed mb-6">
            Originating in the Mithila region, our art form was born as a
            communal expression, painted on freshly plastered mud walls. Today,
            Heritage Threads translates this historic visual language into
            high-contrast minimalism.
          </p>
          <p className=" text-body-text text-sm md:text-base leading-relaxed">
            We reject the superficial. Our design philosophy merges the rugged,
            grid-dominant architecture of urban technical gear with the soulful,
            hand-painted precision of our ancestors. The result is an artifact
            of modern utility, as durable as a messenger bag, yet as organic as
            hand-loomed silk.
          </p>
        </div>
      </section>

      {/* Decorative Separator Icon */}
      <div className="flex justify-center  my-20 md:mb-32 text-heading">
        <SunIcon />
      </div>

      {/* Mission Block Section */}
      <section className="max-w-6xl mx-auto bg-section-2 px-8 py-20 md:py-24 flex flex-col items-center justify-center text-center">
        {/* Drafting/Compass Icon */}
        <div className="text-primary mb-8">
          <TreeIcon />
        </div>

        {/* Mission Statement */}
        <h3 className=" text-heading text-2xl md:text-3xl lg:text-4xl leading-relaxed max-w-4xl mb-8">
          "To preserve the hand-painted precision of Mithila art within the
          rigid architecture of contemporary design."
        </h3>

        {/* Label */}
        <span className=" text-heading text-xs font-bold tracking-[0.2em] uppercase">
          Our Mission
        </span>
      </section>
    </main>
  );
}
