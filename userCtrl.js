import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import asyncHandler from 'express-async-handler';
import jwtTokens from './jwtTokens.js';

const USERS_FILE = path.join('data', 'users.csv');
const HEADERS = ['id', 'email', 'password', 'firstname', 'lastname', 'mobile', 'isBlocked'];

if (!fs.existsSync(USERS_FILE)) {
  fs.writeFileSync(USERS_FILE, `${HEADERS.join(',')}\n`);
}

const { generateToken } = jwtTokens;

// CSV Helpers
const readCSV = (file) => {
  const lines = fs.readFileSync(file, 'utf-8').trim().split('\n');
  const headers = lines[0].split(',');
  return lines.slice(1).map(line => {
    const values = line.split(',');
    return headers.reduce((obj, h, i) => {
      obj[h] = values[i];
      return obj;
    }, {});
  });
};

const writeCSV = (file, data, headers) => {
  const csv = [headers.join(','), ...data.map(row => headers.map(h => row[h] ?? '').join(','))].join('\n');
  fs.writeFileSync(file, csv);
};

// Controller Functions
const createUser = asyncHandler(async (req, res) => {
  const { email, password, firstname, lastname, mobile } = req.body;
  if (!email || !password || !firstname || !lastname || !mobile) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const users = readCSV(USERS_FILE);
  if (users.find(u => u.email === email)) {
    return res.status(400).json({ error: 'User already exists' });
  }

  const newUser = {
    id: uuidv4(),
    email,
    password, // Reminder: hash this in real apps
    firstname,
    lastname,
    mobile,
    isBlocked: 'false'
  };

  users.push(newUser);
  writeCSV(USERS_FILE, users, HEADERS);

  res.status(201).json({
    status: 'success',
    token: generateToken(newUser.id),
    user: {
      _id: newUser.id,
      firstname,
      lastname,
      email,
      mobile
    }
  });
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const users = readCSV(USERS_FILE);
  const user = users.find(u => u.email === email);

  if (!user) return res.status(404).json({ error: 'User not found' });
  if (user.password !== password) return res.status(400).json({ error: 'Invalid password' });
  if (user.isBlocked === 'true') return res.status(403).json({ error: 'User is blocked' });

  const token = generateToken(user.id);
  const refreshToken = generateToken(user.id); // Replace with a different refreshToken if needed

  res.setHeader('Set-Cookie', `refreshToken=${refreshToken}; HttpOnly; Path=/; Max-Age=${3 * 24 * 60 * 60}; Secure`);

  res.json({
    status: 'success',
    token,
    user: {
      _id: user.id,
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      mobile: user.mobile
    }
  });
});

const getAllUsers = asyncHandler(async (req, res) => {
  const users = readCSV(USERS_FILE);
  res.json(users);
});

const getUser = asyncHandler(async (req, res) => {
  const user = readCSV(USERS_FILE).find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { firstname, lastname, email, mobile } = req.body;

  const users = readCSV(USERS_FILE);
  const index = users.findIndex(u => u.id === id);
  if (index === -1) return res.status(404).json({ error: 'User not found' });

  users[index] = {
    ...users[index],
    firstname: firstname ?? users[index].firstname,
    lastname: lastname ?? users[index].lastname,
    email: email ?? users[index].email,
    mobile: mobile ?? users[index].mobile
  };

  writeCSV(USERS_FILE, users, HEADERS);
  res.json({ status: 'success', user: users[index] });
});

const deleteUser = asyncHandler(async (req, res) => {
  const users = readCSV(USERS_FILE);
  const index = users.findIndex(u => u.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'User not found' });

  const [deletedUser] = users.splice(index, 1);
  writeCSV(USERS_FILE, users, HEADERS);
  res.json({ status: 'success', message: 'User deleted', deletedUser });
});

const blockUser = asyncHandler(async (req, res) => {
  const users = readCSV(USERS_FILE);
  const index = users.findIndex(u => u.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'User not found' });

  users[index].isBlocked = 'true';
  writeCSV(USERS_FILE, users, HEADERS);
  res.json({ status: 'success', message: 'User blocked' });
});

const unblockUser = asyncHandler(async (req, res) => {
  const users = readCSV(USERS_FILE);
  const index = users.findIndex(u => u.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'User not found' });

  users[index].isBlocked = 'false';
  writeCSV(USERS_FILE, users, HEADERS);
  res.json({ status: 'success', message: 'User unblocked' });
});

export default {
  createUser,
  loginUser,
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
  blockUser,
  unblockUser
};
