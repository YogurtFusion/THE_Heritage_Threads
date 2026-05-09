import AddCartBtn from '@/components/ui/AddCartBtn'
import SecondaryBtn from '@/components/ui/SecondaryBtn'
import React from 'react'

const CheckoutSucess = () => {
  return (
      <section className="max-w-150 mx-auto text-center pb-16">
          <div className="w-14 h-14 bg-tertiary mx-auto flex items-center justify-center mb-8">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h2 className="font-playfair text-4xl text-heading mb-4 font-semibold">
            Thank you for your order.
          </h2>
          <p className="text-body-text text-[15px] mb-12 leading-relaxed">
            Your artisanal piece is being prepared for its journey. We have sent a <br className="hidden sm:block"/>
            confirmation email with detailed tracking information.
          </p>

          <div className="bg-transparent border border-border p-8 text-left mb-12">
            <h3 className="text-xs font-bold tracking-widest text-heading mb-6 border-b border-border pb-4 uppercase">
              Order Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-4">
              <div>
                <p className="text-[9px] font-bold text-muted-text tracking-widest uppercase mb-1.5">
                  Order Number
                </p>
                <p className="text-heading text-sm font-medium">
                  #HT-88492
                </p>
              </div>
              <div>
                <p className="text-[9px] font-bold text-muted-text tracking-widest uppercase mb-1.5">
                  Date
                </p>
                <p className="text-heading text-sm font-medium">
                  October 24, 2024
                </p>
              </div>
              <div className="md:col-span-2">
                <p className="text-[9px] font-bold text-muted-text tracking-widest uppercase mb-1.5">
                  Confirmation Sent To
                </p>
                <p className="text-heading text-sm font-medium">
                  customer@example.com
                </p>
              </div>
            </div>
          </div>

     
          <SecondaryBtn
          title={"  Return to Collection "}
          MainClass={"px-8 py-3.5 font-bold text-xs tracking-widest uppercase"}
          />
        </section>
  )
}

export default CheckoutSucess
