import PrimaryBtn from "@/components/ui/PrimaryBtn";
import React from "react";

const CartSummary = ({ cartItems }) => {
  let subTotal = 0;
  for (let i = 0; i < cartItems.length; i++) {
    const item = cartItems[i];
    let itemTotal = item.price * item.quantity;
    subTotal = subTotal + itemTotal;
  }
  return (
    <div>
      <aside className="w-full lg:w-100 shrink-0">
        <div className="border border-border p-8">
          <h2 className=" text-3xl text-heading border-b border-border pb-6 mb-6">
            SUMMARY
          </h2>

          <div className="space-y-5 mb-8 text-sm">
            <div className="flex justify-between">
              <span className="text-body-text">Subtotal</span>
              <span className="text-heading">₹{subTotal} </span>
            </div>
            <div className="flex justify-between">
              <span className="text-body-text">Shipping</span>
              <span className="text-muted-text">Calculated at next step</span>
            </div>
            <div className="flex justify-between">
              <span className="text-body-text">Taxes</span>
              <span className="text-muted-text">Calculated at next step</span>
            </div>
          </div>

          <div className="flex justify-between items-center pt-8 mb-8">
            <span className="text-xs font-bold uppercase tracking-widest text-heading">
              Estimated Total
            </span>
            <span className=" text-2xl text-heading font-semibold">
              ₹{subTotal}
            </span>
          </div>

          <PrimaryBtn
            title={"CHECKOUT"}
            mainClass={
              " text-white bg-primary flex justify-center  py-4 w-full mb-6 "
            }
            hoverClass={"bg-primary-hover"}
            textHover={"text-white text-sm font-bold tracking-widest uppercase"}
            href={"/checkout"}
          />

          <div className="flex items-center justify-center gap-2 text-xs text-muted-text">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                clipRule="evenodd"
              />
            </svg>
            <span>Secure Checkout</span>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default CartSummary;
