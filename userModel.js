
import bcrypt from "bcrypt";
import { sql } from './dbconnect.js';

// User model functions for PostgreSQL
const User = {
  // Create a new user
  async create(userData) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);
    
    const result = await sql`
      INSERT INTO users (
        firstname, lastname, email, mobile, password, role, is_admin
      ) VALUES (
        ${userData.firstname}, 
        ${userData.lastname}, 
        ${userData.email}, 
        ${userData.mobile}, 
        ${hashedPassword}, 
        ${userData.role || 'user'}, 
        ${userData.isAdmin || 'user'}
      ) 
      RETURNING *
    `;
    
    return result[0];
  },
  
  // Find a user by ID
  async findById(id) {
    const user = await sql`SELECT * FROM users WHERE id = ${id}`;
    return user[0] || null;
  },
  
  // Find a user by email
  async findOne(query) {
    const user = await sql`
      SELECT * FROM users 
      WHERE ${sql(query)}
      LIMIT 1
    `;
    return user[0] || null;
  },
  
  // Find all users
  async find(query = {}, options = {}) {
    const { limit, skip } = options;
    const users = await sql`
      SELECT * FROM users 
      WHERE ${sql(query)}
      LIMIT ${limit || null}
      OFFSET ${skip || 0}
    `;
    return users;
  },
  
  // Update a user
  async findByIdAndUpdate(id, update) {
    // If password is being updated, hash it
    if (update.password) {
      const salt = await bcrypt.genSalt(10);
      update.password = await bcrypt.hash(update.password, salt);
    }
    
    const columns = Object.keys(update);
    const values = Object.values(update);
    
    if (columns.length === 0) return null;
    
    // Dynamically build the SET part of the query
    let setClause = columns.map((col, i) => `${col} = ${values[i]}`).join(', ');
    
    const updatedUser = await sql`
      UPDATE users 
      SET ${sql(setClause)}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `;
    
    return updatedUser[0] || null;
  },
  
  // Compare password
  async isPasswordMatched(enteredPassword, storedPassword) {
    return await bcrypt.compare(enteredPassword, storedPassword);
  }
};

export default User;
