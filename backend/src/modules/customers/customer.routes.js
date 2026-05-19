import express from "express";
import {
  createCustomer,
  getCustomerByPhone,
  getCustomers,
  updateCustomer,
  searchCustomers,
} from "./customer.controller.js";

import { protect } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import {
  createCustomerSchema,
  customerPhoneSchema,
  listCustomersSchema,
  searchCustomersSchema,
  updateCustomerSchema,
} from "./customer.validation.js";

const router = express.Router();

router.post("/", protect, validate(createCustomerSchema), createCustomer);
router.get("/", validate(listCustomersSchema), getCustomers);
router.get("/search", protect, validate(searchCustomersSchema), searchCustomers);
router.get("/:phone", protect, validate(customerPhoneSchema), getCustomerByPhone);
router.put("/:id", protect, validate(updateCustomerSchema), updateCustomer);

export default router;
