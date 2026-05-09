import Image from 'next/image'
import React from 'react'


const CartProductCard = ({item}) => {
  return (
    <div>
                    <article className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-card p-4 gap-6 sm:gap-0">
                <div className="flex items-center gap-6 w-full sm:w-1/2">
                  <div className="w-24 h-24 bg-white shrink-0 flex items-center justify-center p-2">
                    <Image src={item.image} alt="Artisan Chore Coat" className="max-w-full max-h-full object-cover" width={100} height={100} />
                  </div>
                  <div>
                    <h3 className=" text-xl text-heading uppercase mb-1">
                      {item.name}
                    </h3>
                    {/* <p className="text-sm text-body-text mb-3">
                      Indigo / M
                    </p> */}
                    <button className="text-xs font-semibold uppercase tracking-widest text-heading border-b border-heading pb-0.5 hover:text-primary hover:border-primary transition-colors">
                      Remove
                    </button>
                  </div>
                </div>
                
                <div className="w-full sm:w-1/4 flex justify-start sm:justify-center">
                  <div className="flex border border-border bg-white h-10">
                    <button className="w-10 flex items-center justify-center text-heading hover:bg-gray-50 transition-colors">
                      &minus;
                    </button>
                    <div className="w-10 flex items-center justify-center font-semibold text-heading border-x border-border text-sm">
                      {item.quantity}
                    </div>
                    <button className="w-10 flex items-center justify-center text-heading hover:bg-gray-50 transition-colors">
                      &#43;
                    </button>
                  </div>
                </div>

                <div className="w-full sm:w-1/4 text-left sm:text-right font-inter text-lg text-heading">
                 {item.price *item.quantity}.00
                </div>
              </article>
    </div>
  )
}

export default CartProductCard
