import Header from "@/components/header";
import Hero from "@/components/hero";
import Menu from "@/components/menu";
import Location from "@/components/location";
import ContactForm from "@/components/contact-form";
import Footer from "@/components/footer";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
      <Menu />
      <Location />
      <ContactForm />
      <Footer />
    </main>
  );
}
