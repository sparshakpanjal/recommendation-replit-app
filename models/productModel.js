
import { sql } from '../dbconnect.js';

// Helper function for slug creation
const createSlug = (title) => {
  return title.toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

const Product = {
  // Create a new product
  async create(productData) {
    if (!productData.slug && productData.title) {
      productData.slug = createSlug(productData.title);
    }
    
    const result = await sql`
      INSERT INTO products (
        title, slug, description, price, category_id, brand, quantity, color, images
      ) VALUES (
        ${productData.title},
        ${productData.slug},
        ${productData.description},
        ${productData.price},
        ${productData.category},
        ${productData.brand},
        ${productData.quantity},
        ${productData.color},
        ${JSON.stringify(productData.images || [])}
      )
      RETURNING *
    `;
    
    return result[0];
  },
  
  // Find product by ID
  async findById(id) {
    const product = await sql`
      SELECT p.*, c.title as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ${id}
    `;
    
    if (!product[0]) return null;
    
    // Get reviews for this product
    const reviews = await sql`
      SELECT r.*, u.firstname, u.lastname
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.product_id = ${id}
    `;
    
    return {
      ...product[0],
      reviews: reviews || []
    };
  },
  
  // Find all products with filtering
  async find(query = {}, options = {}) {
    const { sort, limit, skip, select } = options;
    
    // Build the WHERE clause based on query
    let whereClause = '';
    const queryParams = [];
    
    if (Object.keys(query).length > 0) {
      const conditions = [];
      
      for (const [key, value] of Object.entries(query)) {
        if (key === 'category') {
          conditions.push(`p.category_id = ${value}`);
        } else if (key === 'brand') {
          conditions.push(`p.brand ILIKE '%${value}%'`);
        } else if (key === 'title') {
          conditions.push(`p.title ILIKE '%${value}%'`);
        } else if (key === 'price_gte') {
          conditions.push(`p.price >= ${value}`);
        } else if (key === 'price_lte') {
          conditions.push(`p.price <= ${value}`);
        }
      }
      
      if (conditions.length > 0) {
        whereClause = 'WHERE ' + conditions.join(' AND ');
      }
    }
    
    // Build the ORDER BY clause
    let orderClause = 'ORDER BY p.created_at DESC';
    if (sort) {
      const sortFields = sort.split(',');
      const orderFields = sortFields.map(field => {
        if (field.startsWith('-')) {
          return `p.${field.substring(1)} DESC`;
        }
        return `p.${field} ASC`;
      });
      orderClause = 'ORDER BY ' + orderFields.join(', ');
    }
    
    // Build the query
    const products = await sql`
      SELECT p.*, c.title as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ${sql(whereClause)}
      ${sql(orderClause)}
      LIMIT ${limit || 100}
      OFFSET ${skip || 0}
    `;
    
    return products;
  },
  
  // Update a product
  async findByIdAndUpdate(id, updateData) {
    if (updateData.title && !updateData.slug) {
      updateData.slug = createSlug(updateData.title);
    }
    
    const columns = Object.keys(updateData);
    const values = Object.values(updateData);
    
    if (columns.length === 0) return null;
    
    // Convert category to category_id if needed
    if (updateData.category) {
      updateData.category_id = updateData.category;
      delete updateData.category;
    }
    
    // Convert images to JSON if it's an array
    if (updateData.images && Array.isArray(updateData.images)) {
      updateData.images = JSON.stringify(updateData.images);
    }
    
    // Dynamically build the SET part of the query
    let setClause = columns.map((col, i) => {
      // Rename category to category_id for SQL
      const column = col === 'category' ? 'category_id' : col;
      return `${column} = ${values[i]}`;
    }).join(', ');
    
    const updatedProduct = await sql`
      UPDATE products 
      SET ${sql(setClause)}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `;
    
    return updatedProduct[0] || null;
  },
  
  // Delete a product
  async findByIdAndDelete(id) {
    const deletedProduct = await sql`
      DELETE FROM products
      WHERE id = ${id}
      RETURNING *
    `;
    
    return deletedProduct[0] || null;
  },
  
  // Add a review to a product
  async addReview(productId, userId, rating, comment) {
    // Add the review
    await sql`
      INSERT INTO reviews (product_id, user_id, rating, comment)
      VALUES (${productId}, ${userId}, ${rating}, ${comment})
    `;
    
    // Count reviews and calculate average rating
    const reviewStats = await sql`
      SELECT COUNT(*) as count, AVG(rating) as avg_rating
      FROM reviews
      WHERE product_id = ${productId}
    `;
    
    // Update the product with new review count and average rating
    await sql`
      UPDATE products
      SET num_reviews = ${reviewStats[0].count},
          ratings = ${reviewStats[0].avg_rating}
      WHERE id = ${productId}
    `;
    
    return true;
  }
};

export default Product;
