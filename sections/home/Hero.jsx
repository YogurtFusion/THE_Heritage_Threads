import React from "react";
import Image from "next/image";
import HeroImg from "@/public/assets/hero/hero.png";
import MobileImg from "@/public/assets/hero/mobile.png";
import MainBtn from "../../components/ui/HomeBtn";

const Hero = () => {
  return (
    <section className=" relative  h-screen md:min-h-screen lg:h-fit w-full  overflow-hidden bg-body shrink-0">
      {/* wrap */}
      <div className=" relative flex flex-col lg:flex-row  justify-between items-center gap-6  w-full h-full  ">
        {/* img */}
        <Image
          src={HeroImg}
          className=" hidden lg:block max-w-2/3 w-full h-full object-cover"
          alt="hero background"
          loading="eager"
        />
        <Image
          src={MobileImg}
          className=" absolute inset-0 z-0 w-full h-full object-center object-cover  lg:hidden"
          alt="hero background"
          loading="eager"
        />

        {/* body */}
        <div className=" relative z-10 w-full h-full flex flex-col justify-center items-center gap-4  lg:gap-6 md:items-start text-center lg:text-left p-6 md:p-12  lg:max-w-1/3 ">
          <div className="bg-white/80 p-6 rounded-xl lg:bg-transparent lg:p-0 lg:rounded-none  flex flex-col items-center lg:items-start gap-4 md:gap-8">
            <h1 className=" text-4xl md:text-5xl font-semibold max-w-xs md:max-w-full">
              Carry a 3,000 year-old{" "}
              <span className="text-primary">legacy</span> in your pocket.
            </h1>

            <MainBtn
              mainClass={" text-white bg-primary px-3 py-2"}
              hoverClass={"bg-primary-hover"}
              href={"/collection"}
              />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
