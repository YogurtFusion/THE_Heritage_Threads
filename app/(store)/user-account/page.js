    // AccountProfile.jsx

export default function AccountProfile() {
  return (
    <main className="min-h-screen bg-body text-body-text font-inter py-12 px-6 md:px-12 lg:px-24">
      <div className="max-w-300 mx-auto flex flex-col md:flex-row gap-12 lg:gap-24">
        
        {/* Sidebar Navigation */}
        <aside className="w-full md:w-48 lg:w-56 shrink-0">
          <h1 className="font-playfair text-3xl text-heading mb-10">
            My Account
          </h1>
          <nav className="flex flex-col space-y-6">
            <a 
              href="#" 
              className="flex justify-between items-center text-primary font-bold tracking-wider text-sm border-b border-primary pb-2"
            >
              Profile
              <span className="text-lg leading-none">→</span>
            </a>
            <a 
              href="#" 
              className="text-heading font-bold tracking-wider text-sm hover:text-primary transition-colors"
            >
              Orders
            </a>
            <a 
              href="#" 
              className="text-heading font-bold tracking-wider text-sm hover:text-primary transition-colors"
            >
              Addresses
            </a>
            <a 
              href="#" 
              className="text-heading font-bold tracking-wider text-sm hover:text-primary transition-colors mt-2"
            >
              Sign Out
            </a>
          </nav>
        </aside>

        {/* Main Content Area */}
        <section className="flex-1 max-w-2xl">
          
          {/* Header */}
          <div className="mb-10">
            <h2 className="font-playfair text-4xl lg:text-5xl text-heading mb-4">
              Personal Profile
            </h2>
            <p className="text-body-text text-[15px]">
              Manage your details to ensure seamless delivery of your artisanal pieces.
            </p>
          </div>

          {/* Details Card */}
          <article className="bg-card border border-border p-8 md:p-10 mb-8">
            <div className="flex justify-between items-center mb-8">
              <h3 className="font-playfair text-2xl text-heading">
                Details
              </h3>
              <button aria-label="Edit Details">
                <svg className="w-5 h-5 text-heading" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              </button>
            </div>
            
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold tracking-widest text-heading mb-2 uppercase">
                    First Name
                  </label>
                  <input 
                    type="text" 
                    defaultValue="Elena" 
                    className="w-full bg-body border border-border p-3 text-heading focus:outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold tracking-widest text-heading mb-2 uppercase">
                    Last Name
                  </label>
                  <input 
                    type="text" 
                    defaultValue="Rostova" 
                    className="w-full bg-body border border-border p-3 text-heading focus:outline-none" 
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold tracking-widest text-heading mb-2 uppercase">
                  Email Address
                </label>
                <input 
                  type="email" 
                  defaultValue="elena.r@example.com" 
                  className="w-full bg-body border border-border p-3 text-heading focus:outline-none" 
                />
              </div>
              
              <div className="pb-4">
                <label className="block text-xs font-bold tracking-widest text-heading mb-2 uppercase">
                  Phone Number
                </label>
                <input 
                  type="tel" 
                  defaultValue="+1 (555) 019-2834" 
                  className="w-full bg-body border border-border p-3 text-heading focus:outline-none" 
                />
              </div>
              
              <button 
                type="button"
                className="w-full bg-primary hover:bg-primary-hover text-white font-bold tracking-widest text-sm uppercase py-4 transition-colors"
              >
                Save Changes
              </button>
            </form>
          </article>

          {/* Security Card */}
          <article className="bg-card border border-border p-8 md:p-10 mb-8">
            <h3 className="font-playfair text-2xl text-heading mb-8">
              Security
            </h3>
            <form className="space-y-8">
              <div>
                <label className="block text-xs font-bold tracking-widest text-heading mb-2 uppercase">
                  Current Password
                </label>
                <input 
                  type="password" 
                  defaultValue="12345678" 
                  className="w-full bg-body border border-border p-3 text-heading focus:outline-none text-xl tracking-widest" 
                />
              </div>
              
              <button 
                type="button"
                className="w-full bg-transparent border border-heading text-heading hover:bg-heading hover:text-body font-bold tracking-widest text-sm uppercase py-4 transition-colors"
              >
                Update Password
              </button>
            </form>
          </article>

          {/* Preferences Card */}
          <article className="bg-card border border-border p-8 md:p-10">
            <h3 className="font-playfair text-2xl text-heading mb-8">
              Preferences
            </h3>
            <div className="space-y-8">
              
              {/* Checked Preference */}
              <label className="flex items-start gap-4 cursor-pointer group">
                <div className="mt-1 w-4 h-4 shrink-0 bg-primary flex justify-center items-center rounded-sm">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <span className="block font-bold text-sm tracking-widest text-heading uppercase mb-1">
                    Curator's Notes
                  </span>
                  <span className="block text-sm text-body-text">
                    Monthly insights on weaving techniques and artisan stories.
                  </span>
                </div>
              </label>

              {/* Unchecked Preference */}
              <label className="flex items-start gap-4 cursor-pointer group">
                <div className="mt-1 w-4 h-4 shrink-0 border border-heading flex justify-center items-center rounded-sm bg-transparent group-hover:bg-gray-100 transition-colors">
                </div>
                <div>
                  <span className="block font-bold text-sm tracking-widest text-heading uppercase mb-1">
                    Early Access
                  </span>
                  <span className="block text-sm text-body-text">
                    Be notified 24 hours before limited collections drop.
                  </span>
                </div>
              </label>

            </div>
          </article>

          {/* Leaf Divider */}
          <div className="flex items-center justify-center gap-4 py-16">
            <div className="h-px bg-border w-24"></div>
            <svg 
              className="w-5 h-5 text-border transform -rotate-45" 
              viewBox="0 0 24 24" 
              fill="currentColor"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM11 7H13V12.59L16.29 15.88L14.88 17.29L11 13.41V7Z" opacity="0" />
              <path d="M17.5 3c-3.5 0-8 2.5-10.5 7-1.5-1.5-3.5-2-3.5-2s1 3.5 2.5 5c-1 2.5-3 4-3 4s2-1.5 4-2.5c1.5 1.5 5 2.5 5 2.5s-.5-2-2-3.5c4.5-2.5 7-7 7-10.5z" />
            </svg>
            <div className="h-px bg-border w-24"></div>
          </div>

        </section>
      </div>
    </main>
  )
}