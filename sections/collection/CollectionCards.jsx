"use client";
import React from "react";
import AddCartBtn from "@/components/ui/AddCartBtn";
import Image from "next/image";
import Link from "next/link";

export const CollectionCards = ({ _id, id, img, images, title, name, price, index }) => {
  const productId = _id ?? id;
  const displayTitle = title ?? name ?? "";
  const isApiProduct = !!_id; // API products have _id

  const product = {
    id: productId,
    name: displayTitle,
    price,
    image: images?.[0] ?? null,
  };

  return (
    <article className="group flex flex-col">
      <Link href={isApiProduct ? `/product/${productId}` : "/preview"}>
        <div className="relative aspect-4/5 bg-[#1C2628] mb-5 overflow-hidden">
          {img ? (
            <Image
              src={img}
              alt={displayTitle}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out opacity-90"
              priority={index < 3}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              fill
            />
          ) : images?.[0] ? (
            <img
              src={images[0]}
              alt={displayTitle}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out opacity-90"
            />
          ) : (
            <div className="w-full h-full bg-section" />
          )}
        </div>
      </Link>
      <h3 className="font-playfair text-xl text-heading mb-1">{displayTitle}</h3>
      <p className="text-sm text-muted-text mb-4">₹{price}</p>
      <AddCartBtn product={product} />    </article>
  );
};
