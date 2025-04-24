import bcrypt from 'bcrypt';
import { readCSV, writeCSV, appendCSV } from '../utils/dbconnect.js';
import { v4 as uuidv4 } from 'uuid';

const FILENAME = 'data/sampled_users.csv';

const User = {
  // Create a new user
  async create(userData) {
    const users = await readCSV(FILENAME);

    const existing = users.find(u => u.Email === userData.email);
    if (existing) throw new Error('User already exists');

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);

    const newUser = {
      UserID: uuidv4(),
      UserName: `${userData.firstname} ${userData.lastname}`,
      Email: userData.email,
      Address: userData.address || 'N/A',
      Phone: userData.mobile,
      Password: hashedPassword,
      Role: userData.role || 'user',
      CreatedAt: new Date().toISOString(),
      UpdatedAt: new Date().toISOString()
    };

    await appendCSV(FILENAME, newUser);
    return newUser;
  },

  // Find a user by ID
  async findById(id) {
    const users = await readCSV(FILENAME);
    return users.find(u => u.UserID === id) || null;
  },

  // Find one user by key
  async findOne(query) {
    const users = await readCSV(FILENAME);
    const [key, value] = Object.entries(query)[0];
    return users.find(u => u[key] === value) || null;
  },

  // Get all users, with optional filtering and pagination
  async find(query = {}, options = {}) {
    const users = await readCSV(FILENAME);
    let filtered = users;

    for (const [key, val] of Object.entries(query)) {
      filtered = filtered.filter(u => u[key] === val);
    }

    const { limit, skip } = options;
    return filtered.slice(skip || 0, limit ? (skip || 0) + limit : undefined);
  },

  // Update a user
  async findByIdAndUpdate(id, update) {
    const users = await readCSV(FILENAME);
    const index = users.findIndex(u => u.UserID === id);
    if (index === -1) return null;

    if (update.password) {
      const salt = await bcrypt.genSalt(10);
      update.Password = await bcrypt.hash(update.password, salt);
      delete update.password;
    }

    const updatedUser = {
      ...users[index],
      ...update,
      UpdatedAt: new Date().toISOString()
    };

    users[index] = updatedUser;
    await writeCSV(FILENAME, users);
    return updatedUser;
  },

  // Password matcher
  async isPasswordMatched(enteredPassword, storedPassword) {
    return await bcrypt.compare(enteredPassword, storedPassword);
  }
};

export default User;
