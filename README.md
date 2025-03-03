# VPGen

One-click WireGuard config generator, work in progress.

## Why?

Make it easier to share VPN access with friends/family,
making use of (my) existing networking infrastructure.

## How?

Currently, the supported backend is [OPNsense](https://opnsense.org/).
VPGen just creates WireGuard clients on the configured interface via the OPNsense API.

Future plans include supporting other API backends, e.g. [Netmaker](https://github.com/gravitl/netmaker)

## Development

Development uses bun.

For example .env settings, see [.env.example](.env.example)

```shell
bun install
bun run dev
```
