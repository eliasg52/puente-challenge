import { Pool } from "pg";
import bcrypt from "bcryptjs";

// Define user roles
export enum UserRole {
  USER = "user",
  ADMIN = "admin",
}

// User interface
export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  created_at: Date;
  updated_at: Date;
}

// User creation interface (without id and timestamps)
export interface UserCreate {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}

// User response interface (without password)
export interface UserResponse {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  created_at: Date;
  updated_at: Date;
}

class UserModel {
  private pool: Pool | null = null;
  private users: User[] = [];
  private nextId = 1;
  private useInMemory = true;

  constructor() {
    // Check if we should use PostgreSQL or in-memory store
    if (
      process.env.NODE_ENV === "production" ||
      process.env.USE_DB === "true"
    ) {
      this.useInMemory = false;
      this.pool = new Pool({
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || "5432"),
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
      });

      // Create the users table if it doesn't exist
      this.initTable();
    } else {
      console.log("Using in-memory user store for development");

      // Add a default admin user
      this.createDefaultUser();
    }
  }

  // Create a default admin user for development
  private async createDefaultUser() {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("admin123", salt);

    this.users.push({
      id: this.nextId++,
      name: "Admin User",
      email: "admin@example.com",
      password: hashedPassword,
      role: UserRole.ADMIN,
      created_at: new Date(),
      updated_at: new Date(),
    });

    console.log("Created default admin user: admin@example.com / admin123");
  }

  // Initialize the users table
  private async initTable(): Promise<void> {
    if (!this.pool) return;

    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(100) NOT NULL,
        role VARCHAR(10) NOT NULL DEFAULT 'user',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    try {
      await this.pool.query(createTableQuery);
      console.log("Users table created or already exists");
    } catch (error) {
      console.error("Error creating users table:", error);
    }
  }

  // Create a new user
  async create(user: UserCreate): Promise<UserResponse | null> {
    const { name, email, password, role = UserRole.USER } = user;

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    if (this.useInMemory) {
      // Check if email already exists
      if (this.users.some((u) => u.email === email)) {
        console.error("Email already exists");
        return null;
      }

      const newUser: User = {
        id: this.nextId++,
        name,
        email,
        password: hashedPassword,
        role,
        created_at: new Date(),
        updated_at: new Date(),
      };

      this.users.push(newUser);

      const { password: _, ...userResponse } = newUser;
      return userResponse as UserResponse;
    }

    // Use database if not in-memory
    if (!this.pool) return null;

    const query = `
      INSERT INTO users (name, email, password, role)
      VALUES ($1, $2, $3, $4)
      RETURNING id, name, email, role, created_at, updated_at;
    `;

    try {
      const result = await this.pool.query(query, [
        name,
        email,
        hashedPassword,
        role,
      ]);
      return result.rows[0];
    } catch (error) {
      console.error("Error creating user:", error);
      return null;
    }
  }

  // Find user by email
  async findByEmail(email: string): Promise<User | null> {
    if (this.useInMemory) {
      return this.users.find((u) => u.email === email) || null;
    }

    if (!this.pool) return null;

    const query = "SELECT * FROM users WHERE email = $1;";

    try {
      const result = await this.pool.query(query, [email]);
      return result.rows[0] || null;
    } catch (error) {
      console.error("Error finding user by email:", error);
      return null;
    }
  }

  // Find user by ID
  async findById(id: number): Promise<UserResponse | null> {
    if (this.useInMemory) {
      const user = this.users.find((u) => u.id === id);
      if (!user) return null;

      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword as UserResponse;
    }

    if (!this.pool) return null;

    const query = `
      SELECT id, name, email, role, created_at, updated_at
      FROM users
      WHERE id = $1;
    `;

    try {
      const result = await this.pool.query(query, [id]);
      return result.rows[0] || null;
    } catch (error) {
      console.error("Error finding user by ID:", error);
      return null;
    }
  }

  // Check if user credentials are valid
  async validateUser(
    email: string,
    password: string
  ): Promise<UserResponse | null> {
    const user = await this.findByEmail(email);

    if (user && (await bcrypt.compare(password, user.password))) {
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword as UserResponse;
    }

    return null;
  }
}

export default new UserModel();
