import express from "express";
import {
  createCustomer,
  getCustomerByPhone,
  getCustomers,
  updateCustomer,
  searchCustomers,
} from "./customer.controller.js";

import { protect } from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", protect, createCustomer);
router.get("/", getCustomers);
router.get("/search", protect, searchCustomers);
router.get("/:phone", protect, getCustomerByPhone);
router.put("/:id", protect, updateCustomer);

export default router;
