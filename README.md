# VPGen

One-click WireGuard config generator, work in progress.

## Why?

Make it easier to share VPN access with friends/family,
making use of existing networking infrastructure.

## How?

Currently, the supported backend is [OPNsense](https://opnsense.org/).
VPGen just creates WireGuard clients on the configured interface via the OPNsense API.

Future plans include supporting other API backends (e.g. [Netmaker](https://github.com/gravitl/netmaker))
and [wg-quick](https://www.wireguard.com/quickstart/) for standalone setups.

## Development

Development uses bun.
An additional prepare step is needed to set up typia for type validation.

For example .env settings, see [.env.example](.env.example)

```shell
bun install
bun run prepare
bun run dev
```
