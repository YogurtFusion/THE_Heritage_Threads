import Link from 'next/link'
import React from 'react'

const AddItemsHead = () => {
  return (
        <div className="mb-8">
        <Link 
          href="/admin/inventory" 
          className="inline-flex items-center text-sm text-muted-text hover:text-primary transition-colors mb-4"
        >
          {/* Back Arrow SVG */}
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Inventory
        </Link>
        <h1 className="text-3xl font-semibold text-heading mb-2">
          Add New Product
        </h1>
        <p className="text-body-text">
          Enter the details for the new artisanal piece to add to the Heritage Threads collection.
        </p>
      </div>

  )
}

export default AddItemsHead