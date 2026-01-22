export const initialStocks = [
  { id: 1, name: 'Chocolate Chip', quantity: 150, price: 2.99, category: 'Classic', status: 'In Stock' },
  { id: 2, name: 'Oatmeal Raisin', quantity: 85, price: 2.49, category: 'Classic', status: 'In Stock' },
  { id: 3, name: 'Double Chocolate', quantity: 20, price: 3.49, category: 'Premium', status: 'Low Stock' },
  { id: 4, name: 'Peanut Butter', quantity: 0, price: 2.99, category: 'Classic', status: 'Out of Stock' },
];

export const initialUsers = [
  { id: 1, name: 'John Doe', email: 'john@example.com', orders: 12, joined: '2024-01-15', status: 'Active' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', orders: 8, joined: '2024-02-20', status: 'Active' },
  { id: 3, name: 'Bob Wilson', email: 'bob@example.com', orders: 25, joined: '2023-11-10', status: 'Active' },
];

export const initialOrders = [
  { id: 1001, customer: 'John Doe', items: 3, total: 15.47, date: '2026-01-05', status: 'Delivered' },
  { id: 1002, customer: 'Jane Smith', items: 5, total: 24.95, date: '2026-01-06', status: 'Processing' },
  { id: 1003, customer: 'Bob Wilson', items: 2, total: 6.98, date: '2026-01-07', status: 'Pending' },
];