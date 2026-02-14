import { Request, Response } from "express";
import Booking from "../models/Booking";
import Stylist from "../models/Stylist";
import Wallet from "../models/Wallet";
import Transaction from "../models/Transaction";

// Create booking
export const createBooking = async (req: Request, res: Response) => {
  try {
    const clientId = req.user?.id;
    const { 
      stylistId, 
      serviceId, 
      bookingDate, 
      timeSlot, 
      location,
      notes,
      clientPhone 
    } = req.body;
    
    // Get stylist
    const stylist = await Stylist.findById(stylistId);
    if (!stylist) {
      return res.status(404).json({ error: "Stylist not found" });
    }
    
    // Get service
    const service = stylist.services.find(s => s.id === serviceId);
    if (!service) {
      return res.status(404).json({ error: "Service not found" });
    }
    
    // Check if slot is available
    const dayOfWeek = new Date(bookingDate).toLocaleDateString("en-US", { weekday: "long" });
    const dayAvailability = stylist.availability.find(a => a.day === dayOfWeek);
    
    if (!dayAvailability || !dayAvailability.slots.includes(timeSlot)) {
      return res.status(400).json({ error: "Time slot not available" });
    }
    
    // Check if slot already booked
    const existingBooking = await Booking.findOne({
      stylistId,
      bookingDate: new Date(bookingDate),
      timeSlot,
      status: { $nin: ["cancelled"] }
    });
    
    if (existingBooking) {
      return res.status(400).json({ error: "Time slot already booked" });
    }
    
    // Get client wallet
    let wallet = await Wallet.findOne({ userId: clientId });
    if (!wallet) {
      wallet = await Wallet.create({ userId: clientId, balance: 0 });
    }
    
    // Check balance (optional - can also collect payment on confirmation)
    const hasEnoughBalance = wallet.balance >= service.price;
    
    // Create booking
    const booking = await Booking.create({
      clientId,
      clientName: req.user?.name || "Guest",
      clientEmail: req.user?.email || "",
      clientPhone,
      stylistId,
      stylistName: stylist.name,
      serviceId,
      serviceName: service.name,
      servicePrice: service.price,
      serviceDuration: service.duration,
      bookingDate: new Date(bookingDate),
      timeSlot,
      status: "pending",
      paymentStatus: hasEnoughBalance ? "held_in_escrow" : "pending",
      location,
      notes,
    });
    
    // If wallet has balance, deduct and hold in escrow
    if (hasEnoughBalance) {
      wallet.balance -= service.price;
      await wallet.save();
      
      await Transaction.create({
        userId: clientId,
        type: "escrow",
        amount: -service.price,
        currency: "GHS",
        status: "completed",
        description: `Escrow hold for booking with ${stylist.name}`,
        bookingId: booking._id.toString(),
      });
    }
    
    res.status(201).json({ 
      message: "Booking created",
      booking,
      requiresPayment: !hasEnoughBalance,
      paymentAmount: service.price
    });
  } catch (err) {
    console.error("Create booking error:", err);
    res.status(500).json({ error: "Failed to create booking" });
  }
};

// Get my bookings (client)
export const getMyBookings = async (req: Request, res: Response) => {
  try {
    const clientId = req.user?.id;
    const { status } = req.query;
    
    let query: any = { clientId };
    if (status) {
      query.status = status;
    }
    
    const bookings = await Booking.find(query)
      .sort({ bookingDate: -1 })
      .limit(50);
    
    res.json({ bookings });
  } catch (err) {
    console.error("Get bookings error:", err);
    res.status(500).json({ error: "Failed to get bookings" });
  }
};

// Get stylist bookings
export const getStylistBookings = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const stylist = await Stylist.findOne({ userId });
    
    if (!stylist) {
      return res.status(404).json({ error: "Stylist profile not found" });
    }
    
    const { status } = req.query;
    let query: any = { stylistId: stylist._id };
    if (status) {
      query.status = status;
    }
    
    const bookings = await Booking.find(query)
      .sort({ bookingDate: -1 })
      .limit(50);
    
    res.json({ bookings });
  } catch (err) {
    console.error("Get stylist bookings error:", err);
    res.status(500).json({ error: "Failed to get bookings" });
  }
};

// Get single booking
export const getBooking = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id);
    
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }
    
    res.json({ booking });
  } catch (err) {
    console.error("Get booking error:", err);
    res.status(500).json({ error: "Failed to get booking" });
  }
};

