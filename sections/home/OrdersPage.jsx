// AccountOrdersPage.jsx

export default function AccountOrdersPage() {
  return (
    <div className="flex min-h-screen bg-[var(--color-body)] font-inter text-[var(--color-body-text)]">
      
      {/* Sidebar Navigation */}
      <aside className="w-64 flex-shrink-0 border-r border-[var(--color-border)] pt-16 px-10 hidden md:flex flex-col bg-[var(--color-body)]">
        <div className="mb-12">
          <h2 className="font-playfair font-bold text-sm text-[var(--color-heading)] uppercase tracking-widest mb-2">
            Account
          </h2>
          <p className="text-[10px] text-[var(--color-muted-text)] uppercase tracking-widest">
            Manage Your Heritage
          </p>
        </div>

        <nav className="flex flex-col gap-6 text-xs font-semibold tracking-wider uppercase">
          <a href="#" className="flex items-center gap-4 text-[var(--color-heading)] hover:text-[var(--color-primary)] transition-colors">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
            Profile
          </a>
          <a href="#" className="flex items-center gap-4 text-[var(--color-primary)]">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M21 16.5c0 .38-.21.71-.53.88l-7.9 4.44c-.16.12-.36.18-.57.18-.21 0-.41-.06-.57-.18l-7.9-4.44A.991.991 0 0 1 3 16.5v-9c0-.38.21-.71.53-.88l7.9-4.44c.16-.12.36-.18.57-.18.21 0 .41.06.57.18l7.9 4.44c.32.17.53.5.53.88v9zM12 4.15L6.04 7.5 12 10.85l5.96-3.35L12 4.15z" />
            </svg>
            Orders
          </a>
          <a href="#" className="flex items-center gap-4 text-[var(--color-heading)] mt-4 hover:text-[var(--color-primary)] transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign Out
          </a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 px-8 py-12 md:px-16 md:py-16">
        
        {/* Page Header */}
        <header className="mb-12">
          <h1 className="font-playfair text-4xl text-[var(--color-heading)] mb-3">
            Your Orders
          </h1>
          <p className="text-[var(--color-body-text)] text-sm">
            Track current shipments and review your collection.
          </p>
        </header>

        {/* Orders Grid */}
        <div className="flex flex-col xl:flex-row gap-12 xl:gap-16 items-start">
          
          {/* Ongoing Orders Section */}
          <section className="w-full xl:w-[45%]">
            <h2 className="font-playfair text-2xl text-[var(--color-heading)] border-b border-[var(--color-border)] pb-3 mb-6">
              Ongoing Orders
            </h2>
            
            <article className="border border-[var(--color-border)] bg-[var(--color-body)] flex flex-col">
              {/* Card Header */}
              <div className="p-5 border-b border-[var(--color-border)]">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold tracking-wider text-[var(--color-heading)]">
                    ORDER #HT-2024-001
                  </span>
                  <span className="bg-[var(--color-section)] px-2 py-1 text-[10px] font-bold tracking-wider text-[var(--color-heading)] uppercase">
                    In Transit
                  </span>
                </div>
                <p className="text-xs text-[var(--color-muted-text)]">Placed: Jan 15, 2024</p>
              </div>

              {/* Card Body */}
              <div className="p-5 flex gap-5 items-center">
                <div className="w-20 h-20 bg-gray-100 flex-shrink-0 border border-[var(--color-border)]">
                  <img src="/placeholder-keychain.jpg" alt="Tree of Life Keychain" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <h3 className="font-playfair font-bold text-lg text-[var(--color-heading)] mb-1">
                    Tree of Life<br/>Keychain
                  </h3>
                  <p className="text-sm text-[var(--color-muted-text)]">2 items</p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-[var(--color-heading)]">₹600</span>
                </div>
              </div>

              {/* Card Footer */}
              <div className="p-4 border-t border-[var(--color-border)] flex justify-center">
                <button className="text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] text-xs font-bold tracking-widest uppercase transition-colors">
                  Track Order
                </button>
              </div>
            </article>
          </section>

          {/* Previous Orders Section */}
          <section className="w-full xl:w-[55%]">
            <h2 className="font-playfair text-2xl text-[var(--color-heading)] border-b border-[var(--color-border)] pb-3 mb-6">
              Previous Orders
            </h2>

            <div className="flex flex-col gap-6">
              
              {/* Previous Order Item 1 */}
              <article className="border border-[var(--color-border)] bg-[var(--color-body)] p-5 flex flex-col sm:flex-row gap-6">
                <div className="w-32 h-24 bg-gray-100 flex-shrink-0 border border-[var(--color-border)]">
                  <img src="/placeholder-throw.jpg" alt="Mithila Woven Throw" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-playfair font-bold text-lg text-[var(--color-heading)]">
                      Mithila Woven Throw
                    </h3>
                    <span className="font-bold text-[var(--color-heading)]">₹4,200</span>
                  </div>
                  <p className="text-xs text-[var(--color-muted-text)] leading-relaxed mb-4">
                    Order #HT-2023-142 • Dec 02,<br/>2023
                  </p>
                  <div className="flex justify-between items-end">
                    <span className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-[var(--color-tertiary)] uppercase">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Delivered
                    </span>
                    <a href="#" className="text-xs font-bold tracking-wide text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] border-b border-[var(--color-primary)] pb-0.5 transition-colors">
                      View Details
                    </a>
                  </div>
                </div>
              </article>

              {/* Previous Order Item 2 */}
              <article className="border border-[var(--color-border)] bg-[var(--color-body)] p-5 flex flex-col sm:flex-row gap-6">
                <div className="w-32 h-24 bg-gray-100 flex-shrink-0 border border-[var(--color-border)]">
                  <img src="/placeholder-tote.jpg" alt="Artisan Canvas Tote" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-playfair font-bold text-lg text-[var(--color-heading)]">
                      Artisan Canvas Tote
                    </h3>
                    <span className="font-bold text-[var(--color-heading)]">₹2,850</span>
                  </div>
                  <p className="text-xs text-[var(--color-muted-text)] leading-relaxed mb-4">
                    Order #HT-2023-089 • Oct 15,<br/>2023
                  </p>
                  <div className="flex justify-between items-end">
                    <span className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-[var(--color-tertiary)] uppercase">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Delivered
                    </span>
                    <a href="#" className="text-xs font-bold tracking-wide text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] border-b border-[var(--color-primary)] pb-0.5 transition-colors">
                      View Details
                    </a>
                  </div>
                </div>
              </article>

            </div>
          </section>
          
        </div>
      </main>
    </div>
  )
}