"use client";
import React, { useEffect, useRef, useState } from "react";
import SlideCard from "../../components/ui/SlideCards";
import { Keychaindata } from "@/data/product";
import MainBtn from "../../components/ui/HomeBtn";
import { motion } from "framer-motion";
import ArrowLeft from "@/components/Icons/ArrowLeft";
import ArrowRight from "@/components/Icons/ArrowRight";

const Keychain = () => {
  const scrollRef = useRef(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(0);
  const [canScrollRight, setCanScrollRight] = useState(0);

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

  useEffect(() => {
    handleScroll()
  },[items]);

  const scroll=(direction)=>{
    if (scrollRef.current){
      const scrollAmount = 400;
      scrollRef.current.scrollBy({
        left:direction === "left"? -scrollAmout:scrollAmout,
        behavior:"smooth",
      })
    }
  }

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      const maxScroll = scrollWidth - clientWidth;
      const progress = maxScroll > 0 ? (scrollLeft / maxScroll) * 100 : 0;
      setScrollProgress(progress);
   
      setCanScrollLeft(scrollLeft>0)
      setCanScrollRight(Math.ceil(scrollLeft)<Math.floor(maxScroll))

    }
  };

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

        <div
        ref={scrollRef}
        onScroll={handleScroll}
         className="flex gap-8 overflow-x-auto overflow-y-hidden snap-x snap-mandatory no-scrollbar px-6 lg:px-12 scroll-px-6 lg:scroll-px-12">
          {items.map((item, index) => (
            <motion.div
              key={item._id ?? item.id}
              className="min-w-[80vw] md:min-w-[40vw] lg:min-w-[25vw]"
              initial={{ opacity: 0, y: 5 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.6,
                delay: index * 0.1,
              }}
            >
              <SlideCard
                id={item._id ?? item.id}
                _id={item._id}
                img={item.img}
                images={item.images}
                title={item.title ?? item.name}
                subhead={item.subhead ?? item.description}
                price={item.price}
              />
            </motion.div>
          ))}
          
        </div>
         <div className=" px-6 lg:px-12 mt-10  flex items-center justify-between gap-6">
          <div className="flex-1 h-0.5 w-full bg-border relative rounded-full  overflow-hidden">
            <div
              className="absolute top-0 left-0 h-full bg-heading transition-all duration-150 ease-out"
              style={{ width: `${scrollProgress}%` }}
            ></div>
          </div>

          <div className="hidden md:flex items-center  shrink-0 gap-4  ">
            <button
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
              className={`flex w-10 h-10 items-center justify-center    border rounded-full duration-300 transition-colors ${canScrollLeft ?"bg-body border-heading text-heading hover:bg-heading hover:text-body":" border-border text-muted-text cursor-not-allowed opacity-50"} `}
            >
              <ArrowLeft />
            </button>

            <button
            disabled={!canScrollRight}
              onClick={() => scroll("right")}
              className={`flex w-10 h-10 items-center justify-center border  rounded-full duration-300 transition-colors  ${canScrollRight?"bg-body hover:bg-heading hover:text-body  text-heading border-heading":" border-border text-muted-text cursor-not-allowed opacity-50"} `}
            >
              <ArrowRight />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Keychain;
