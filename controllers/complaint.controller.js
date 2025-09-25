const Complaint = require("../models/complaint.model.js");
const cloudinary = require("../configs/cloudinary");

class ComplaintController {
  static async adminGetAllComplaints(req, res) {
    try {
      const { status, userId, isLegitimate } = req.query;

      const filter = {};

      if (status && ["pending", "in-progress", "completed"].includes(status)) {
        filter.status = status;
      }

      if (userId) {
        filter.userId = userId;
      }

      if (typeof isLegitimate !== "undefined") {
        if (isLegitimate === "true") filter.isLegitimate = true;
        else if (isLegitimate === "false") filter.isLegitimate = false;
        else if (isLegitimate === "null") filter.isLegitimate = null; // allows fetching unreviewed
      }

      const complaints = await Complaint.find(filter)
        .populate("userId", "name email role")
        .sort({ createdAt: -1 })
        .select("-__v");

      return res.status(200).json({
        success: true,
        message: "Complaints retrieved successfully",
        data: {
          complaints,
          count: complaints.length,
        },
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: "Server error",
        error: err.message,
      });
    }
  }

  static async adminGetComplaint(req, res) {
    try {
      const { id } = req.params;
      const complaint = await Complaint.findById(id).populate(
        "userId",
        "name email role"
      );
      if (!complaint) {
        return res
          .status(404)
          .json({ success: false, message: "Complaint not found" });
      }
      return res.json({ success: true, complaint });
    } catch (err) {
      return res
        .status(500)
        .json({ success: false, message: "Server error", error: err.message });
    }
  }

  static async adminUpdateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, isLegitimate } = req.body;
      const complaint = await Complaint.findById(id);
      if (!complaint) {
        return res
          .status(404)
          .json({ success: false, message: "Complaint not found" });
      }
      if (status) complaint.status = status;
      if (typeof isLegitimate === "boolean") {
        complaint.isLegitimate = isLegitimate;
        complaint.reviewedBy = req.user.id;
        complaint.reviewedAt = new Date();
      }
      await complaint.save();
      return res.json({
        success: true,
        message: "Complaint updated",
        complaint,
      });
    } catch (err) {
      return res
        .status(500)
        .json({ success: false, message: "Server error", error: err.message });
    }
  }

  static async citizenPostComplaint(req, res) {
    try {
      //   return res.json(JSON.parse(req.body.location));
      let { caption, location } = req.body;
      location = JSON.parse(location);
      if (!req.file) {
        return res
          .status(400)
          .json({ success: false, message: "Image is required" });
      }
      if (!caption || !location) {
        return res.status(400).json({
          success: false,
          message: "Caption and location are required",
        });
      }
      const imageUrl = req.file.path;
      const complaint = await Complaint.create({
        userId: req.user.id,
        imageUrl,
        caption,
        location,
      });
      return res.json({
        success: true,
        message: "Complaint submitted",
        complaint,
      });
    } catch (err) {
      return res
        .status(500)
        .json({ success: false, message: "Server error", error: err.message });
    }
  }

  static async citizenGetMyComplaints(req, res) {
    try {
      const userId = req.user.id;
      const { status } = req.query;

      const filter = { userId };

      if (status && ["pending", "in-progress", "completed"].includes(status)) {
        filter.status = status;
      }

      const complaints = await Complaint.find(filter)
        .sort({ createdAt: -1 })
        .select("-__v");

      res.status(200).json({
        success: true,
        message: "Complaints retrieved successfully",
        data: {
          complaints,
          count: complaints.length,
        },
      });
    } catch (error) {
      console.error("Error fetching user complaints:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve complaints",
        error: error.message,
      });
    }
  }

  static async citizenGetComplaint(req, res) {
    try {
      const { id } = req.params;
      const complaint = await Complaint.findOne({
        _id: id,
        userId: req.user.id,
      });
      if (!complaint) {
        return res
          .status(404)
          .json({ success: false, message: "Complaint not found" });
      }
      return res.json({ success: true, complaint });
    } catch (err) {
      return res
        .status(500)
        .json({ success: false, message: "Server error", error: err.message });
    }
  }

  // helper
  static async #getPublicIdFromUrl(imageUrl) {
    try {
      const parts = imageUrl.split("/");
      const filename = parts[parts.length - 1];
      return filename.split(".")[0]; // Remove file extension
    } catch (error) {
      return null;
    }
  }

  static async citizenDeleteComplaint(req, res) {
    try {
      const { id } = req.params;

      const complaint = await Complaint.findOne({
        _id: id,
        userId: req.user.id,
      });

      if (!complaint) {
        return res.status(404).json({
          success: false,
          message: "Complaint not found or unauthorized",
        });
      }

      await Complaint.findByIdAndDelete(id);

      return res.json({
        success: true,
        message: "Complaint deleted successfully",
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: "Server error",
        error: err.message,
      });
    }
  }
}

module.exports = ComplaintController;
