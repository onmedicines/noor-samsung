const express = require("express");
const ComplaintController = require("../controllers/complaint.controller");
const { authenticate, authorize } = require("../middlewares/auth.middleware");
const parser = require("../configs/multerCloudinary");

const router = express.Router();

// Citizen routes
router.post(
  "/",
  authenticate,
  authorize("citizen"),
  parser.single("image"),
  ComplaintController.citizenPostComplaint
);

router.get(
  "/my-complaints",
  authenticate,
  authorize("citizen"),
  ComplaintController.citizenGetMyComplaints
);

router.get(
  "/:id",
  authenticate,
  authorize("citizen"),
  ComplaintController.citizenGetComplaint
);

router.delete(
  "/:id",
  authenticate,
  authorize("citizen"),
  ComplaintController.citizenDeleteComplaint
);

// Admin routes
router.get(
  "/",
  authenticate,
  authorize("admin"),
  ComplaintController.adminGetAllComplaints
);
router.get(
  "/:id/admin",
  authenticate,
  authorize("admin"),
  ComplaintController.adminGetComplaint
);
router.put(
  "/:id/status",
  authenticate,
  authorize("admin"),
  ComplaintController.adminUpdateStatus
);

module.exports = router;
