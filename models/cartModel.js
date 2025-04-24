import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const CARTS_FILE = path.join('data', 'carts.csv');
const CART_ITEMS_FILE = path.join('data', 'cart_items.csv');

// Initialize CSV headers if files are missing
if (!fs.existsSync(CARTS_FILE)) {
  fs.writeFileSync(CARTS_FILE, 'id,user,totalPrice\n');
}
if (!fs.existsSync(CART_ITEMS_FILE)) {
  fs.writeFileSync(CART_ITEMS_FILE, 'id,cartId,productId,quantity,price,color\n');
}

// Utility to read CSV into array of objects
function readCSV(file) {
  const lines = fs.readFileSync(file, 'utf-8').trim().split('\n');
  const headers = lines[0].split(',');
  return lines.slice(1).map(line => {
    const values = line.split(',');
    return headers.reduce((obj, h, i) => {
      obj[h] = values[i];
      return obj;
    }, {});
  });
}

// Utility to write object array into CSV
function writeCSV(file, data, headers) {
  const csv = [
    headers.join(','),
    ...data.map(row => headers.map(h => row[h] ?? '').join(','))
  ].join('\n');
  fs.writeFileSync(file, csv);
}

const Cart = {
  async findOneOrCreate(userId) {
    let carts = readCSV(CARTS_FILE);
    let cart = carts.find(c => c.user === userId);
    if (!cart) {
      cart = { id: uuidv4(), user: userId, totalPrice: '0.00' };
      carts.push(cart);
      writeCSV(CARTS_FILE, carts, ['id', 'user', 'totalPrice']);
    }
    return cart;
  },

  async findOne({ user }) {
    const cart = await this.findOneOrCreate(user);
    const items = readCSV(CART_ITEMS_FILE).filter(i => i.cartId === cart.id);

    const transformedItems = items.map(item => ({
      product: {
        _id: item.productId,
        title: 'Dummy Product', // Placeholder - should map to actual product data
        slug: '',
        description: '',
        images: ''
      },
      quantity: parseInt(item.quantity),
      price: parseFloat(item.price),
      color: item.color
    }));

    return {
      _id: cart.id,
      user: cart.user,
      items: transformedItems,
      totalPrice: parseFloat(cart.totalPrice)
    };
  },

  async addItem(userId, productId, quantity, price, color) {
    const cart = await this.findOneOrCreate(userId);
    const items = readCSV(CART_ITEMS_FILE);

    let item = items.find(i => i.cartId === cart.id && i.productId === productId && i.color === (color || ''));
    if (item) {
      item.quantity = (parseInt(item.quantity) + quantity).toString();
    } else {
      item = {
        id: uuidv4(),
        cartId: cart.id,
        productId,
        quantity: quantity.toString(),
        price: price.toString(),
        color: color || ''
      };
      items.push(item);
    }

    writeCSV(CART_ITEMS_FILE, items, ['id', 'cartId', 'productId', 'quantity', 'price', 'color']);
    await this._updateTotal(cart.id);
    return this.findOne({ user: userId });
  },

  async updateItemQuantity(userId, itemId, quantity) {
    const cart = await this.findOneOrCreate(userId);
    const items = readCSV(CART_ITEMS_FILE);
    const item = items.find(i => i.id === itemId && i.cartId === cart.id);
    if (item) {
      item.quantity = quantity.toString();
      writeCSV(CART_ITEMS_FILE, items, ['id', 'cartId', 'productId', 'quantity', 'price', 'color']);
      await this._updateTotal(cart.id);
    }
    return this.findOne({ user: userId });
  },

  async removeItem(userId, itemId) {
    const cart = await this.findOneOrCreate(userId);
    const items = readCSV(CART_ITEMS_FILE);
    const updatedItems = items.filter(i => !(i.id === itemId && i.cartId === cart.id));
    writeCSV(CART_ITEMS_FILE, updatedItems, ['id', 'cartId', 'productId', 'quantity', 'price', 'color']);
    await this._updateTotal(cart.id);
    return this.findOne({ user: userId });
  },

  async clearCart(userId) {
    const cart = await this.findOneOrCreate(userId);
    const remainingItems = readCSV(CART_ITEMS_FILE).filter(i => i.cartId !== cart.id);
    writeCSV(CART_ITEMS_FILE, remainingItems, ['id', 'cartId', 'productId', 'quantity', 'price', 'color']);
    await this._updateTotal(cart.id, 0);
    return this.findOne({ user: userId });
  },

  async _updateTotal(cartId, forcedTotal = null) {
    const items = readCSV(CART_ITEMS_FILE).filter(i => i.cartId === cartId);
    const total = forcedTotal !== null
      ? forcedTotal
      : items.reduce((sum, i) => sum + parseFloat(i.price) * parseInt(i.quantity), 0);

    const carts = readCSV(CARTS_FILE);
    const cart = carts.find(c => c.id === cartId);
    if (cart) {
      cart.totalPrice = total.toFixed(2);
      writeCSV(CARTS_FILE, carts, ['id', 'user', 'totalPrice']);
    }
  }
};

export default Cart;
