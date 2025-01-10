import { Address4, Address6 } from 'ip-address';
import { env } from '$env/dynamic/private';

export function getIpsFromIndex(ipIndex: number) {
	ipIndex -= 1; // 1-indexed in the db
	const v4StartingAddr = new Address4(env.IPV4_STARTING_ADDR);
	const v6StartingAddr = new Address6(env.IPV6_STARTING_ADDR);
	const v4Allowed = Address4.fromBigInt(v4StartingAddr.bigInt() + BigInt(ipIndex));
	const v6Offset = BigInt(ipIndex) << (128n - BigInt(env.IPV6_CLIENT_PREFIX_SIZE));
	const v6Allowed = Address6.fromBigInt(v6StartingAddr.bigInt() + v6Offset);
	const v6AllowedShort = v6Allowed.parsedAddress.join(':');

	return [v4Allowed.address + '/32', v6AllowedShort + '/' + env.IPV6_CLIENT_PREFIX_SIZE];
}
