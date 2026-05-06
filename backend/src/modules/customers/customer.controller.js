import Customer from "../../models/Customer.js";
import mockCustomers from "../../data/mockCustomers.js";

const USE_MOCK = process.env.USE_MOCK === "true";

// ➕ Create Customer
export const createCustomer = async (req, res) => {
  try {
    if (USE_MOCK) {
      const customer = {
        _id: mockCustomers.length + 1,
        ...req.body,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockCustomers.push(customer);
      return res.status(201).json(customer);
    }

    const customer = await Customer.create(req.body);
    res.status(201).json(customer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🔍 Get by Phone (VERY IMPORTANT for calls)
export const getCustomerByPhone = async (req, res) => {
  try {
    const { phone } = req.params;

    if (USE_MOCK) {
      const customer = mockCustomers.find((c) => c.phone === phone);

      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }

      return res.json(customer);
    }

    const customer = await Customer.findOne({ phone });

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.json(customer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 📄 Get All Customers
export const getCustomers = async (req, res) => {
  try {
    if (USE_MOCK) {
      return res.json(mockCustomers.sort((a, b) => b.createdAt - a.createdAt));
    }

    const customers = await Customer.find().sort({ createdAt: -1 });
    res.json(customers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✏️ Update Customer
export const updateCustomer = async (req, res) => {
  try {
    if (USE_MOCK) {
      const customer = mockCustomers.find((c) => c._id == req.params.id);

      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }

      Object.assign(customer, req.body);
      customer.updatedAt = new Date();

      return res.json(customer);
    }

    const updated = await Customer.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🔎 Search (for CRM search bar)
export const searchCustomers = async (req, res) => {
  try {
    const { query } = req.query;

    if (USE_MOCK) {
      const results = mockCustomers.filter((c) =>
        c.name.toLowerCase().includes(query.toLowerCase())
      );

      return res.json(results);
    }

    const results = await Customer.find({
      $text: { $search: query },
    });

    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
