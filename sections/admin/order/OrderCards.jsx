import { mockOrders } from '@/data/admin'
import React from 'react'

const OrderCards = () => {

 const getStatusStyle = (status) => {
    switch (status) {
      case "Processing":
        
        return "bg-section-2 text-primary"; 
      case "Shipped":

        return "bg-card text-secondary"; 
      case "Delivered":
        
        return "bg-border text-success"; 
      default:
        return "bg-card text-body-text";
    }
  };
 return (  
     <div className="flex flex-col gap-3 md:hidden ">
        {mockOrders.map((order) => (
            <div
            key={order.id}
            className="bg-card rounded-xl  border border-border p-4"
            >
            {/* Top row: Order ID + Status */}
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-heading text-sm">
                {order.id}
              </span>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium 
                    ${getStatusStyle(order.status)}`}
                    >
                {order.status}
              </span>
            </div>

            {/* Customer name */}
            <p className="text-gray-700 text-sm font-medium mb-1">
              {order.customer}
            </p>

            {/* Bottom row: Date + Total */}
            <div className="flex items-center justify-between mt-2">
              <span className="text-gray-400 text-xs">{order.date}</span>
              <span className="text-heading font-semibold text-sm">
                {order.total}
              </span>
            </div>
          </div>
        ))}
      </div>)

};

export default OrderCards