import Customer from "../models/Customer.js";
import { emitRealtimeEvent, REALTIME_EVENTS } from "../events/realtime.events.js";

const CUSTOMER_SELECT = "name phone email company tags notes assignedAgent createdAt updatedAt";

export const normalizePhoneNumber = (phone) => phone.trim();

export const createCustomerRecord = async (payload) => {
  const customer = await Customer.create({
    ...payload,
    phone: normalizePhoneNumber(payload.phone),
  });

  return customer.toObject();
};

export const getCustomerByPhoneNumber = async (phone) => {
  return Customer.findOne({ phone: normalizePhoneNumber(phone) })
    .select(CUSTOMER_SELECT)
    .lean();
};

export const listCustomers = async ({ limit = 50, page = 1 } = {}) => {
  return Customer.find()
    .select("name phone email company tags assignedAgent createdAt updatedAt")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();
};

export const updateCustomerRecord = async (id, payload) => {
  const update = { ...payload };

  if (update.phone) {
    update.phone = normalizePhoneNumber(update.phone);
  }

  const customer = await Customer.findByIdAndUpdate(id, update, {
    new: true,
    runValidators: true,
  })
    .select(CUSTOMER_SELECT)
    .lean();

  if (customer) {
    emitRealtimeEvent(REALTIME_EVENTS.LEAD_UPDATED, customer);
  }

  return customer;
};

export const searchCustomerRecords = async ({ query, limit = 20 }) => {
  const normalized = query.trim();
  const phoneSearch = normalized.replace(/[^\d+]/g, "");
  const escaped = normalized.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const textResults = await Customer.find({ $text: { $search: normalized } })
    .select("name phone email company tags assignedAgent createdAt updatedAt")
    .limit(limit)
    .lean();

  if (textResults.length > 0) {
    return textResults;
  }

  return Customer.find({
    $or: [
      ...(phoneSearch ? [{ phone: { $regex: phoneSearch } }] : []),
      { email: { $regex: escaped, $options: "i" } },
      { company: { $regex: escaped, $options: "i" } },
      { name: { $regex: escaped, $options: "i" } },
    ],
  })
    .select("name phone email company tags assignedAgent createdAt updatedAt")
    .limit(limit)
    .lean();
};

export default {
  normalizePhoneNumber,
  createCustomerRecord,
  getCustomerByPhoneNumber,
  listCustomers,
  updateCustomerRecord,
  searchCustomerRecords,
};
