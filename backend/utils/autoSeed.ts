import Stylist from "../models/Stylist";

const sampleStylists = [
  {
    userId: "stylist_1",
    name: "Nana Yaa",
    email: "nana@example.com",
    phone: "+233 20 123 4567",
    bio: "Professional hairstylist with 8 years experience specializing in braids and natural hair care.",
    profileImage: "https://randomuser.me/api/portraits/women/44.jpg",
    specialty: ["Braids", "Natural Hair", "Twists"],
    services: [
      { id: "svc_1", name: "Box Braids", description: "Medium box braids", price: 250, duration: 180, category: "Braids" },
      { id: "svc_2", name: "Cornrows", description: "Straight back cornrows", price: 120, duration: 90, category: "Braids" },
      { id: "svc_3", name: "Hair Treatment", description: "Deep conditioning treatment", price: 80, duration: 60, category: "Treatment" },
    ],
    availability: [
      { day: "Monday", slots: ["09:00", "11:00", "13:00", "15:00"] },
      { day: "Tuesday", slots: ["09:00", "11:00", "13:00", "15:00"] },
      { day: "Wednesday", slots: ["09:00", "11:00", "13:00", "15:00"] },
      { day: "Thursday", slots: ["09:00", "11:00", "13:00", "15:00"] },
      { day: "Friday", slots: ["09:00", "11:00", "13:00", "15:00"] },
      { day: "Saturday", slots: ["10:00", "12:00", "14:00"] },
    ],
    location: {
      address: "12 Independence Avenue",
      city: "Accra",
      coordinates: [5.6037, -0.1870],
    },
    rating: 4.8,
    reviewCount: 127,
    isAvailable: true,
  },
  {
    userId: "stylist_2",
    name: "Akosua Beauty",
    email: "akosua@example.com",
    phone: "+233 24 987 6543",
    bio: "Makeup artist and nail technician. Creating beautiful looks for weddings, events, and everyday glam.",
    profileImage: "https://randomuser.me/api/portraits/women/68.jpg",
    specialty: ["Makeup", "Nails", "Lashes"],
    services: [
      { id: "svc_4", name: "Full Face Makeup", description: "Professional makeup application", price: 200, duration: 90, category: "Makeup" },
      { id: "svc_5", name: "Bridal Makeup", description: "Wedding day makeup with trial", price: 500, duration: 120, category: "Makeup" },
      { id: "svc_6", name: "Gel Manicure", description: "Long-lasting gel nails", price: 100, duration: 60, category: "Nails" },
      { id: "svc_7", name: "Eyelash Extensions", description: "Classic lash extensions", price: 180, duration: 90, category: "Lashes" },
    ],
    availability: [
      { day: "Monday", slots: ["08:00", "10:00", "12:00", "14:00", "16:00"] },
      { day: "Tuesday", slots: ["08:00", "10:00", "12:00", "14:00", "16:00"] },
      { day: "Wednesday", slots: ["08:00", "10:00", "12:00", "14:00", "16:00"] },
      { day: "Thursday", slots: ["08:00", "10:00", "12:00", "14:00", "16:00"] },
      { day: "Friday", slots: ["08:00", "10:00", "12:00", "14:00", "16:00"] },
      { day: "Saturday", slots: ["09:00", "11:00", "13:00", "15:00"] },
    ],
    location: {
      address: "45 Oxford Street",
      city: "Accra",
      coordinates: [5.6148, -0.1860],
    },
    rating: 4.9,
    reviewCount: 203,
    isAvailable: true,
  },
  {
    userId: "stylist_3",
    name: "Kwame Cuts",
    email: "kwame@example.com",
    phone: "+233 27 456 7890",
    bio: "Barber specializing in modern cuts, fades, and beard grooming. Your hair is my canvas.",
    profileImage: "https://randomuser.me/api/portraits/men/32.jpg",
    specialty: ["Haircuts", "Beard", "Fades"],
    services: [
      { id: "svc_8", name: "Classic Haircut", description: "Standard haircut", price: 50, duration: 45, category: "Haircuts" },
      { id: "svc_9", name: "Fade Cut", description: "Clean fade with styling", price: 70, duration: 60, category: "Haircuts" },
      { id: "svc_10", name: "Beard Grooming", description: "Trim and shape", price: 40, duration: 30, category: "Beard" },
      { id: "svc_11", name: "Full Package", description: "Haircut + Beard + Facial", price: 120, duration: 90, category: "Package" },
    ],
    availability: [
      { day: "Monday", slots: ["08:00", "09:00", "10:00", "11:00", "14:00", "15:00", "16:00"] },
      { day: "Tuesday", slots: ["08:00", "09:00", "10:00", "11:00", "14:00", "15:00", "16:00"] },
      { day: "Wednesday", slots: ["08:00", "09:00", "10:00", "11:00", "14:00", "15:00", "16:00"] },
      { day: "Thursday", slots: ["08:00", "09:00", "10:00", "11:00", "14:00", "15:00", "16:00"] },
      { day: "Friday", slots: ["08:00", "09:00", "10:00", "11:00", "14:00", "15:00", "16:00"] },
      { day: "Saturday", slots: ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00"] },
    ],
    location: {
      address: "78 Spintex Road",
      city: "Accra",
      coordinates: [5.6260, -0.1400],
    },
    rating: 4.7,
    reviewCount: 89,
    isAvailable: true,
  },
  {
    userId: "stylist_4",
    name: "Efua Glamour",
    email: "efua@example.com",
    phone: "+233 23 111 2222",
    bio: "Luxury spa experience - facials, massages, and body treatments. Relax and rejuvenate.",
    profileImage: "https://randomuser.me/api/portraits/women/12.jpg",
    specialty: ["Facials", "Massage", "Body Treatment"],
    services: [
      { id: "svc_12", name: "Deep Facial", description: "Cleansing and moisturizing facial", price: 150, duration: 60, category: "Facials" },
      { id: "svc_13", name: "Full Body Massage", description: "Relaxing Swedish massage", price: 200, duration: 90, category: "Massage" },
      { id: "svc_14", name: "Body Scrub", description: "Exfoliating body treatment", price: 180, duration: 75, category: "Body Treatment" },
      { id: "svc_15", name: "Spa Package", description: "Facial + Massage + Manicure", price: 450, duration: 180, category: "Package" },
    ],
    availability: [
      { day: "Tuesday", slots: ["10:00", "12:00", "14:00", "16:00"] },
      { day: "Wednesday", slots: ["10:00", "12:00", "14:00", "16:00"] },
      { day: "Thursday", slots: ["10:00", "12:00", "14:00", "16:00"] },
      { day: "Friday", slots: ["10:00", "12:00", "14:00", "16:00"] },
      { day: "Saturday", slots: ["10:00", "12:00", "14:00"] },
    ],
    location: {
      address: "15 Airport Residential",
      city: "Accra",
      coordinates: [5.5920, -0.1700],
    },
    rating: 5.0,
    reviewCount: 56,
    isAvailable: true,
  },
  {
    userId: "stylist_5",
    name: "Kofi Braids",
    email: "kofi@example.com",
    phone: "+233 26 333 4444",
    bio: "Specialist in protective styling - locs, twists, and creative braid patterns.",
    profileImage: "https://randomuser.me/api/portraits/men/86.jpg",
    specialty: ["Locs", "Twists", "Braids"],
    services: [
      { id: "svc_16", name: "Starter Locs", description: "Begin your loc journey", price: 300, duration: 240, category: "Locs" },
      { id: "svc_17", name: "Loc Maintenance", description: "Retwist and style", price: 150, duration: 120, category: "Locs" },
      { id: "svc_18", name: "Senegalese Twists", description: "Medium twists", price: 350, duration: 300, category: "Twists" },
      { id: "svc_19", name: "Knotless Braids", description: "Small knotless braids", price: 400, duration: 360, category: "Braids" },
    ],
    availability: [
      { day: "Monday", slots: ["08:00", "09:30", "13:00", "14:30"] },
      { day: "Tuesday", slots: ["08:00", "09:30", "13:00", "14:30"] },
      { day: "Wednesday", slots: ["08:00", "09:30", "13:00", "14:30"] },
      { day: "Thursday", slots: ["08:00", "09:30", "13:00", "14:30"] },
      { day: "Friday", slots: ["08:00", "09:30", "13:00", "14:30"] },
      { day: "Saturday", slots: ["07:00", "08:30", "12:00", "13:30"] },
    ],
    location: {
      address: "22 East Legon",
      city: "Accra",
      coordinates: [5.6380, -0.1600],
    },
    rating: 4.9,
    reviewCount: 112,
    isAvailable: true,
  },
];

export const autoSeedDatabase = async () => {
  try {
    // Check if stylists already exist
    const count = await Stylist.countDocuments();
    
    if (count === 0) {
      console.log("📦 Database empty - seeding with sample data...");
      await Stylist.insertMany(sampleStylists);
      console.log(`✅ Added ${sampleStylists.length} sample stylists`);
    } else {
      console.log(`📊 Database already has ${count} stylists - skipping seed`);
    }
  } catch (err) {
    console.error("❌ Auto-seeding failed:", err);
  }
};
