export interface SalesRecord {
  id: string;
  date: string; // YYYY-MM-DD
  customerName: string;
  productName: string;
  category: 'Electronics' | 'Apparel' | 'Home' | 'Software';
  region: 'North America' | 'Europe' | 'Asia' | 'LATAM' | 'Middle East';
  revenue: number;
  profit: number;
  status: 'Delivered' | 'Processing' | 'Shipped' | 'Cancelled';
}

export const MOCK_SALES_DATA: SalesRecord[] = [
  // --- JANUARY 2026 ---
  {
    id: "ORD-1001",
    date: "2026-01-05",
    customerName: "Sarah Jenkins",
    productName: "MacBook Pro M3",
    category: "Electronics",
    region: "North America",
    revenue: 2499,
    profit: 875,
    status: "Delivered"
  },
  {
    id: "ORD-1002",
    date: "2026-01-08",
    customerName: "Liam O'Connor",
    productName: "Nike Air Max 270",
    category: "Apparel",
    region: "Europe",
    revenue: 150,
    profit: 65,
    status: "Delivered"
  },
  {
    id: "ORD-1003",
    date: "2026-01-12",
    customerName: "Yuki Tanaka",
    productName: "Sony WH-1000XM5",
    category: "Electronics",
    region: "Asia",
    revenue: 399,
    profit: 140,
    status: "Delivered"
  },
  {
    id: "ORD-1004",
    date: "2026-01-18",
    customerName: "Mateo Silva",
    productName: "Figma Professional",
    category: "Software",
    region: "LATAM",
    revenue: 180,
    profit: 162,
    status: "Delivered"
  },
  {
    id: "ORD-1005",
    date: "2026-01-22",
    customerName: "Fatima Al-Sayed",
    productName: "Dyson V15 Detect",
    category: "Home",
    region: "Middle East",
    revenue: 749,
    profit: 225,
    status: "Delivered"
  },
  {
    id: "ORD-1006",
    date: "2026-01-26",
    customerName: "Alex Mercer",
    productName: "Slack Pro Subscription",
    category: "Software",
    region: "North America",
    revenue: 320,
    profit: 288,
    status: "Delivered"
  },
  {
    id: "ORD-1007",
    date: "2026-01-29",
    customerName: "Emma Watson",
    productName: "Patagonia Torrentshell",
    category: "Apparel",
    region: "Europe",
    revenue: 180,
    profit: 72,
    status: "Shipped"
  },

  // --- FEBRUARY 2026 ---
  {
    id: "ORD-1008",
    date: "2026-02-02",
    customerName: "Carlos Santana",
    productName: "iPad Air",
    category: "Electronics",
    region: "LATAM",
    revenue: 599,
    profit: 210,
    status: "Delivered"
  },
  {
    id: "ORD-1009",
    date: "2026-02-06",
    customerName: "John Doe",
    productName: "Philips Hue Starter Kit",
    category: "Home",
    region: "North America",
    revenue: 199,
    profit: 80,
    status: "Delivered"
  },
  {
    id: "ORD-1010",
    date: "2026-02-10",
    customerName: "Sophia Dubois",
    productName: "Adobe Creative Cloud",
    category: "Software",
    region: "Europe",
    revenue: 600,
    profit: 540,
    status: "Delivered"
  },
  {
    id: "ORD-1011",
    date: "2026-02-15",
    customerName: "Yuki Tanaka",
    productName: "MacBook Pro M3",
    category: "Electronics",
    region: "Asia",
    revenue: 2499,
    profit: 875,
    status: "Delivered"
  },
  {
    id: "ORD-1012",
    date: "2026-02-18",
    customerName: "David Miller",
    productName: "Nike Air Max 270",
    category: "Apparel",
    region: "North America",
    revenue: 150,
    profit: 65,
    status: "Delivered"
  },
  {
    id: "ORD-1013",
    date: "2026-02-22",
    customerName: "Zahra Mansour",
    productName: "Ember Smart Mug",
    category: "Home",
    region: "Middle East",
    revenue: 129,
    profit: 39,
    status: "Delivered"
  },
  {
    id: "ORD-1014",
    date: "2026-02-25",
    customerName: "Chloe Dupont",
    productName: "Adidas Ultraboost",
    category: "Apparel",
    region: "Europe",
    revenue: 190,
    profit: 76,
    status: "Shipped"
  },
  {
    id: "ORD-1015",
    date: "2026-02-28",
    customerName: "Mateo Silva",
    productName: "Sony WH-1000XM5",
    category: "Electronics",
    region: "LATAM",
    revenue: 399,
    profit: 140,
    status: "Delivered"
  },

  // --- MARCH 2026 ---
  {
    id: "ORD-1016",
    date: "2026-03-03",
    customerName: "Olivia Wilson",
    productName: "Dyson V15 Detect",
    category: "Home",
    region: "North America",
    revenue: 749,
    profit: 225,
    status: "Delivered"
  },
  {
    id: "ORD-1017",
    date: "2026-03-08",
    customerName: "Emma Watson",
    productName: "Figma Professional",
    category: "Software",
    region: "Europe",
    revenue: 180,
    profit: 162,
    status: "Delivered"
  },
  {
    id: "ORD-1018",
    date: "2026-03-12",
    customerName: "Hiroshi Sato",
    productName: "iPhone 15 Pro",
    category: "Electronics",
    region: "Asia",
    revenue: 1099,
    profit: 440,
    status: "Delivered"
  },
  {
    id: "ORD-1019",
    date: "2026-03-16",
    customerName: "Sarah Jenkins",
    productName: "Patagonia Torrentshell",
    category: "Apparel",
    region: "North America",
    revenue: 180,
    profit: 72,
    status: "Delivered"
  },
  {
    id: "ORD-1020",
    date: "2026-03-19",
    customerName: "Fatima Al-Sayed",
    productName: "Samsung Galaxy S24",
    category: "Electronics",
    region: "Middle East",
    revenue: 899,
    profit: 315,
    status: "Delivered"
  },
  {
    id: "ORD-1021",
    date: "2026-03-22",
    customerName: "Zahra Mansour",
    productName: "Adobe Creative Cloud",
    category: "Software",
    region: "Middle East",
    revenue: 600,
    profit: 540,
    status: "Processing"
  },
  {
    id: "ORD-1022",
    date: "2026-03-25",
    customerName: "Liam O'Connor",
    productName: "Nespresso Vertuo Next",
    category: "Home",
    region: "Europe",
    revenue: 169,
    profit: 50,
    status: "Shipped"
  },
  {
    id: "ORD-1023",
    date: "2026-03-29",
    customerName: "Carlos Santana",
    productName: "Nike Air Max 270",
    category: "Apparel",
    region: "LATAM",
    revenue: 150,
    profit: 65,
    status: "Delivered"
  },

  // --- APRIL 2026 ---
  {
    id: "ORD-1024",
    date: "2026-04-02",
    customerName: "Sophia Dubois",
    productName: "MacBook Pro M3",
    category: "Electronics",
    region: "Europe",
    revenue: 2499,
    profit: 875,
    status: "Delivered"
  },
  {
    id: "ORD-1025",
    date: "2026-04-05",
    customerName: "David Miller",
    productName: "Cursor Pro Annual",
    category: "Software",
    region: "North America",
    revenue: 240,
    profit: 216,
    status: "Delivered"
  },
  {
    id: "ORD-1026",
    date: "2026-04-10",
    customerName: "Hiroshi Sato",
    productName: "Dyson V15 Detect",
    category: "Home",
    region: "Asia",
    revenue: 749,
    profit: 225,
    status: "Delivered"
  },
  {
    id: "ORD-1027",
    date: "2026-04-14",
    customerName: "Carlos Santana",
    productName: "The North Face Nuptse",
    category: "Apparel",
    region: "LATAM",
    revenue: 320,
    profit: 128,
    status: "Delivered"
  },
  {
    id: "ORD-1028",
    date: "2026-04-18",
    customerName: "Fatima Al-Sayed",
    productName: "Sony WH-1000XM5",
    category: "Electronics",
    region: "Middle East",
    revenue: 399,
    profit: 140,
    status: "Delivered"
  },
  {
    id: "ORD-1029",
    date: "2026-04-21",
    customerName: "Chloe Dupont",
    productName: "Microsoft 365 Personal",
    category: "Software",
    region: "Europe",
    revenue: 70,
    profit: 56,
    status: "Delivered"
  },
  {
    id: "ORD-1030",
    date: "2026-04-25",
    customerName: "Olivia Wilson",
    productName: "Levi's 501 Original",
    category: "Apparel",
    region: "North America",
    revenue: 90,
    profit: 36,
    status: "Shipped"
  },
  {
    id: "ORD-1031",
    date: "2026-04-28",
    customerName: "Yuki Tanaka",
    productName: "iRobot Roomba j7",
    category: "Home",
    region: "Asia",
    revenue: 599,
    profit: 180,
    status: "Processing"
  },
  {
    id: "ORD-1032",
    date: "2026-04-29",
    customerName: "Alex Mercer",
    productName: "Adobe Creative Cloud",
    category: "Software",
    region: "North America",
    revenue: 600,
    profit: 540,
    status: "Delivered"
  },

  // --- MAY 2026 ---
  {
    id: "ORD-1033",
    date: "2026-05-02",
    customerName: "Sophia Dubois",
    productName: "iPhone 15 Pro",
    category: "Electronics",
    region: "Europe",
    revenue: 1099,
    profit: 440,
    status: "Delivered"
  },
  {
    id: "ORD-1034",
    date: "2026-05-05",
    customerName: "David Miller",
    productName: "iPad Air",
    category: "Electronics",
    region: "North America",
    revenue: 599,
    profit: 210,
    status: "Delivered"
  },
  {
    id: "ORD-1035",
    date: "2026-05-08",
    customerName: "Hiroshi Sato",
    productName: "Figma Professional",
    category: "Software",
    region: "Asia",
    revenue: 180,
    profit: 162,
    status: "Delivered"
  },
  {
    id: "ORD-1036",
    date: "2026-05-11",
    customerName: "Zahra Mansour",
    productName: "Dyson V15 Detect",
    category: "Home",
    region: "Middle East",
    revenue: 749,
    profit: 225,
    status: "Delivered"
  },
  {
    id: "ORD-1037",
    date: "2026-05-14",
    customerName: "Mateo Silva",
    productName: "Nike Air Max 270",
    category: "Apparel",
    region: "LATAM",
    revenue: 150,
    profit: 65,
    status: "Delivered"
  },
  {
    id: "ORD-1038",
    date: "2026-05-16",
    customerName: "Alex Mercer",
    productName: "MacBook Pro M3",
    category: "Electronics",
    region: "North America",
    revenue: 2499,
    profit: 875,
    status: "Delivered"
  },
  {
    id: "ORD-1039",
    date: "2026-05-19",
    customerName: "Chloe Dupont",
    productName: "Patagonia Torrentshell",
    category: "Apparel",
    region: "Europe",
    revenue: 180,
    profit: 72,
    status: "Delivered"
  },
  {
    id: "ORD-1040",
    date: "2026-05-21",
    customerName: "Liam O'Connor",
    productName: "Cursor Pro Annual",
    category: "Software",
    region: "Europe",
    revenue: 240,
    profit: 216,
    status: "Delivered"
  },
  {
    id: "ORD-1041",
    date: "2026-05-22",
    customerName: "Emma Watson",
    productName: "Ember Smart Mug",
    category: "Home",
    region: "Europe",
    revenue: 129,
    profit: 39,
    status: "Shipped"
  },
  {
    id: "ORD-1042",
    date: "2026-05-24",
    customerName: "Yuki Tanaka",
    productName: "Samsung Galaxy S24",
    category: "Electronics",
    region: "Asia",
    revenue: 899,
    profit: 315,
    status: "Shipped"
  },
  {
    id: "ORD-1043",
    date: "2026-05-25",
    customerName: "Sarah Jenkins",
    productName: "iRobot Roomba j7",
    category: "Home",
    region: "North America",
    revenue: 599,
    profit: 180,
    status: "Processing"
  },
  {
    id: "ORD-1044",
    date: "2026-05-26",
    customerName: "Carlos Santana",
    productName: "Adobe Creative Cloud",
    category: "Software",
    region: "LATAM",
    revenue: 600,
    profit: 540,
    status: "Delivered"
  },
  {
    id: "ORD-1045",
    date: "2026-05-27",
    customerName: "Fatima Al-Sayed",
    productName: "The North Face Nuptse",
    category: "Apparel",
    region: "Middle East",
    revenue: 320,
    profit: 128,
    status: "Processing"
  },
  {
    id: "ORD-1046",
    date: "2026-05-28",
    customerName: "Olivia Wilson",
    productName: "Nike Air Max 270",
    category: "Apparel",
    region: "North America",
    revenue: 150,
    profit: 65,
    status: "Delivered"
  }
];

export const REGIONS = ["North America", "Europe", "Asia", "LATAM", "Middle East"] as const;
export const CATEGORIES = ["Electronics", "Apparel", "Home", "Software"] as const;
export const STATUSES = ["Delivered", "Shipped", "Processing", "Cancelled"] as const;
