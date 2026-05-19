import User from "../models/User.js";

export const findUserByEmail = async (email) => {
  return User.findOne({ email });
};

export const findUserById = async (id) => {
  return User.findById(id).select("-passwordHash").lean();
};

export const createUser = async (payload) => {
  return User.create(payload);
};

export const countUsers = async () => {
  return User.countDocuments();
};

export const listUsers = async (filter = {}) => {
  return User.find(filter)
    .select("-passwordHash")
    .sort({ createdAt: -1 })
    .lean();
};

export const updateUser = async (id, payload) => {
  return User.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  })
    .select("-passwordHash")
    .lean();
};

export const deleteUser = async (id) => {
  return User.findByIdAndDelete(id);
};
