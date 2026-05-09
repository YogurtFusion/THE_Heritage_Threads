import React from 'react'
import PolicySidebar from './PolicySidebar'
import SunFlowerIcon from '@/components/Icons/SunFlowerIcon'
import PrimaryBtn from '@/components/ui/PrimaryBtn'

const PoliciesSection = () => {
  return (  <main className="bg-body min-h-screen pt-16 pb-24 px-6 md:px-12 lg:px-24">
      {/* Page Header */}
      <section className="max-w-6xl mx-auto mb-12">
        <h1 className="font-playfair text-heading text-4xl md:text-5xl font-bold mb-4">
          Policies
        </h1>
        <p className="font-inter text-body-text max-w-2xl text-base leading-relaxed">
          Clear, transparent guidelines on how we handle your orders, returns, and
          personal information. Artisanal soul, technical precision.
        </p>
        <hr className="border-border mt-12" />
      </section>

      {/* Main Content & Sidebar Layout */}
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-12 lg:gap-24 relative">
        
        {/* Sidebar Navigation */}
      <PolicySidebar/>

        {/* Policies Content */}
        <div className="flex-1 max-w-3xl">
          
          {/* Shipping Policy Section */}
          <section id="shipping" className="mb-20">
            <h2 className="font-playfair text-heading text-3xl font-semibold mb-6">
              Shipping Policy
            </h2>
            <p className="font-inter text-body-text text-sm leading-relaxed mb-8">
              We craft each piece with intentionality, and our shipping process reflects that same care. All orders are processed within 2-3 business days. You will receive a confirmation email with tracking information once your package has been dispatched.
            </p>

            <h3 className="font-playfair text-heading text-xl font-semibold mb-4">
              Domestic Rates
            </h3>
            
            {/* Rates Table */}
            <div className="border border-border rounded-sm mb-6">
              <div className="flex justify-between items-center p-4 border-b border-border">
                <span className="font-inter text-heading text-sm font-medium">Standard (5-7 Days)</span>
                <span className="font-inter text-body-text text-sm">$15.00</span>
              </div>
              <div className="flex justify-between items-center p-4 border-b border-border">
                <span className="font-inter text-heading text-sm font-medium">Expedited (2-3 Days)</span>
                <span className="font-inter text-body-text text-sm">$35.00</span>
              </div>
              <div className="flex justify-between items-center p-4">
                <span className="font-inter text-heading text-sm font-medium">Orders over $500</span>
                <span className="font-inter text-primary text-sm">Complimentary</span>
              </div>
            </div>

            <p className="font-inter text-muted-text text-sm leading-relaxed">
              Please note that handcrafted items marked as "Made to Order" may require an additional 10-14 days for production before shipping.
            </p>
          </section>

          {/* Decorative Separator */}
          <div className="flex items-center gap-4 mb-20">
            <div className="flex-1 h-px bg-border"></div>
            <div className="text-muted-text">
              {/* Sun/Star Icon */}
          <SunFlowerIcon/>
            </div>
            <div className="flex-1 h-px bg-border"></div>
          </div>

          {/* Returns & Exchanges Section */}
          <section id="returns" className="mb-20">
            <h2 className="font-playfair text-heading text-3xl font-semibold mb-6">
              Returns & Exchanges
            </h2>
            <p className="font-inter text-body-text text-sm leading-relaxed mb-8">
              We stand behind the quality of our artisans' work. If you are not entirely satisfied with your purchase, we accept returns within 14 days of delivery for store credit or a full refund to the original payment method.
            </p>

            <h3 className="font-playfair text-heading text-xl font-semibold mb-4">
              Conditions
            </h3>
            
            <ul className="list-disc pl-5 font-inter text-body-text text-sm space-y-3 mb-10 marker:text-muted-text">
              <li>Items must be unworn, unwashed, and in their original condition with all tags attached.</li>
              <li>Custom or bespoke pieces are final sale and cannot be returned.</li>
              <li>Return shipping costs are the responsibility of the customer unless the item is defective.</li>
            </ul>

            {/* Callout Box */}
            <div className="bg-[#F6EBE8] p-8 border border-section/30">
              <h4 className="font-inter text-heading text-xs font-bold tracking-widest uppercase mb-2">
                Initiate a Return
              </h4>
              <p className="font-inter text-body-text text-sm mb-6">
                Please email our concierge team to receive a Return Authorization Number (RAN) before shipping your item back.
              </p>
             
                 <PrimaryBtn
            href={"/"}
            title={" Contact Concierge"}
            mainClass={" text-white bg-primary   py-3 PX-6  "} 
            textHover={"text-xs tracking-widest uppercase font-bold "}
            hoverClass={"bg-primary-hover"}/> 
            </div>
          </section>

          {/* Decorative Separator */}
          <div className="flex items-center gap-4 mb-20">
            <div className="flex-1 h-px bg-border"></div>
            <div className="text-muted-text">
              {/* Drop/Leaf Icon */}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path>
              </svg>
            </div>
            <div className="flex-1 h-px bg-border"></div>
          </div>

          {/* Privacy Policy Section */}
          <section id="privacy" className="mb-20">
            <h2 className="font-playfair text-heading text-3xl font-semibold mb-6">
              Privacy Policy
            </h2>
            <p className="font-inter text-body-text text-sm leading-relaxed mb-6">
              Your privacy is as critical to us as the integrity of our textiles. We collect information to provide better services to our users, from determining basic details like language preferences to more complex things like which products you might find most compelling.
            </p>
            <p className="font-inter text-body-text text-sm leading-relaxed">
              We do not sell your personal data to third parties. Information collected during checkout is securely encrypted and used solely for fulfilling your order and communicating necessary updates.
            </p>
          </section>
          
        </div>
      </div>
    </main>
  )
}

export default PoliciesSection