import { Request, Response } from "express";
import Stylist from "../models/Stylist";
import User from "../models/User";

// Search stylists with filters
export const searchStylists = async (req: Request, res: Response) => {
  try {
    const { q, city, specialty, minPrice, maxPrice, rating } = req.query;
    
    let query: any = { isAvailable: true };
    
    // Text search
    if (q) {
      query.$text = { $search: q as string };
    }
    
    // City filter
    if (city) {
      query["location.city"] = new RegExp(city as string, "i");
    }
    
    // Specialty filter
    if (specialty) {
      query.specialty = { $in: [specialty] };
    }
    
    // Rating filter
    if (rating) {
      query.rating = { $gte: parseFloat(rating as string) };
    }
    
    // Price range filter on services
    let priceFilter: any = {};
    if (minPrice || maxPrice) {
      priceFilter = {
        services: {
          $elemMatch: {
            price: {
              ...(minPrice && { $gte: parseFloat(minPrice as string) }),
              ...(maxPrice && { $lte: parseFloat(maxPrice as string) }),
            }
          }
        }
      };
      query = { ...query, ...priceFilter };
    }
    
    const stylists = await Stylist.find(query)
      .select("-__v")
      .sort({ rating: -1, reviewCount: -1 })
      .limit(50);
    
    res.json({ 
      stylists, 
      count: stylists.length,
      filters: { q, city, specialty, minPrice, maxPrice, rating }
    });
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ error: "Search failed" });
  }
};

// Get single stylist
export const getStylist = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const stylist = await Stylist.findById(id);
    
    if (!stylist) {
      return res.status(404).json({ error: "Stylist not found" });
    }
    
    res.json({ stylist });
  } catch (err) {
    console.error("Get stylist error:", err);
    res.status(500).json({ error: "Failed to get stylist" });
  }
};

// Create stylist profile (for users who want to be stylists)
export const createStylistProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    const existingStylist = await Stylist.findOne({ userId });
    if (existingStylist) {
      return res.status(400).json({ error: "Stylist profile already exists" });
    }
    
    const { phone, bio, specialty, location } = req.body;
    
    const stylist = await Stylist.create({
      userId,
      name: user.name,
      email: user.email,
      phone,
      bio,
      specialty: specialty || [],
      services: [],
      availability: [],
      location,
      rating: 0,
      reviewCount: 0,
      isAvailable: true,
    });
    
    // Update user role
    user.role = "stylist";
    await user.save();
    
    res.status(201).json({ 
      message: "Stylist profile created",
      stylist 
    });
  } catch (err) {
    console.error("Create stylist error:", err);
    res.status(500).json({ error: "Failed to create stylist profile" });
  }
};

// Add service to stylist
export const addService = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { name, description, price, duration, category } = req.body;
    
    const stylist = await Stylist.findOne({ userId });
    if (!stylist) {
      return res.status(404).json({ error: "Stylist profile not found" });
    }
    
    const newService = {
      id: Date.now().toString(),
      name,
      description,
      price: parseFloat(price),
      duration: parseInt(duration),
      category,
    };
    
    stylist.services.push(newService);
    await stylist.save();
    
    res.status(201).json({ 
      message: "Service added",
      service: newService,
      services: stylist.services 
    });
  } catch (err) {
    console.error("Add service error:", err);
    res.status(500).json({ error: "Failed to add service" });
  }
};

// Get my services (for stylist)
export const getMyServices = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const stylist = await Stylist.findOne({ userId });
    
    if (!stylist) {
      return res.status(404).json({ error: "Stylist profile not found" });
    }
    
    res.json({ services: stylist.services });
  } catch (err) {
    console.error("Get services error:", err);
    res.status(500).json({ error: "Failed to get services" });
  }
};

// Get services by stylist ID (public)
export const getServicesById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const stylist = await Stylist.findById(id);
    
    if (!stylist) {
      return res.status(404).json({ error: "Stylist not found" });
    }
    
    res.json({ services: stylist.services });
  } catch (err) {
    console.error("Get services by ID error:", err);
    res.status(500).json({ error: "Failed to get services" });
  }
};

// Set availability
export const setAvailability = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { availability } = req.body; // [{ day: "Monday", slots: ["09:00", "10:00"] }]
    
    const stylist = await Stylist.findOne({ userId });
    if (!stylist) {
      return res.status(404).json({ error: "Stylist profile not found" });
    }
    
    stylist.availability = availability;
    await stylist.save();
    
    res.json({ 
      message: "Availability updated",
      availability: stylist.availability 
    });
  } catch (err) {
    console.error("Set availability error:", err);
    res.status(500).json({ error: "Failed to set availability" });
  }
};

// Get availability
export const getAvailability = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const stylist = await Stylist.findOne({ userId });
    
    if (!stylist) {
      return res.status(404).json({ error: "Stylist profile not found" });
    }
    
    res.json({ availability: stylist.availability });
  } catch (err) {
    console.error("Get availability error:", err);
    res.status(500).json({ error: "Failed to get availability" });
  }
};
