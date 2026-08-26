// Validation middleware for Repair and Order requests

export const validateRepairInput = (req, res, next) => {
  const { issue, customer, name, customerName: bodyCustomerName, phone, customerPhone, email, customerEmail } = req.body;
  const customerName = customer || name || bodyCustomerName;
  const effectivePhone = phone || customerPhone;
  const effectiveEmail = email || customerEmail;

  if (!issue || typeof issue !== 'string' || !issue.trim()) {
    res.status(400);
    throw new Error('Description of issue is required');
  }

  if (!customerName || typeof customerName !== 'string' || !customerName.trim()) {
    res.status(400);
    throw new Error('Customer name is required');
  }

  if (!effectivePhone || typeof effectivePhone !== 'string' || !effectivePhone.trim()) {
    res.status(400);
    throw new Error('Phone number is required');
  }

  if (!effectiveEmail || typeof effectiveEmail !== 'string' || !effectiveEmail.trim()) {
    res.status(400);
    throw new Error('Email address is required');
  }

  next();
};

export const validateOrderInput = (req, res, next) => {
  let { products, deliveryAddress, tags } = req.body;

  if (typeof products === 'string') {
    try {
      req.body.products = JSON.parse(products);
      products = req.body.products;
    } catch (e) {}
  }
  if (typeof deliveryAddress === 'string') {
    try {
      req.body.deliveryAddress = JSON.parse(deliveryAddress);
    } catch (e) {}
  }
  if (typeof tags === 'string') {
    try {
      req.body.tags = JSON.parse(tags);
    } catch (e) {}
  }

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
