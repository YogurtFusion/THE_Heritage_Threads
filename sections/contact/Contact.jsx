"use client";
import ChatBubble from "@/components/Icons/ChatBubble";
import { EmailIcon } from "@/components/Icons/EmailIcon";
import LocationIcon from "@/components/Icons/LocationIcon";
import { PhoneIcon } from "@/components/Icons/PhoneIcon";
import SunFlowerIcon from "@/components/Icons/SunFlowerIcon";
import React from "react";
import ContactForm from "./ContactForm";
import ContactBtn from "@/components/ui/ContactBtn";
import { useSettings } from "@/context/settingsContext";

const Contact = () => {
  const settings = useSettings();
  const email = settings?.contactEmail || "artisan@heritagethreads.com";
  const phone = settings?.contactPhone || "+91 800 123 4567";
  const address = settings?.contactAddress || "Studio 4A, Weaver's Enclave\nTextile District, Mumbai\nIndia 400001";
  const whatsappPhone = settings?.contactPhone?.replace(/\D/g, "") || "918001234567";

  return (
    <div>
      <main className="bg-body min-h-screen py-16 px-6 md:px-12 lg:px-24">
        <section className="max-w-6xl mx-auto mb-16">
          <h1 className="text-heading text-5xl md:text-6xl font-bold uppercase mb-6">Contact Us</h1>
          <p className="font-inter text-body-text max-w-2xl text-lg leading-relaxed">
            For bespoke commissions, artisan inquiries, or simply to learn more about our heritage craft.
          </p>
        </section>

        <section className="max-w-6xl mx-auto flex flex-col lg:flex-row border border-border">
          {/* Left — Form */}
          <div className="w-full lg:w-1/2 bg-card p-8 md:p-16 relative overflow-hidden">
            <ContactForm />
            <div className="absolute -bottom-16 -right-16 text-border opacity-40 pointer-events-none">
              <SunFlowerIcon />
            </div>
          </div>

          {/* Right — Info */}
          <div className="w-full lg:w-1/2 bg-body p-8 md:p-16 flex flex-col justify-center">
            <div className="mb-12">
              <h2 className="text-heading text-2xl mb-8 font-semibold">Direct Lines</h2>
              <ul className="space-y-6">
                <li className="flex items-start gap-4 text-body-text font-inter">
                  <EmailIcon />
                  <a href={`mailto:${email}`} className="hover:text-primary transition-colors">{email}</a>
                </li>
                <li className="flex items-start gap-4 text-body-text font-inter">
                  <PhoneIcon />
                  <a href={`tel:${phone}`} className="hover:text-primary transition-colors">{phone}</a>
                </li>
                <li className="flex items-start gap-4 text-body-text font-inter">
                  <LocationIcon />
                  <div>
                    {address.split("\n").map((line, i) => <p key={i}>{line}</p>)}
                  </div>
                </li>
              </ul>
            </div>

            <div className="flex items-center gap-4 mb-12">
              <div className="flex-1 h-px bg-border" />
              <SunFlowerIcon />
              <div className="flex-1 h-px bg-border" />
            </div>

            <div>
              <h2 className="text-heading text-2xl mb-4 font-semibold">Immediate Assistance</h2>
              <p className="font-inter text-body-text mb-6 text-sm leading-relaxed">
                For urgent bespoke updates or direct artisan consultation, reach us on WhatsApp.
              </p>
              <ContactBtn
                title="Chat on WhatsApp"
                mainClass="text-secondary border border-secondary text-secondary"
                textHover="group-hover/btn:text-body"
                hoverClass="bg-secondary text-body"
                href={`https://wa.me/${whatsappPhone}`}
              />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Contact;
