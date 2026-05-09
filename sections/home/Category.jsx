import React from "react";
import CategoryCard from "../../components/ui/CategoryCard";
import ZipChains from "@/public/assets/category/key-chains.png";
import KeyChains from "@/public/assets/category/zip-chains.png";

const Category = () => {
  return (
    <section className="bg-section/10 w-full  ">
      {/* wrap */}
      <div className="max-w-screen-2xl min-h-[80vh] md:min-h-[80vh] mx-auto py-10 md:py-0 px-4 md:px-12 flex flex-col justify-center">
        
        {/* Added heading section with an optional descriptive subtext */}
        <div className="my-8 md:my-24 w-full">
          <h2 className="text-3xl md:text-4xl font-medium text-gray-900">
            Explore Our Collections
          </h2>
          <p className="text-gray-600 mt-2 text-sm md:text-base">
            Select a category to view our handcrafted designs.
          </p>
        </div>
        {/* cards */}
        <div className="  grid grid-cols-1 lg:grid-cols-2   gap-6 w-full h-auto  ">
          <CategoryCard img={ZipChains} title={"Zipchains"} />
          <CategoryCard img={KeyChains} title={"KeyChains"} />
        </div>
      </div>
    </section>
  );
};

export default Category;