// Update booking status
export const updateBookingStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }
    
    // Validate status transition
    const validTransitions: any = {
      "pending": ["confirmed", "cancelled"],
      "confirmed": ["in_progress", "cancelled"],
      "in_progress": ["completed"],
      "completed": [],
      "cancelled": [],
      "disputed": ["completed", "cancelled"],
    };
    
    if (!validTransitions[booking.status].includes(status)) {
      return res.status(400).json({ 
        error: `Cannot transition from ${booking.status} to ${status}` 
      });
    }
    
    booking.status = status;
    await booking.save();
    
    res.json({ 
      message: "Status updated",
      booking 
    });
  } catch (err) {
    console.error("Update status error:", err);
    res.status(500).json({ error: "Failed to update status" });
  }
};

// Create dispute
export const createDispute = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }
    
    booking.status = "disputed";
    booking.disputeReason = reason;
    await booking.save();
    
    res.json({ 
      message: "Dispute created",
      booking 
    });
  } catch (err) {
    console.error("Create dispute error:", err);
    res.status(500).json({ error: "Failed to create dispute" });
  }
};

// Resolve dispute (admin only)
export const resolveDispute = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { resolution, refundToClient } = req.body;
    
    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }
    
    booking.status = refundToClient ? "cancelled" : "completed";
    booking.disputeResolution = resolution;
    booking.paymentStatus = refundToClient ? "refunded_to_client" : "released_to_stylist";
    await booking.save();
    
    // Handle refund or release
    if (refundToClient) {
      // Refund to client
      const wallet = await Wallet.findOne({ userId: booking.clientId });
      if (wallet) {
        wallet.balance += booking.servicePrice;
        await wallet.save();
      }
      
      await Transaction.create({
        userId: booking.clientId,
        type: "refund",
        amount: booking.servicePrice,
        currency: "GHS",
        status: "completed",
        description: `Refund for disputed booking`,
        bookingId: booking._id.toString(),
      });
    } else {
      // Release to stylist
      const stylist = await Stylist.findById(booking.stylistId);
      if (stylist) {
        let stylistWallet = await Wallet.findOne({ userId: stylist.userId });
        if (!stylistWallet) {
          stylistWallet = await Wallet.create({ userId: stylist.userId, balance: 0 });
        }
        stylistWallet.balance += booking.servicePrice;
        await stylistWallet.save();
        
        await Transaction.create({
          userId: stylist.userId,
          type: "credit",
          amount: booking.servicePrice,
          currency: "GHS",
          status: "completed",
          description: `Payment for booking ${booking._id}`,
          bookingId: booking._id.toString(),
        });
      }
    }
    
    res.json({ 
      message: "Dispute resolved",
      booking 
    });
  } catch (err) {
    console.error("Resolve dispute error:", err);
    res.status(500).json({ error: "Failed to resolve dispute" });
  }
};

// Get disputed bookings
export const getDisputes = async (req: Request, res: Response) => {
  try {
    const { status } = req.query;
    let query: any = { status: "disputed" };
    
    if (status === "resolved") {
      query = { 
        status: { $in: ["completed", "cancelled"] },
        disputeReason: { $exists: true }
      };
    }
    
    const disputes = await Booking.find(query)
      .sort({ updatedAt: -1 });
    
    res.json({ disputes });
  } catch (err) {
    console.error("Get disputes error:", err);
    res.status(500).json({ error: "Failed to get disputes" });
  }
};

// Get available slots for a stylist
export const getAvailableSlots = async (req: Request, res: Response) => {
  try {
    const { stylistId, date } = req.query;
    
    const stylist = await Stylist.findById(stylistId);
    if (!stylist) {
      return res.status(404).json({ error: "Stylist not found" });
    }
    
    const dayOfWeek = new Date(date as string).toLocaleDateString("en-US", { weekday: "long" });
    const dayAvailability = stylist.availability.find(a => a.day === dayOfWeek);
    
    if (!dayAvailability) {
      return res.json({ slots: [] });
    }
    
    // Get booked slots
    const bookedSlots = await Booking.find({
      stylistId,
      bookingDate: new Date(date as string),
      status: { $nin: ["cancelled"] }
    }).select("timeSlot");
    
    const bookedTimeSlots = bookedSlots.map(b => b.timeSlot);
    const availableSlots = dayAvailability.slots.filter(
      slot => !bookedTimeSlots.includes(slot)
    );
    
    res.json({ 
      slots: availableSlots,
      day: dayOfWeek
    });
  } catch (err) {
    console.error("Get slots error:", err);
    res.status(500).json({ error: "Failed to get available slots" });
  }
};
