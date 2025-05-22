/**
 * Validate task input
 */
const validateTaskInput = (data) => {
  const errors = [];

  if (!data.title || data.title.trim() === "") {
    errors.push("Title is required");
  }

  if (!data.customerId) {
    errors.push("Customer is required");
  }

  if (!data.dueDate) {
    errors.push("Due date is required");
  }

  if (data.items && (isNaN(data.items) || data.items < 1)) {
    errors.push("Items must be a positive number");
  }

  if (data.priority && !["low", "medium", "high"].includes(data.priority)) {
    errors.push("Priority must be low, medium, or high");
  }

  if (data.status && !["todo", "in-progress", "done", "delivery"].includes(data.status)) {
    errors.push("Status must be todo, in-progress, done, or delivery");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate customer input
 */
const validateCustomerInput = (data) => {
  const errors = [];

  if (!data.name || data.name.trim() === "") {
    errors.push("Name is required");
  }

  if (data.email && !isValidEmail(data.email)) {
    errors.push("Email is invalid");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate email format
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

module.exports = {
  validateTaskInput,
  validateCustomerInput,
  isValidEmail,
};
