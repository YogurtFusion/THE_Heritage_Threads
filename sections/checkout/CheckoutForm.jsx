import React from "react";
import CheckoutSummary from "./CheckoutSummary";
import DropDownArrow from "@/components/Icons/DropDownArrow";
import PrimaryBtn from "@/components/ui/PrimaryBtn";
import LockIcon from "@/components/Icons/LockIcon";

const CheckoutForm = () => {
  return (
    <section className="flex flex-col lg:flex-row gap-12 lg:gap-24 mb-24">
      {/* Left Column: Form Details */}
      <div className="flex-1">
        <div className="flex items-end justify-between border-b border-border pb-4 mb-8">
          <h1 className="font-playfair text-3xl text-heading">Checkout</h1>
          <span className="text-xs font-semibold tracking-widest text-heading uppercase">
            Secure Server
          </span>
        </div>

        <form>
          {/* 1. Contact Information */}
          <div className="mb-10">
            <p className="text-xs font-bold tracking-widest text-heading mb-4 uppercase">
              1. Contact Information
            </p>
            <input
              type="email"
              placeholder="EMAIL ADDRESS"
              className="w-full border border-border bg-transparent p-3.5 text-sm focus:outline-none placeholder:text-muted-text tex-body-t)]"
            />
          </div>

          {/* 2. Shipping Address */}
          <div className="mb-10">
            <p className="text-xs font-bold tracking-widest text-heading mb-4 uppercase">
              2. Shipping Address
            </p>
            <div className="grid grid-cols-4 gap-4">
              <div className="col-span-4 relative">
                <select className="w-full border border-border bg-transparent p-3.5 text-sm focus:outline-none text-body-text appearance-none cursor-pointer">
                  <option value="select state" disabled>
                    Select State
                  </option>
                  <option value="bihar" className="text-body-text text-sm">
                    Bihar
                  </option>
                  <option
                    value="maharashtra"
                    className="text-body-text text-sm"
                  >
                    Maharashtra
                  </option>
                </select>
                <DropDownArrow
                  mainClass={"absolute right-4 top-1/2 -translate-y-1/2"}
                />
              </div>
              <input
                type="text"
                placeholder="FIRST NAME"
                className="col-span-2 border border-border bg-transparent p-3.5 text-sm focus:outline-none placeholder:text-muted-text tex-body-t)]"
              />
              <input
                type="text"
                placeholder="LAST NAME"
                className="col-span-2 border border-border bg-transparent p-3.5 text-sm focus:outline-none placeholder:text-muted-text tex-body-t)]"
              />
              <input
                type="text"
                placeholder="STREET ADDRESS"
                className="col-span-4 border border-border bg-transparent p-3.5 text-sm focus:outline-none placeholder:text-muted-text tex-body-t)]"
              />
              <input
                type="text"
                placeholder="CITY"
                className="col-span-4 md:col-span-2 border border-border bg-transparent p-3.5 text-sm focus:outline-none placeholder:text-muted-text tex-body-t)]"
              />
              <input
                type="text"
                placeholder="STATE"
                className="col-span-2 md:col-span-1 border border-border bg-transparent p-3.5 text-sm focus:outline-none placeholder:text-muted-text tex-body-t)]"
              />
              <input
                type="text"
                placeholder="ZIP"
                className="col-span-2 md:col-span-1 border border-border bg-transparent p-3.5 text-sm focus:outline-none placeholder:text-muted-text tex-body-t)]"
              />
            </div>
          </div>

          {/* 3. Payment */}
          <div className="mb-10">
            <p className="text-xs font-bold tracking-widest text-heading mb-4 uppercase">
              3. Payment
            </p>
            <div className="border border-border p-4 bg-transparent">
              <div className="flex items-center border border-border bg-white mb-4 px-3.5 py-3">
                <input
                  type="text"
                  placeholder="CARD NUMBER"
                  className="w-full text-sm focus:outline-none placeholder:text-muted-text tex-body-t)]"
                />
                {/* Placeholder Credit Card Icon */}
                <div className="w-8 h-5 bg-[#333] rounded-xs flex items-center justify-center relative overflow-hidden">
                  <div className="w-full h-px bg-[#999] absolute top-1"></div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="MM/YY"
                  className="border border-border bg-white p-3.5 text-sm focus:outline-none placeholder:text-muted-text tex-body-t)]"
                />
                <input
                  type="text"
                  placeholder="CVC"
                  className="border border-border bg-white p-3.5 text-sm focus:outline-none placeholder:text-muted-text tex-body-t)]"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <PrimaryBtn
            href={"/success"}
            title={"Place Order"}
            mainClass={
              " text-white bg-primary  w-full flex items-center py-4 justify-center gap-2"
            }
            textHover={"text-xs tracking-widest uppercase font-bold "}
            hoverClass={"bg-primary-hover"}
            // svg={<LockIcon />}
          />
        </form>
      </div>

      {/* Right Column: Order Summary */}
      <CheckoutSummary />
    </section>
  );
};

export default CheckoutForm;
