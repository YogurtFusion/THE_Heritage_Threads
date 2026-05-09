// SignOutPage.jsx
export default function SignOutPage() {
  return (
    <div className="flex min-h-screen bg-body font-inter">
      
      {/* Sidebar Navigation */}
      <aside className="w-64 shrink-0 pt-20 hidden md:flex flex-col bg-body border-r border-border">
        <nav className="flex flex-col text-xs font-bold tracking-wider uppercase text-heading">
          
          <a href="#" className="flex items-center gap-4 px-10 py-5 hover:text-primary transition-colors">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
            Profile
          </a>
          
          <a href="#" className="flex items-center gap-4 px-10 py-5 hover:text-primary transition-colors">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M21 16.5c0 .38-.21.71-.53.88l-7.9 4.44c-.16.12-.36.18-.57.18-.21 0-.41-.06-.57-.18l-7.9-4.44A.991.991 0 0 1 3 16.5v-9c0-.38.21-.71.53-.88l7.9-4.44c.16-.12.36-.18.57-.18.21 0 .41.06.57.18l7.9 4.44c.32.17.53.5.53.88v9zM12 4.15L6.04 7.5 12 10.85l5.96-3.35L12 4.15z" />
            </svg>
            Orders
          </a>
          
          <div className="flex items-center gap-4 px-10 py-5 bg-footer text-primary border-l-4 border-primary cursor-pointer">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign Out
          </div>
          
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 relative flex items-center justify-center overflow-hidden">
        
        {/* Blurred Background Simulator */}
        <div className="absolute inset-0 bg-[#E8DFD5] opacity-90 z-0">
          <div className="w-full h-full bg-[url('/placeholder-pattern.jpg')] bg-cover bg-center filter blur-md mix-blend-multiply opacity-30"></div>
        </div>

        {/* Sign Out Modal Card */}
        <article className="relative z-10 w-full max-w-[420px] bg-body p-10 md:p-12 shadow-2xl flex flex-col items-center text-center overflow-hidden">
          
          {/* Decorative Corner Circles */}
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full border border-border -translate-y-1/2 translate-x-1/2 opacity-60"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full border border-border translate-y-1/2 -translate-x-1/2 opacity-60"></div>

          {/* Icon Container */}
          <div className="w-12 h-12 bg-footer flex items-center justify-center mb-6">
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </div>

          {/* Text Content */}
          <h2 className="font-playfair text-[32px] text-heading mb-4">
            Sign Out?
          </h2>
          <p className="text-body-text text-sm leading-relaxed mb-8 px-2">
            Are you sure you want to log out of your account? You will need to re-enter your credentials to access your heritage collection.
          </p>

          {/* Action Buttons */}
          <div className="flex w-full gap-4">
            <button className="flex-1 border border-heading text-heading hover:bg-border py-3.5 text-[11px] font-bold tracking-widest uppercase transition-colors">
              Cancel
            </button>
            <button className="flex-1 bg-primary hover:bg-primary-hover text-white py-3.5 text-[11px] font-bold tracking-widest uppercase transition-colors">
              Yes, Sign Out
            </button>
          </div>

        </article>
      </main>
    </div>
  )
}