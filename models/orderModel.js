import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const ORDERS_FILE = path.join('data', 'orders.csv');

// Ensure headers exist
if (!fs.existsSync(ORDERS_FILE)) {
  fs.writeFileSync(
    ORDERS_FILE,
    'id,user,orderItems,shippingAddress,paymentMethod,paymentResult,taxPrice,shippingPrice,totalPrice,isPaid,paidAt,isDelivered,deliveredAt,status\n'
  );
}

// Parse CSV data to object array
function parseCSVData() {
  const data = fs.readFileSync(ORDERS_FILE, 'utf8');
  const lines = data.trim().split('\n').slice(1); // Skip headers
  return lines.map(line => {
    const [
      id, user, orderItems, shippingAddress,
      paymentMethod, paymentResult, taxPrice,
      shippingPrice, totalPrice, isPaid, paidAt,
      isDelivered, deliveredAt, status
    ] = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/); // Handle commas in JSON strings

    return {
      id,
      user,
      orderItems: JSON.parse(orderItems || '[]'),
      shippingAddress: JSON.parse(shippingAddress || '{}'),
      paymentMethod,
      paymentResult: JSON.parse(paymentResult || '{}'),
      taxPrice: parseFloat(taxPrice) || 0,
      shippingPrice: parseFloat(shippingPrice) || 0,
      totalPrice: parseFloat(totalPrice) || 0,
      isPaid: isPaid === 'true',
      paidAt: paidAt || '',
      isDelivered: isDelivered === 'true',
      deliveredAt: deliveredAt || '',
      status
    };
  });
}

// Write object array to CSV
function writeCSVData(data) {
  const csv = [
    'id,user,orderItems,shippingAddress,paymentMethod,paymentResult,taxPrice,shippingPrice,totalPrice,isPaid,paidAt,isDelivered,deliveredAt,status',
    ...data.map(order => [
      order.id,
      order.user,
      JSON.stringify(order.orderItems),
      JSON.stringify(order.shippingAddress),
      order.paymentMethod,
      JSON.stringify(order.paymentResult),
      order.taxPrice,
      order.shippingPrice,
      order.totalPrice,
      order.isPaid,
      order.paidAt || '',
      order.isDelivered,
      order.deliveredAt || '',
      order.status
    ].join(','))
  ].join('\n');

  fs.writeFileSync(ORDERS_FILE, csv);
}

const Order = {
  async create(orderData) {
    const orders = parseCSVData();
    const newOrder = {
      id: uuidv4(),
      user: orderData.user,
      orderItems: orderData.orderItems || [],
      shippingAddress: orderData.shippingAddress || {},
      paymentMethod: orderData.paymentMethod || 'COD',
      paymentResult: orderData.paymentResult || {},
      taxPrice: parseFloat(orderData.taxPrice || 0),
      shippingPrice: parseFloat(orderData.shippingPrice || 0),
      totalPrice: parseFloat(orderData.totalPrice || 0),
      isPaid: false,
      paidAt: '',
      isDelivered: false,
      deliveredAt: '',
      status: 'Pending'
    };

    orders.push(newOrder);
    writeCSVData(orders);
    return newOrder;
  },

  async findById(id) {
    const orders = parseCSVData();
    return orders.find(order => order.id === id) || null;
  },

  async findAll() {
    return parseCSVData();
  },

  async updateById(id, updateData) {
    const orders = parseCSVData();
    const index = orders.findIndex(order => order.id === id);
    if (index === -1) return null;

    const updatedOrder = {
      ...orders[index],
      ...updateData,
      taxPrice: parseFloat(updateData.taxPrice ?? orders[index].taxPrice),
      shippingPrice: parseFloat(updateData.shippingPrice ?? orders[index].shippingPrice),
      totalPrice: parseFloat(updateData.totalPrice ?? orders[index].totalPrice),
    };

    orders[index] = updatedOrder;
    writeCSVData(orders);
    return updatedOrder;
  },

  async deleteById(id) {
    let orders = parseCSVData();
    const index = orders.findIndex(order => order.id === id);
    if (index === -1) return null;

    const deleted = orders[index];
    orders = orders.filter(order => order.id !== id);
    writeCSVData(orders);
    return deleted;
  }
};

export default Order;
