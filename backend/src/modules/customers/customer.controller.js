import mockCustomers from "../../data/mockCustomers.js";
import { isMockMode } from "../../config/env.js";
import {
  createCustomerRecord,
  getCustomerByPhoneNumber,
  listCustomers,
  searchCustomerRecords,
  updateCustomerRecord,
} from "../../services/crmService.js";
import { emitRealtimeEvent, REALTIME_EVENTS } from "../../events/realtime.events.js";

export const createCustomer = async (req, res, next) => {
  try {
    if (isMockMode()) {
      const customer = {
        _id: mockCustomers.length + 1,
        ...req.body,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockCustomers.push(customer);
      return res.status(201).json(customer);
    }

    const customer = await createCustomerRecord(req.body);
    res.status(201).json(customer);
  } catch (err) {
    next(err);
  }
};

export const getCustomerByPhone = async (req, res, next) => {
  try {
    const { phone } = req.params;

    if (isMockMode()) {
      const customer = mockCustomers.find((c) => c.phone === phone);
      return customer
        ? res.json(customer)
        : res.status(404).json({ message: "Customer not found" });
    }

    const customer = await getCustomerByPhoneNumber(phone);

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.json(customer);
  } catch (err) {
    next(err);
  }
};

export const getCustomers = async (req, res, next) => {
  try {
    const query = req.validated?.query || req.query;

    if (isMockMode()) {
      return res.json(
        [...mockCustomers]
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, query.limit || 50)
      );
    }

    const customers = await listCustomers(query);
    res.json(customers);
  } catch (err) {
    next(err);
  }
};

export const updateCustomer = async (req, res, next) => {
  try {
    if (isMockMode()) {
      const customer = mockCustomers.find((c) => c._id == req.params.id);

      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }

      Object.assign(customer, req.body);
      customer.updatedAt = new Date();
      emitRealtimeEvent(REALTIME_EVENTS.LEAD_UPDATED, customer);
      return res.json(customer);
    }

    const updated = await updateCustomerRecord(req.params.id, req.body);

    if (!updated) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.json(updated);
  } catch (err) {
    next(err);
  }
};

export const searchCustomers = async (req, res, next) => {
  try {
    const { query, limit = 20 } = req.validated?.query || req.query;

    if (isMockMode()) {
      const lowered = query.toLowerCase();
      const results = mockCustomers
        .filter((c) => {
          return [c.name, c.phone, c.email, c.company]
            .filter(Boolean)
            .some((value) => value.toLowerCase().includes(lowered));
        })
        .slice(0, limit);

      return res.json(results);
    }

    const results = await searchCustomerRecords({ query, limit });
    res.json(results);
  } catch (err) {
    next(err);
  }
};
