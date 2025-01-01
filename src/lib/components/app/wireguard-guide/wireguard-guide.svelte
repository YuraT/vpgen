<script lang="ts">
	import * as Tabs from '$lib/components/ui/tabs';
	import * as Card from '$lib/components/ui/card';
	import getItOnGooglePlay from '$lib/assets/GetItOnGooglePlay_Badge_Web_color_English.png';
	import guideVideo from '$lib/assets/guide-client.mp4';
</script>

<Tabs.Root value="android">
	<Tabs.List class="grid w-full grid-cols-3">
		<Tabs.Trigger value="android">Android</Tabs.Trigger>
		<Tabs.Trigger value="windows">Windows</Tabs.Trigger>
		<Tabs.Trigger value="other">Other</Tabs.Trigger>
	</Tabs.List>
	<Tabs.Content value="android">
		<Card.Root>
			<Card.Header class="max-sm:px-4 max-sm:pt-4">
				<Card.Title>WireGuard on Android</Card.Title>
			</Card.Header>
			<Card.Content class="max-sm:p-4">
				<ol class="flex flex-col gap-2">
					<li>
						<div class="flex flex-col gap-2">
							Install the WireGuard app
							<a
								class="contents"
								href="https://play.google.com/store/apps/details?id=com.wireguard.android"
								target="_blank"
								rel="noopener noreferrer"
							>
								<img class="size-min" alt="Get it on google play" src={getItOnGooglePlay} />
							</a>
						</div>
					</li>
					<li>
						<div class="flex flex-col gap-2">
							<p>Download the configuration file and import it</p>
							<aside>Alternatively, you can scan the QR code with the WireGuard app</aside>
							<video autoplay loop controls muted preload="metadata" class="max-h-screen">
								<source src={guideVideo} type="video/mp4" />
							</video>
						</div>
					</li>
				</ol>
			</Card.Content>
		</Card.Root>
	</Tabs.Content>
	<Tabs.Content value="windows">
		<Card.Root>
			<Card.Header>
				<Card.Title>WireGuard on Windows</Card.Title>
			</Card.Header>
			<Card.Content>
				<p>
					<a
						class="underline"
						href="https://download.wireguard.com/windows-client/wireguard-installer.exe"
						target="_blank"
						rel="noopener noreferrer"
					>
						Download WireGuard
					</a>
				</p>
			</Card.Content>
		</Card.Root>
	</Tabs.Content>
	<Tabs.Content value="other">
		<Card.Root>
			<Card.Header>
				<Card.Title>WireGuard on Other Platforms</Card.Title>
			</Card.Header>
			<Card.Content>
				<p>
					You can download the WireGuard client from the <a
						class="underline"
						href="https://www.wireguard.com/install/"
						target="_blank"
						rel="noopener noreferrer"
					>
						official website
					</a>.
				</p>
			</Card.Content>
		</Card.Root>
	</Tabs.Content>
</Tabs.Root>
