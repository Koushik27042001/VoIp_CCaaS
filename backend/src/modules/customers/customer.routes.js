import express from "express";
import { z } from "zod";
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
  updateCustomerSchema,
  phoneParamSchema,
  customerIdParamSchema,
  searchQuerySchema,
} from "../../validators/customer.validator.js";

const router = express.Router();

router.post(
  "/",
  protect,
  validate(z.object({ body: createCustomerSchema })),
  createCustomer
);

router.get("/", getCustomers);

router.get(
  "/search",
  protect,
  validate(z.object({ query: searchQuerySchema })),
  searchCustomers
);

router.get(
  "/:phone",
  protect,
  validate(z.object({ params: phoneParamSchema })),
  getCustomerByPhone
);

router.put(
  "/:id",
  protect,
  validate(
    z.object({
      params: customerIdParamSchema,
      body: updateCustomerSchema,
    })
  ),
  updateCustomer
);

export default router;
