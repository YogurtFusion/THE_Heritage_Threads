export const STATS_DATA = [
  {
    title: "Total Orders",
    value: "148",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
      />
    ),
  },
  {
    title: "Total Revenue",
    value: "₹1,24,500",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
      />
    ),
  },
  {
    title: "Active Products",
    value: "24",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
      />
    ),
  },
  {
    title: "Pending Orders",
    value: "12",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    ),
  },
];

export const mockOrders = [
  {
    id: "#ORD-092",
    customer: "Anya Sharma",
    date: "Oct 24, 2023",
    total: "₹12,400",
    status: "Processing",
  },
  {
    id: "#ORD-091",
    customer: "Rohan Gupta",
    date: "Oct 23, 2023",
    total: "₹8,900",
    status: "Shipped",
  },
  {
    id: "#ORD-090",
    customer: "Meera Patel",
    date: "Oct 22, 2023",
    total: "₹24,500",
    status: "Shipped",
  },
  {
    id: "#ORD-089",
    customer: "Vikram Singh",
    date: "Oct 20, 2023",
    total: "₹4,200",
    status: "Delivered",
  },
  {
    id: "#ORD-088",
    customer: "Priya Desai",
    date: "Oct 19, 2023",
    total: "₹15,600",
    status: "Delivered",
  },
  {
    id: "#ORD-087",
    customer: "Arjun Reddy",
    date: "Oct 18, 2023",
    total: "₹3,150",
    status: "Processing",
  },
];


export const mockInventory = [
  {
    id: 1,
    name: "Artisan Leather Satchel",
    category: "Bags & Accessories",
    price: "₹245.00",
    status: "ACTIVE",
    stock: 45,
  },
  {
    id: 2,
    name: "Terracotta Clay Vase",
    category: "Ceramics",
    price: "₹85.00",
    status: "LOW STOCK",
    stock: 3,
  },
  {
    id: 3,
    name: "Woven Linen Throw",
    category: "Home Textiles",
    price: "₹120.00",
    status: "ACTIVE",
    stock: 28,
  } ,
]