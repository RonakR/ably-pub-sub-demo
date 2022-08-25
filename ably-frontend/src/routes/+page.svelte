<script>
	import Ably from 'ably';
	import { onDestroy, onMount } from 'svelte';

	let ably;
	let standingsChannel;
	let pitStopsChannel;
	let penaltyChannel;
	let paginationResult;
	let paginationItems = [];
	let standings = [];
	let pitStops = {};
	let recentPenalty;
	// Add reactivity to the page
	$: paginationResult;
	$: paginationItems;
	$: standings;
	$: pitStops;
	$: recentPenalty;

	// Request auth token from server
	const authWithAbly = async () => {
		const response = await fetch('http://localhost:3000/requestToken/motorsportTeam');
		const { token } = await response.json();
		ably = new Ably.Realtime.Promise(token);
	};

	// Connect to Motorsport channels: standings, pitStops, penalties
	const establishConnection = async () => {
		await ably.connection.once('connected');
		standingsChannel = ably.channels.get('standings', { params: { rewind: '10m' } });
		pitStopsChannel = ably.channels.get('pitStops', { params: { rewind: '10m' } });
		penaltyChannel = ably.channels.get('penalties');

		paginationResult = await penaltyChannel.history();
		paginationItems = paginationResult.items;

		await standingsChannel.subscribe('standings', (message) => {
			standings = JSON.parse(message.data);
		});

		await pitStopsChannel.subscribe('pitStops', (message) => {
			pitStops[message.data] = message.data in pitStops ? pitStops[message.data] + 1 : 1;
			pitStops = pitStops;
		});

		await penaltyChannel.subscribe('penalties', (message) => {
			recentPenalty && paginationItems.unshift(recentPenalty);
			paginationItems = paginationItems;
			recentPenalty = message;
		});
	};

	onMount(async () => {
		await authWithAbly();
		await establishConnection();
	});

	onDestroy(async () => {
		// Disconect from Ably on close
		ably && ably.close();
	});

	const fetchMoreMessages = async () => {
		paginationResult = await paginationResult.next();
		paginationItems = [...paginationItems, ...paginationResult.items];
	};
</script>

<h1>Motorsport Team</h1>

{#if ably}
	<div class="container">
		<div>
			<h3>Current Standings:</h3>
			{#each standings as constructor, i}
				<li>
					{i + 1}: {constructor}
				</li>
			{/each}
		</div>
		<div>
			<h3>Pit Stop:</h3>
			{#each Object.entries(pitStops) as [constructor, i]}
				<li>
					{constructor} pit stops: {i}
				</li>
			{/each}
		</div>
	</div>

	<h3>Penalties:</h3>
	{#if recentPenalty}
		<p>Recent Penalty: {recentPenalty.data}</p>
	{/if}

	{#if paginationItems}
		{#each paginationItems as item, i}
			<li>
				{new Date(item.timestamp).toLocaleString()}: {item.data}
			</li>
		{/each}

		<p>Unread Messages: {paginationResult ? paginationResult.hasNext() : false}</p>

		{#if paginationResult && !paginationResult.isLast()}
			<button on:click={fetchMoreMessages}> Fetch more Messages </button>
		{/if}
	{/if}
{:else}
	<h3>Loading...</h3>
{/if}

<style>
	li {
		list-style-type: none;
	}

	.container {
		display: inline-flex;
		column-gap: 20px;
		align-content: space-between;
		flex-wrap: wrap;
	}
</style>
