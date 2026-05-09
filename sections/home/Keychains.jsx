"use client";
import React, { useEffect, useState } from "react";
import SlideCard from "../../components/ui/SlideCards";
import { Keychaindata } from "@/data/product";
import MainBtn from "../../components/ui/HomeBtn";

const Keychain = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/products?category=keychains&limit=9")
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.data.products.length > 0) {
          setProducts(d.data.products);
        } else {
          setProducts(Keychaindata);
        }
      })
      .catch(() => setProducts(Keychaindata))
      .finally(() => setLoading(false));
  }, []);

  const items = loading ? Keychaindata : products;

  return (
    <section className="bg-body">
      <div className="mb-12 lg:mb-28">
        <div className="px-6 lg:px-12 mb-12 flex justify-between items-end">
          <div>
            <span className="uppercase text-primary text-xs font-bold leading-4 tracking-[2.4px] block mb-2">
              CURATED SELECTION
            </span>
            <h2 className="text-heading text-4xl leading-[110%]">Keychains</h2>
          </div>
          <div>
            <MainBtn
              mainClass="border border-primary text-primary group-hover/btn:text-card px-3 py-2"
              hidden="hidden md:block"
              hoverClass="bg-primary"
              textHover="group-hover/btn:text-card group-active/btn:text-card"
              href="/collection"
            />
          </div>
        </div>

        <div className="flex gap-8 overflow-x-auto snap-x snap-mandatory no-scrollbar px-6 lg:px-12 scroll-px-6 lg:scroll-px-12">
          {items.map((item) => (
            <div key={item._id ?? item.id} className="min-w-[80vw] md:min-w-[40vw] lg:min-w-[25vw]">
              <SlideCard
                id={item._id ?? item.id}
                _id={item._id}
                img={item.img}
                images={item.images}
                title={item.title ?? item.name}
                subhead={item.subhead ?? item.description}
                price={item.price}
              />
            </div>
          ))}
          <div className="min-w-px h-1" aria-hidden="true" />
        </div>
      </div>
    </section>
  );
};

export default Keychain;
