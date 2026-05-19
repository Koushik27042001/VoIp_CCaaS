import { getIO } from "../../socket.js";
import { asyncHandler } from "../../middlewares/async.middleware.js";
import { AppError } from "../../middlewares/error.middleware.js";
import * as customerRepo from "../../repositories/customer.repository.js";

const emitLeadUpdated = (customer) => {
  try {
    getIO().emit("lead_updated", customer);
  } catch {
    // Socket may be unavailable in tests
  }
};

const handleDuplicateKey = (err) => {
  if (err?.code === 11000) {
    throw new AppError("Customer with this phone already exists", 409);
  }
  throw err;
};

export const createCustomer = asyncHandler(async (req, res) => {
  try {
    const customer = await customerRepo.createCustomer(req.body);
    res.status(201).json(customer);
  } catch (err) {
    handleDuplicateKey(err);
  }
});

export const getCustomerByPhone = asyncHandler(async (req, res) => {
  const { phone } = req.params;
  const customer = await customerRepo.getCustomerByPhone(phone);

  if (!customer) {
    throw new AppError("Customer not found", 404);
  }

  res.json(customer);
});

export const getCustomers = asyncHandler(async (req, res) => {
  const customers = await customerRepo.getCustomers();
  res.json(customers);
});

export const updateCustomer = asyncHandler(async (req, res) => {
  const updated = await customerRepo.updateCustomer(req.params.id, req.body);

  if (!updated) {
    throw new AppError("Customer not found", 404);
  }

  emitLeadUpdated(updated);
  res.json(updated);
});

export const searchCustomers = asyncHandler(async (req, res) => {
  const { query } = req.query;
  const results = await customerRepo.searchCustomers(query);
  res.json(results);
});
