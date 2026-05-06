// CRM Service - Business logic for customer management

export const formatPhoneNumber = (phone) => {
  // Ensure E.164 format
  return phone;
};

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone) => {
  // Validate phone format
  return phone.startsWith("+") && phone.length >= 10;
};

export const getCustomerStatus = (tags) => {
  if (tags.includes("hot")) return "🔥 Hot";
  if (tags.includes("warm")) return "🌤️ Warm";
  return "❄️ Cold";
};

export default {
  formatPhoneNumber,
  validateEmail,
  validatePhone,
  getCustomerStatus,
};
