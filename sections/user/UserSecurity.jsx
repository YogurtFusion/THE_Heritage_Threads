import React from 'react'

const UserSecurity = () => {
  return (      <article className="bg-card border border-border p-8 md:p-10 mb-8">
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
          </article>)
}

export default UserSecurity