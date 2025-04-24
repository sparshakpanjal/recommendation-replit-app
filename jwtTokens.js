import jsonwebtoken from "jsonwebtoken";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Create __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Define the path to your CSV file
const usersFilePath = join(__dirname, "../data/sampled_users.csv");

// Function to read users from CSV
const readUsersFromCSV = () => {
  if (!fs.existsSync(usersFilePath)) {
    throw new Error("User CSV file not found");
  }

  const csvData = fs.readFileSync(usersFilePath, "utf8").trim();
  const rows = csvData.split("\n").slice(1); // Skip header
  const users = rows.map((row) => {
    const [id, email, role] = row.split(",");
    return { id, email, role };
  });
  return users;
};

// Generate JWT token
const generateToken = (id) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }
  return jsonwebtoken.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "3d",
  });
};

// Verify JWT token
const verifyToken = (token) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }

  try {
    const decoded = jsonwebtoken.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (error) {
    throw new Error("Invalid token");
  }
};

// Verify user exists in the CSV
const verifyUserFromCSV = (userId) => {
  const users = readUsersFromCSV();
  const user = users.find((user) => user.id === userId);
  if (!user) {
    throw new Error("User not found in CSV");
  }
  return user;
};

export default {
  generateToken,
  verifyToken,
  verifyUserFromCSV,
};
