import Header from "@/components/header";
import Hero from "@/components/hero";
import Menu from "@/components/menu";
import Location from "@/components/location";
import ContactForm from "@/components/contact-form";
import Footer from "@/components/footer";

export default function Home() {
  return (
    <>
      {/* Skip to main content for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-amber-700 focus:text-white focus:rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600 focus:ring-offset-2"
      >
        메인 콘텐츠로 이동
      </a>
      <main id="main-content" className="min-h-screen">
        <Header />
        <Hero />
        <Menu />
        <Location />
        <ContactForm />
        <Footer />
      </main>
    </>
  );
}
