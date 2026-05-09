import Category from "@/sections/home/Category";
import Cta from "@/sections/home/Cta";
import Hero from "@/sections/home/Hero";
import Keychain from "@/sections/home/Keychains";
import Trending from "@/sections/home/Trending";
import Zipchains from "@/sections/home/Zipchains";

export default function Home() {
  return (
    <div>
      <Hero />
      <Category />
      <Trending />
      <Zipchains />
      <Keychain />
      <Cta />
    </div>
  );
}
