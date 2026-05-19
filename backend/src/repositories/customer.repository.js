import Customer from "../models/Customer.js";

export const createCustomer = async (payload) => {
  return Customer.create(payload);
};

export const getCustomerByPhone = async (phone) => {
  return Customer.findOne({ phone }).lean();
};

export const getCustomerById = async (id) => {
  return Customer.findById(id).lean();
};

export const getCustomers = async ({ limit = 100, skip = 0 } = {}) => {
  return Customer.find()
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
};

export const updateCustomer = async (id, payload) => {
  return Customer.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  }).lean();
};

export const searchCustomers = async (query, { limit = 50 } = {}) => {
  return Customer.find({ $text: { $search: query } })
    .limit(limit)
    .lean();
};
