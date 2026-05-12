"use client";
import React, { useState } from "react";
import AddCartBtn from "@/components/ui/AddCartBtn";
import Image from "next/image";
import Link from "next/link";

export const CollectionCards = ({
  _id,
  id,
  img,
  images,
  title,
  name,
  price,
  index,
}) => {
  const productId = _id ?? id;
  const displayTitle = title ?? name ?? "";
  const isApiProduct = !!_id;
  const [hovered, setHovered] = useState(false);

  // First image = main, second image = hover
  const mainImage = images?.[0] ?? img ?? null;
  const hoverImage = images?.[1] ?? null;

  const product = {
    id: productId,
    name: displayTitle,
    price,
    image: mainImage,
  };

  return (
    <article className="group flex flex-col ">
      <Link
        href={isApiProduct ? `/product/${productId}` : "/preview"}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div className="relative aspect-4/5 bg-[#1C2628] mb-5 overflow-hidden">
          {/* Main image */}
          {mainImage &&
            (img ? (
              <Image
                src={img}
                alt={displayTitle}
                className={`w-full h-full object-cover transition-all duration-700 ease-out ${hovered && hoverImage ? "opacity-0 scale-105" : "opacity-90 scale-100"}`}
                priority={index < 3}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                fill
              />
            ) : (
              <img
                src={mainImage}
                alt={displayTitle}
                className={`w-full h-full object-cover transition-all duration-700 ease-out absolute inset-0 ${hovered && hoverImage ? "opacity-0 scale-105" : "opacity-90 scale-100"}`}
              />
            ))}

          {/* Hover image (second image) */}
          {hoverImage && (
            <img
              src={hoverImage}
              alt={`${displayTitle} — alternate view`}
              className={`w-full h-full object-cover transition-all duration-700 ease-out absolute inset-0 ${hovered ? "opacity-100 scale-100" : "opacity-0 scale-105"}`}
            />
          )}

          {/* Fallback */}
          {!mainImage && <div className="w-full h-full bg-section" />}
        </div>
      </Link>
      <div className=" flex flex-col grow">
        <h3 className="font-inter text-base font-bold  text-heading mb-1 line-clamp-2">
          {displayTitle}
        </h3>
        <div className="mt-auto">
          <p className="text-sm text-heading mb-4">₹{price}</p>
        </div>
        <AddCartBtn product={product} />
      </div>
    </article>
  );
};
