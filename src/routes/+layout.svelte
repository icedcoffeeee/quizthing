<script lang="ts">
	import '@fontsource/geist-mono';
	import '../app.css';

	import { Menu, X } from 'lucide-svelte';

	let { children } = $props();

	let nav = $state(false);
	let openNav = () => (nav = !nav);
</script>

<button onclick={openNav} class="absolute top-0 w-full p-5 flex justify-end text-white md:hidden">
	<Menu></Menu>
</button>

<nav
	data-open={nav}
	class="invisible data-[open=true]:visible flex flex-col gap-2 absolute top-0 p-5 bg-slate-500 w-full text-white min-h-screen justify-center items-center md:visible md:bg-white/0 md:flex-row md:justify-between md:min-h-fit"
>
	<button onclick={openNav} class="absolute top-0 w-full p-5 flex justify-end text-white md:hidden">
		<X></X>
	</button>
	<a href="/" class="invisible md:visible">QuizThing</a>
	<a href="/" class="md:hidden">home</a>
	<span class="contents md:flex md:gap-8">
		<a href="/about">about</a>
		<a href="/login">log in</a>
		<!-- TODO: ^^^ check if logged in, change label -->
	</span>
</nav>

<div
	class="w-full min-h-screen px-5 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white"
>
	{@render children()}
</div>
