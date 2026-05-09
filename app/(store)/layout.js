import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar/Navbar";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
export default function StoreLayout({ children }) {
  return (
    <>
     <AnnouncementBar />
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  );
}

