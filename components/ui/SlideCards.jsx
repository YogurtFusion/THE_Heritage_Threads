import Image from "next/image";
import Link from "next/link";
import React from "react";
import AddCartBtn from "./AddCartBtn";

export default function SlideCard({ id, _id, img, images, title, name, price }) {
  const displayImg = img ?? null;
  const displayTitle = title ?? name ?? "";
  const productId = _id ?? id ?? displayTitle;
  const isApiProduct = !!_id;

  const product = {
    id: productId,
    name: displayTitle,
    price,
    image: displayImg ?? images?.[0] ?? null,
  };

  const imageEl = displayImg ? (
    <Image
      className="object-center object-cover"
      src={displayImg}
      alt={displayTitle}
      fill
      sizes="(max-width: 768px) 85vw, (max-width: 1200px) 40vw, 30vw"
    />
  ) : images?.[0] ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={images[0]}
      alt={displayTitle}
      className="w-full h-full object-cover object-center"
    />
  ) : (
    <div className="w-full h-full bg-section" />
  );

  return (
    <div className="flex flex-col gap-4 max-w-200">
      <Link href={isApiProduct ? `/product/${productId}` : "/preview"} className="block">
        <div className="relative w-full aspect-square overflow-hidden bg-card hover:opacity-95 transition-opacity">
          {imageEl}
        </div>
      </Link>

      {/* card body — no description shown here, only on detail page */}
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
