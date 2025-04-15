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

// Admin user credentials
const ADMIN_EMAIL = "admin@example.com";
const ADMIN_PASSWORD = "admin123";
const ADMIN_NAME = "Administrador";

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

      // Create the users table if it doesn't exist and ensure admin user exists
      this.initDatabase();
    } else {
      console.log("Using in-memory user store for development");

      // Add a default admin user
      this.createDefaultUser();
    }
  }

  // Create a default admin user for development
  private async createDefaultUser() {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, salt);

    this.users.push({
      id: this.nextId++,
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      password: hashedPassword,
      role: UserRole.ADMIN,
      created_at: new Date(),
      updated_at: new Date(),
    });

    console.log(
      `Created default admin user: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`
    );
  }

  // Initialize the database and ensure admin user exists
  private async initDatabase(): Promise<void> {
    await this.initTable();
    await this.ensureAdminUser();
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

  // Ensure admin user exists in the database
  private async ensureAdminUser(): Promise<void> {
    if (!this.pool) return;

    try {
      // Check if admin user exists
      const checkQuery = "SELECT * FROM users WHERE email = $1;";
      const result = await this.pool.query(checkQuery, [ADMIN_EMAIL]);

      if (result.rows.length === 0) {
        // Admin user doesn't exist, create it
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, salt);

        const insertQuery = `
          INSERT INTO users (name, email, password, role)
          VALUES ($1, $2, $3, $4)
          RETURNING id;
        `;

        await this.pool.query(insertQuery, [
          ADMIN_NAME,
          ADMIN_EMAIL,
          hashedPassword,
          UserRole.ADMIN,
        ]);

        console.log(
          `Admin user created in database: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`
        );
      } else {
        console.log(`Admin user already exists in database: ${ADMIN_EMAIL}`);
      }
    } catch (error) {
      console.error("Error ensuring admin user exists:", error);
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

  // Get all users (for admin purposes)
  async getAllUsers(): Promise<UserResponse[]> {
    if (this.useInMemory) {
      return this.users.map((user) => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword as UserResponse;
      });
    }

    if (!this.pool) return [];

    const query = `
      SELECT id, name, email, role, created_at, updated_at
      FROM users
      ORDER BY created_at DESC;
    `;

    try {
      const result = await this.pool.query(query);
      return result.rows;
    } catch (error) {
      console.error("Error getting all users:", error);
      return [];
    }
  }

  // Delete user by ID (admin only)
  async deleteUser(id: number): Promise<boolean> {
    if (this.useInMemory) {
      const index = this.users.findIndex((u) => u.id === id);

      if (index === -1) return false;

      // Don't allow deleting the last admin
      const adminCount = this.users.filter(
        (u) => u.role === UserRole.ADMIN
      ).length;
      const userToDelete = this.users[index];

      if (adminCount <= 1 && userToDelete.role === UserRole.ADMIN) {
        return false;
      }

      this.users.splice(index, 1);
      return true;
    }

    if (!this.pool) return false;

    // First check if user exists and is admin
    const checkQuery = `
      SELECT role FROM users WHERE id = $1;
    `;

    try {
      // Get admin count
      const adminCountQuery = `
        SELECT COUNT(*) FROM users WHERE role = '${UserRole.ADMIN}';
      `;
      const adminResult = await this.pool.query(adminCountQuery);
      const adminCount = parseInt(adminResult.rows[0].count);

      // Check user role
      const checkResult = await this.pool.query(checkQuery, [id]);
      if (checkResult.rows.length === 0) return false;

      const userRole = checkResult.rows[0].role;

      // Don't allow deleting the last admin
      if (adminCount <= 1 && userRole === UserRole.ADMIN) {
        return false;
      }

      // Proceed with deletion
      const deleteQuery = `
        DELETE FROM users WHERE id = $1;
      `;
      await this.pool.query(deleteQuery, [id]);
      return true;
    } catch (error) {
      console.error("Error deleting user:", error);
      return false;
    }
  }
}

export default new UserModel();
