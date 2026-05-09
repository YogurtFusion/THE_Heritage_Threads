import React from 'react'

export const SidebarFilters = () => {
  return (
    <aside className="w-full lg:w-56 shrink-0">
          
          {/* Category Filter */}
          <div className="border-t border-border pt-6 mb-10">
            <h2 className="text-xs font-bold uppercase tracking-widest text-heading mb-6">
              Category
            </h2>
            <ul className="space-y-4">
              <li className="flex items-center gap-3">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 rounded-sm border-border accent-primary" 
                />
                <span className="text-sm">All Categories</span>
              </li>
              <li className="flex items-center gap-3">
                <input 
                  type="checkbox" 
                  defaultChecked 
                  className="w-4 h-4 rounded-sm border-border accent-primary" 
                />
                <span className="text-sm text-heading">Keychains</span>
              </li>
              <li className="flex items-center gap-3">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 rounded-sm border-border accent-primary" 
                />
                <span className="text-sm">Zipchains</span>
              </li>
              <li className="flex items-center gap-3">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 rounded-sm border-border accent-primary" 
                />
                <span className="text-sm">Textiles</span>
              </li>
            </ul>
          </div>

          {/* Price Filter */}
          <div className="border-t border-border pt-6">
            <h2 className="text-xs font-bold uppercase tracking-widest text-heading mb-6">
              Price
            </h2>
            
            {/* Visual Slider Track */}
            <div className="relative h-0.5 bg-border mb-6 mt-4 w-full">
              <div className="absolute left-0 right-[20%] h-full b-r)]"></div>
              <div className="absolute right-[20%] top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-primary"></div>
            </div>

            {/* Price Inputs */}
            <div className="flex items-center justify-between gap-4">
              <div className="border border-border px-4 py-2 text-sm w-full text-center bg-transparent">
                $0
              </div>
              <span className="text-muted-text">-</span>
              <div className="border border-border px-4 py-2 text-sm w-full text-center bg-transparent">
                $200+
              </div>
            </div>
          </div>
        </aside>
  )
}
