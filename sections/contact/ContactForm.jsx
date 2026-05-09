"use client";
import React, { useState } from "react";
import toast from "react-hot-toast";

const ContactForm = () => {
  const [form, setForm] = useState({ name: "", email: "", inquiryType: "General Inquiry", message: "" });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, email: form.email, message: `[${form.inquiryType}] ${form.message}` }),
      });
      const data = await res.json();
      if (data.success) {
        setSent(true);
        toast.success("Message sent successfully!");
      } else {
        toast.error(data.message ?? "Failed to send message");
      }
    } catch {
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="relative z-10 flex flex-col items-center justify-center py-16 text-center gap-4">
        <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mb-2">
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="font-playfair text-2xl text-heading">Message Sent</h3>
        <p className="text-body-text text-sm">We'll get back to you within 24 hours.</p>
        <button
          onClick={() => { setSent(false); setForm({ name: "", email: "", inquiryType: "General Inquiry", message: "" }); }}
          className="text-sm text-primary hover:text-primary-hover transition-colors mt-2"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form className="relative z-10" onSubmit={handleSubmit}>
      {/* Full Name */}
      <div className="mb-8">
        <label className="block font-inter text-xs font-bold tracking-widest text-heading uppercase mb-2">
          Full Name
        </label>
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="e.g. Anjali Desai"
          required
          className="w-full bg-transparent border-b border-heading py-2 font-inter text-body-text placeholder:text-muted-text focus:outline-none focus:border-primary transition-colors"
        />
      </div>

      {/* Email */}
      <div className="mb-8">
        <label className="block font-inter text-xs font-bold tracking-widest text-heading uppercase mb-2">
          Email Address
        </label>
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="anjali@example.com"
          required
          className="w-full bg-transparent border-b border-heading py-2 font-inter text-body-text placeholder:text-muted-text focus:outline-none focus:border-primary transition-colors"
        />
      </div>

      {/* Inquiry Type */}
      <div className="mb-8 relative">
        <label className="block font-inter text-xs font-bold tracking-widest text-heading uppercase mb-2">
          Inquiry Type
        </label>
        <select
          name="inquiryType"
          value={form.inquiryType}
          onChange={handleChange}
          className="w-full bg-transparent border-b border-heading py-2 font-inter text-body-text appearance-none focus:outline-none focus:border-primary transition-colors cursor-pointer"
        >
          <option>General Inquiry</option>
          <option>Bespoke Commission</option>
          <option>Artisan Application</option>
          <option>Order Support</option>
        </select>
        <div className="absolute right-0 bottom-3 pointer-events-none text-heading">
          <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
            <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      {/* Message */}
      <div className="mb-12">
        <label className="block font-inter text-xs font-bold tracking-widest text-heading uppercase mb-2">
          Message
        </label>
        <textarea
          name="message"
          value={form.message}
          onChange={handleChange}
          placeholder="How may we assist you?"
          rows="4"
          required
          className="w-full bg-transparent border-b border-heading py-2 font-inter text-body-text placeholder:text-muted-text focus:outline-none focus:border-primary transition-colors resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="group/btn uppercase relative flex justify-center items-center bg-primary text-white px-6 py-3 text-sm tracking-widest font-bold cursor-pointer overflow-hidden hover:bg-primary-hover transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? "Sending…" : "Send Message"}
      </button>
    </form>
  );
};

export default ContactForm;
