
import { sql } from '../dbconnect.js';

const Cart = {
  // Find a cart by user ID or create a new one
  async findOneOrCreate(userId) {
    // Check if cart exists
    let cart = await sql`
      SELECT * FROM carts WHERE user_id = ${userId}
    `;
    
    // If cart doesn't exist, create one
    if (!cart || cart.length === 0) {
      cart = await sql`
        INSERT INTO carts (user_id, total_price)
        VALUES (${userId}, 0)
        RETURNING *
      `;
    }
    
    return cart[0];
  },
  
  // Find cart by user ID with populated items
  async findOne(query) {
    const userId = query.user;
    
    // Get cart
    const cart = await sql`
      SELECT * FROM carts WHERE user_id = ${userId}
    `;
    
    if (!cart || cart.length === 0) return null;
    
    // Get cart items with product details
    const items = await sql`
      SELECT ci.*, p.title, p.slug, p.description, p.images
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.cart_id = ${cart[0].id}
    `;
    
    // Transform items to match the previous MongoDB structure
    const transformedItems = items.map(item => ({
      product: {
        _id: item.product_id,
        title: item.title,
        slug: item.slug,
        description: item.description,
        images: item.images
      },
      quantity: item.quantity,
      price: item.price,
      color: item.color
    }));
    
    return {
      _id: cart[0].id,
      user: cart[0].user_id,
      items: transformedItems,
      totalPrice: cart[0].total_price
    };
  },
  
  // Add item to cart
  async addItem(userId, productId, quantity, price, color) {
    // Get or create cart
    const cart = await this.findOneOrCreate(userId);
    
    // Check if item exists in cart
    const existingItem = await sql`
      SELECT * FROM cart_items
      WHERE cart_id = ${cart.id} AND product_id = ${productId}
    `;
    
    if (existingItem && existingItem.length > 0) {
      // Update existing item
      await sql`
        UPDATE cart_items
        SET quantity = quantity + ${quantity},
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ${existingItem[0].id}
      `;
    } else {
      // Add new item
      await sql`
        INSERT INTO cart_items (cart_id, product_id, quantity, price, color)
        VALUES (${cart.id}, ${productId}, ${quantity}, ${price}, ${color || null})
      `;
    }
    
    // Update cart total price
    const cartTotal = await sql`
      SELECT SUM(price * quantity) as total
      FROM cart_items
      WHERE cart_id = ${cart.id}
    `;
    
    await sql`
      UPDATE carts
      SET total_price = ${cartTotal[0].total || 0},
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${cart.id}
    `;
    
    return this.findOne({ user: userId });
  },
  
  // Update cart item quantity
  async updateItemQuantity(userId, itemId, quantity) {
    // Get cart
    const cart = await this.findOneOrCreate(userId);
    
    // Update item quantity
    await sql`
      UPDATE cart_items
      SET quantity = ${quantity},
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${itemId} AND cart_id = ${cart.id}
    `;
    
    // Update cart total price
    const cartTotal = await sql`
      SELECT SUM(price * quantity) as total
      FROM cart_items
      WHERE cart_id = ${cart.id}
    `;
    
    await sql`
      UPDATE carts
      SET total_price = ${cartTotal[0].total || 0},
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${cart.id}
    `;
    
    return this.findOne({ user: userId });
  },
  
  // Remove item from cart
  async removeItem(userId, itemId) {
    // Get cart
    const cart = await this.findOneOrCreate(userId);
    
    // Remove item
    await sql`
      DELETE FROM cart_items
      WHERE id = ${itemId} AND cart_id = ${cart.id}
    `;
    
    // Update cart total price
    const cartTotal = await sql`
      SELECT SUM(price * quantity) as total
      FROM cart_items
      WHERE cart_id = ${cart.id}
    `;
    
    await sql`
      UPDATE carts
      SET total_price = ${cartTotal[0].total || 0},
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${cart.id}
    `;
    
    return this.findOne({ user: userId });
  },
  
  // Clear cart
  async clearCart(userId) {
    // Get cart
    const cart = await this.findOneOrCreate(userId);
    
    // Remove all items
    await sql`
      DELETE FROM cart_items
      WHERE cart_id = ${cart.id}
    `;
    
    // Update cart total price
    await sql`
      UPDATE carts
      SET total_price = 0,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${cart.id}
    `;
    
    return this.findOne({ user: userId });
  }
};

export default Cart;
