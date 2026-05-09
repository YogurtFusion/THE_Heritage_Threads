import React from 'react'

const PolicySidebar = () => {
  return (
    <aside className="w-full md:w-48 shrink-0">
          <div className="sticky top-24">
            <nav className="flex flex-col gap-2">
              {/* Active Item */}
              <a 
                href="#shipping" 
                className="font-inter text-xs font-bold tracking-widest uppercase text-heading py-3 px-4 border-l-2 border-primary bg-section/20"
              >
                Shipping
              </a>
              {/* Inactive Items */}
              <a 
                href="#returns" 
                className="font-inter text-xs font-bold tracking-widest uppercase text-heading py-3 px-4 border-l-2 border-transparent hover:bg-card transition-colors"
              >
                Returns
              </a>
              <a 
                href="#privacy" 
                className="font-inter text-xs font-bold tracking-widest uppercase text-heading py-3 px-4 border-l-2 border-transparent hover:bg-card transition-colors"
              >
                Privacy
              </a>
              <a 
                href="#terms" 
                className="font-inter text-xs font-bold tracking-widest uppercase text-heading py-3 px-4 border-l-2 border-transparent hover:bg-card transition-colors"
              >
                Terms
              </a>
            </nav>
          </div>
        </aside>)
}

export default PolicySidebar