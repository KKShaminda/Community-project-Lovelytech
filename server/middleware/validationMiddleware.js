// Validation middleware for Repair and Order requests

export const validateRepairInput = (req, res, next) => {
  const { issue, customer, name, phone, email } = req.body;
  const customerName = customer || name;

  if (!issue || typeof issue !== 'string' || !issue.trim()) {
    res.status(400);
    throw new Error('Description of issue is required');
  }

  if (!customerName || typeof customerName !== 'string' || !customerName.trim()) {
    res.status(400);
    throw new Error('Customer name is required');
  }

  if (!phone || typeof phone !== 'string' || !phone.trim()) {
    res.status(400);
    throw new Error('Phone number is required');
  }

  if (!email || typeof email !== 'string' || !email.trim()) {
    res.status(400);
    throw new Error('Email address is required');
  }

  next();
};

export const validateOrderInput = (req, res, next) => {
  const { products } = req.body;

  if (!products || !Array.isArray(products) || products.length === 0) {
    res.status(400);
    throw new Error('Order must contain at least one product');
  }

  for (const item of products) {
    if (!item.name || !item.price || item.qty === undefined) {
      res.status(400);
      throw new Error('Each order product must have a name, price, and quantity');
    }
  }

  next();
};
