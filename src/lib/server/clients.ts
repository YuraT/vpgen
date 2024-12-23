import type { User } from '$lib/server/db/schema';
import { db } from '$lib/server/db';
import { wgClients, ipAllocations } from '$lib/server/db/schema';
import { opnsenseAuth, opnsenseUrl, serverUuid } from '$lib/server/opnsense';
import { Address4, Address6 } from 'ip-address';
import {
	IP_MAX_INDEX,
	IPV4_STARTING_ADDR,
	IPV6_CLIENT_PREFIX_SIZE,
	IPV6_STARTING_ADDR, MAX_CLIENTS_PER_USER,
	VPN_ENDPOINT,
} from '$env/static/private';
import { count, eq, isNull } from 'drizzle-orm';
import { err, ok, type Result } from '$lib/types';

export async function createClient(params: {
	name: string;
	user: User;
}): Promise<Result<null, [400 | 500, string]>> {
	// check if user exceeds the limit of clients
	const [{ clientCount }] = await db
		.select({ clientCount: count() })
		.from(wgClients)
		.where(eq(wgClients.userId, params.user.id));
	if (clientCount >= parseInt(MAX_CLIENTS_PER_USER)) return err([400, 'Maximum number of clients reached'] as [400, string]);

	// this is going to be quite long
	// 1. fetch params for new client from opnsense api
	// 2.1 get an allocation for the client
	// 2.2. insert new client into db
	// 2.3. update the allocation with the client id
	// 3. create the client in opnsense
	// 4. reconfigure opnsense to enable the new client
	const error= await db.transaction(async (tx) => {
		const [keys, availableAllocation, lastAllocation] = await Promise.all([
			// fetch params for new client from opnsense api
			getKeys(),
			// find first unallocated IP
			await tx.query.ipAllocations.findFirst({
				columns: {
					id: true,
				},
				where: isNull(ipAllocations.clientId),
			}),
			// find last allocation to check if we have any IPs left
			await tx.query.ipAllocations.findFirst({
				columns: {
					id: true,
				},
				orderBy: (ipAllocations, { desc }) => desc(ipAllocations.id),
			}),
		]);

		// check for existing allocation or if we have any IPs left
		if (!availableAllocation && lastAllocation && lastAllocation.id >= parseInt(IP_MAX_INDEX)) {
			return err([500, 'No more IP addresses available'] as [500, string]);
		}

		// use existing allocation or create a new one
		const ipAllocationId =
			availableAllocation?.id ??
			(await tx.insert(ipAllocations).values({}).returning({ id: ipAllocations.id }))[0].id;

		// transaction savepoint after creating a new IP allocation
		// TODO: not sure if this is needed
		return await tx.transaction(async (tx2) => {
			// create new client in db
			const [newClient] = await tx2
				.insert(wgClients)
				.values({
					userId: params.user.id,
					name: params.name,
					publicKey: keys.pubkey,
					privateKey: keys.privkey,
					preSharedKey: keys.psk,
				})
				.returning({ id: wgClients.id });

			// update IP allocation with client ID
			await tx2
				.update(ipAllocations)
				.set({ clientId: newClient.id })
				.where(eq(ipAllocations.id, ipAllocationId));

			// create client in opnsense
			const opnsenseRes = await opnsenseCreateClient({
				username: params.user.username,
				pubkey: keys.pubkey,
				psk: keys.psk,
				allowedIps: getAllowedIps(ipAllocationId - 1),
			});
			const opnsenseResJson = await opnsenseRes.json();
			if (opnsenseResJson['result'] !== 'saved') {
				tx2.rollback();
				console.error(`Error creating client in OPNsense: \n${opnsenseResJson}`);
				return err([500, 'Error creating client in OPNsense'] as [500, string]);
			}

			// reconfigure opnsense
			await opnsenseReconfigure();
		});
	});
	if (error) return error;
	return ok(null);
}

async function getKeys() {
	// fetch key pair from opnsense
	const options: RequestInit = {
		method: 'GET',
		headers: {
			Authorization: opnsenseAuth,
			Accept: 'application/json',
		},
	};
	const resKeyPair = await fetch(`${opnsenseUrl}/api/wireguard/server/key_pair`, options);
	const resPsk = await fetch(`${opnsenseUrl}/api/wireguard/client/psk`, options);
	const keyPair = await resKeyPair.json();
	const psk = await resPsk.json();
	return {
		pubkey: keyPair['pubkey'] as string,
		privkey: keyPair['privkey'] as string,
		psk: psk['psk'] as string,
	};
}

function getAllowedIps(ipIndex: number) {
	const v4StartingAddr = new Address4(IPV4_STARTING_ADDR);
	const v6StartingAddr = new Address6(IPV6_STARTING_ADDR);
	const v4Allowed = Address4.fromBigInt(v4StartingAddr.bigInt() + BigInt(ipIndex));
	const v6Offset = BigInt(ipIndex) << (128n - BigInt(IPV6_CLIENT_PREFIX_SIZE));
	const v6Allowed = Address6.fromBigInt(v6StartingAddr.bigInt() + v6Offset);
	const v6AllowedShort = v6Allowed.parsedAddress.join(':');

	return `${v4Allowed.address}/32,${v6AllowedShort}/${IPV6_CLIENT_PREFIX_SIZE}`;
}

async function opnsenseCreateClient(params: {
	username: string;
	pubkey: string;
	psk: string;
	allowedIps: string;
}) {
	return fetch(`${opnsenseUrl}/api/wireguard/client/addClientBuilder`, {
		method: 'POST',
		headers: {
			Authorization: opnsenseAuth,
			Accept: 'application/json',
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			configbuilder: {
				enabled: '1',
				name: `vpgen-${params.username}`,
				pubkey: params.pubkey,
				psk: params.psk,
				tunneladdress: params.allowedIps,
				server: serverUuid,
				endpoint: VPN_ENDPOINT,
			},
		}),
	});
}

async function opnsenseReconfigure() {
	return fetch(`${opnsenseUrl}/api/wireguard/service/reconfigure`, {
		method: 'POST',
		headers: {
			Authorization: opnsenseAuth,
			Accept: 'application/json',
		},
	});
}
