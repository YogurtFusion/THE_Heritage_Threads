import Image from "next/image";
import React from "react";
import Img1 from "@/public/assets/products/img1.png";
import Img2 from "@/public/assets/products/img2.png";
import Img3 from "@/public/assets/products/img3.png";
import SunFlowerIcon from "@/components/Icons/SunFlowerIcon";
import PrimaryBtn from "@/components/ui/PrimaryBtn";
import PreviewBtn from "./PreviewBtn";

export const Preview = () => {
  return (

    <main className="bg-body min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          {/* Left Section: Product Image Gallery */}
          <section className="flex flex-col gap-6">
            {/* Main Product Image */}
            <div className="relative border border-border bg-white">
              {/* Badge */}
              <div className="absolute top-6 left-6 bg-section border border-black/20 px-3 py-1.5">
                <span className="font-inter text-xs font-bold tracking-widest uppercase text-heading">
                  Handcrafted
                </span>
              </div>
              <Image
                src={Img1}
                alt="Matsya Mithila Keychain Front"
                className="w-full h-auto object-cover aspect-4/5"
              />
            </div>

            {/* Thumbnail Images */}
            <div className="grid grid-cols-2 gap-6">
              <div className="border border-border bg-white">
                <Image
                  src={Img2}
                  alt="Keychain Detail Back"
                  className="w-full h-auto object-cover aspect-square"
                />
              </div>
              <div className="border border-border bg-white">
                <Image
                  src={Img3}
                  alt="Keychain Detail Flatlay"
                  className="w-full h-auto object-cover aspect-square"
                  loading="eager"
                />
              </div>
            </div>
          </section>

          {/* Right Section: Product Information */}
          <section className="flex flex-col py-4 lg:py-8">
            {/* Breadcrumbs */}
            <nav className="font-inter text-[10px] tracking-[0.15em] uppercase mb-8">
              <span className="text-muted-text">Collection</span>
              <span className="text-muted-text mx-2">/</span>
              <span className="text-muted-text">Accessories</span>
              <span className="text-muted-text mx-2">/</span>
              <span className="text-heading font-semibold">
                Mithila Keychain
              </span>
            </nav>

            {/* Product Title & Price */}
            <h1 className="font-playfair text-4xl lg:text-5xl text-heading leading-[1.1] mb-6">
              Matsya Mithila
              <br />
              Keychain
            </h1>
            <p className="font-playfair text-2xl text-primary font-semibold mb-10">
              ₹1,250
            </p>

            {/* Product Description */}
            <p className="font-inter text-body-text text-sm leading-[1.8] mb-12">
              A utilitarian piece of art. This keychain features the traditional
              Matsya (fish) motif, symbolizing fertility and prosperity in
              Mithila culture, hand-painted with precision on sustainably
              sourced mahogany wood.
            </p>

            {/* Call to Action */}
         <PreviewBtn/>
            {/* Shipping Info */}
            <p className="text-center font-inter text-muted-text text-[9px] font-medium tracking-[0.2em] uppercase mt-5 mb-12">
              Free shipping on orders over ₹5,000
            </p>

            {/* Decorative Divider */}
            <div className="flex items-center justify-center mb-12">
              <div className="w-16 h-px bg-border"></div>
              <div className="w-5 h-5 mx-4 text-muted-text">
                <SunFlowerIcon />
              </div>
              <div className="w-16 h-px bg-border"></div>
            </div>

            {/* Artisan Story Card */}
            <article className="border border-border bg-transparent p-7">
              <h2 className="font-inter text-[10px] font-bold tracking-[0.15em] uppercase text-heading mb-5">
                The Artisan's Story
              </h2>
              <div className="flex gap-5">
                <div className="w-16 h-16 shrink-0 bg-gray-200">
                  <img
                    src="/placeholder-artisan.jpg"
                    alt="Sunita Devi"
                    className="w-full h-full object-cover grayscale"
                  />
                </div>
                <p className="font-inter text-[13px] text-muted-text leading-[1.7]">
                  Crafted by Sunita Devi in Madhubani, Bihar. With over 20 years
                  of experience, Sunita translates her family's traditional wall
                  mural techniques into miniature, durable accessories for
                  everyday carry.
                </p>
              </div>
            </article>
          </section>
        </div>
      </div>
    </main>
  );
};
