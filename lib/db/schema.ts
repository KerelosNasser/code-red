import { pgTable, text, varchar, timestamp, jsonb, uuid, integer } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  firstName: varchar("first_name", { length: 255 }).notNull(),
  lastName: varchar("last_name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }).notNull().unique(),
  email: varchar("email", { length: 255 }).unique(),
  role: varchar("role", { length: 50 }).notNull().default("member"), // 'admin', 'servant', 'member'
  teamId: uuid("team_id"), // Will add references after defining teams
  managedBy: varchar("managed_by", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const teams = pgTable("teams", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  adminPhone: varchar("admin_phone", { length: 50 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const admins = pgTable("admins", {
  phone: varchar("phone", { length: 50 }).primaryKey(),
  firstName: varchar("first_name", { length: 255 }).notNull(),
  lastName: varchar("last_name", { length: 255 }).notNull(),
});

export const submissions = pgTable("submissions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  payload: jsonb("payload"),
  status: varchar("status", { length: 50 }).notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const products = pgTable("products", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  price: integer("price").notNull(), // Assuming cents or whole numbers
  imageUrl: text("image_url"),
});

// --- COURSES SYSTEM ---

export const courses = pgTable("courses", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  level: varchar("level", { length: 50 }),
  thumbnail: text("thumbnail"),
  status: varchar("status", { length: 50 }).notNull().default("draft"),
  ownerPhone: varchar("owner_phone", { length: 50 }).notNull().default("system"),
  ownerRole: varchar("owner_role", { length: 50 }).notNull().default("admin"),
  publishedAt: timestamp("published_at"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const sections = pgTable("sections", {
  id: uuid("id").primaryKey().defaultRandom(),
  courseId: uuid("course_id").references(() => courses.id, { onDelete: "cascade" }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  position: integer("position").notNull().default(0), // For ordering
});

export const lessons = pgTable("lessons", {
  id: uuid("id").primaryKey().defaultRandom(),
  sectionId: uuid("section_id").references(() => sections.id, { onDelete: "cascade" }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  videoUrl: text("video_url"), // Path to the HLS .m3u8 file
  resourceUrl: text("resource_url"), // Path to attached PDF/ZIP
  position: integer("position").notNull().default(0), // For ordering
});

export const adminNotifications = pgTable("admin_notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  adminPhone: varchar("admin_phone", { length: 50 }).notNull().default("system"),
  type: varchar("type", { length: 80 }).notNull(),
  message: text("message").notNull(),
  metadata: jsonb("metadata"),
  readAt: timestamp("read_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
