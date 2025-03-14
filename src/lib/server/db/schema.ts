import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

export const users = sqliteTable('users', {
	id: text('id').primaryKey(),
	authSource: text('auth_source').notNull().default('authentik'),
	username: text('username').notNull(),
	name: text('name').notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
	devices: many(devices),
}));

export const sessions = sqliteTable('sessions', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => users.id),
	expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
});

export const ipAllocations = sqliteTable('ip_allocations', {
	// for now, id will be the same as the ipIndex
	id: integer('id').primaryKey({ autoIncrement: true }),
	// deviceId is nullable because allocations can remain after the device is deleted
	// unique for now, only allowing one allocation per device
	deviceId: integer('device_id')
		.unique()
		.references(() => devices.id, { onDelete: 'set null' }),
});

export const devices = sqliteTable('devices', {
	id: integer().primaryKey({ autoIncrement: true }),
	userId: text('user_id')
		.notNull()
		.references(() => users.id),
	name: text('name').notNull(),
	// questioning whether this should be nullable
	opnsenseId: text('opnsense_id'),
	publicKey: text('public_key').notNull().unique(),
	// nullable for the possibility of a user supplying their own private key
	privateKey: text('private_key'),
	// nullable for the possibility of no psk
	preSharedKey: text('pre_shared_key'),
	// discarded ideas:
	// (mostly because they make finding the next available ipIndex difficult)
	// ipIndex: integer('ip_index').notNull().unique(),
	// allowedIps: text('allowed_ips').notNull(),
});

export const devicesRelations = relations(devices, ({ one }) => ({
	user: one(users, {
		fields: [devices.userId],
		references: [users.id],
	}),
	ipAllocation: one(ipAllocations, {
		fields: [devices.id],
		references: [ipAllocations.deviceId],
	}),
}));

export type Device = typeof devices.$inferSelect;

export type Session = typeof sessions.$inferSelect;

export type User = typeof users.$inferSelect;
