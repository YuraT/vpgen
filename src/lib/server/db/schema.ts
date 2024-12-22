import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

export const users = sqliteTable('users', {
	id: text('id').primaryKey(),
	username: text('username').notNull(),
	name: text('name').notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
	wgClients: many(wgClients),
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
	// clientId is nullable because allocations can remain after the client is deleted
	// unique for now, only allowing one allocation per client
	clientId: integer('client_id')
		.unique()
		.references(() => wgClients.id),
});

export const wgClients = sqliteTable('wg_clients', {
	id: integer().primaryKey({ autoIncrement: true }),
	userId: text('user_id')
		.notNull()
		.references(() => users.id),
	name: text('name').notNull(),
	// questioning whether this should be nullable
	opnsenseId: text('opnsense_id'),
	publicKey: text('public_key').notNull().unique(),
	// nullable for the possibility of a client supplying their own private key
	privateKey: text('private_key'),
	// nullable for the possibility of no psk
	preSharedKey: text('pre_shared_key'),
	// discarded ideas:
	// (mostly because they make finding the next available ipIndex difficult)
	// ipIndex: integer('ip_index').notNull().unique(),
	// allowedIps: text('allowed_ips').notNull(),
});

export const wgClientsRelations = relations(wgClients, ({ one }) => ({
	ipAllocation: one(ipAllocations),
}));

export type WgClient = typeof wgClients.$inferSelect;

export type Session = typeof sessions.$inferSelect;

export type User = typeof users.$inferSelect;
