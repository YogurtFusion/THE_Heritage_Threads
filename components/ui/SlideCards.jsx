"use client";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import AddCartBtn from "./AddCartBtn";

export default function SlideCard({ id, _id, img, images, title, name, price }) {
  const displayImg = img ?? null;
  const displayTitle = title ?? name ?? "";
  const productId = _id ?? id ?? displayTitle;
  const isApiProduct = !!_id;
  const [hovered, setHovered] = useState(false);

  // First = main, second = hover
  const mainImage = displayImg ?? images?.[0] ?? null;
  const hoverImage = images?.[1] ?? null;

  const product = {
    id: productId,
    name: displayTitle,
    price,
    image: mainImage,
  };

  return (
    <div className="flex flex-col gap-4 max-w-200">
      <Link
        href={isApiProduct ? `/product/${productId}` : "/preview"}
        className="block"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div className="relative w-full aspect-square overflow-hidden bg-card">
          {/* Main image */}
          {displayImg ? (
            <Image
              className={`object-center object-cover transition-all duration-700 ${hovered && hoverImage ? "opacity-0 scale-105" : "opacity-100 scale-100"}`}
              src={displayImg}
              alt={displayTitle}
              fill
              sizes="(max-width: 768px) 85vw, (max-width: 1200px) 40vw, 30vw"
            />
          ) : mainImage ? (
            <img
              src={mainImage}
              alt={displayTitle}
              className={`w-full h-full object-cover object-center absolute inset-0 transition-all duration-700 ${hovered && hoverImage ? "opacity-0 scale-105" : "opacity-100 scale-100"}`}
            />
          ) : (
            <div className="w-full h-full bg-section" />
          )}

          {/* Hover image */}
          {hoverImage && (
            <img
              src={hoverImage}
              alt={`${displayTitle} — alternate view`}
              className={`w-full h-full object-cover object-center absolute inset-0 transition-all duration-700 ${hovered ? "opacity-100 scale-100" : "opacity-0 scale-105"}`}
            />
          )}
        </div>
      </Link>

      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-start gap-2">
          <Link href={isApiProduct ? `/product/${productId}` : "/preview"}>
            <h3 className="text-heading text-lg font-normal leading-[140%] hover:text-primary transition-colors">
              {displayTitle}
            </h3>
          </Link>
          <span className="text-primary text-base leading-[150%] font-medium shrink-0">
            ₹{price}
          </span>
        </div>
        <AddCartBtn product={product} />
      </div>
    </div>
  );
}
