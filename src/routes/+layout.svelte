<script lang="ts">
  import "@fontsource/geist-mono";
  import "../app.css";

  import { Menu, X } from "lucide-svelte";

  let { children, data } = $props();
  const { admin } = $derived(data);

  let nav = $state(false);
  let toggleNav = () => (nav = !nav);
</script>

<button onclick={toggleNav} class="absolute top-0 flex w-full justify-end p-5 text-white md:hidden">
  <Menu></Menu>
</button>

<nav
  data-open={nav}
  class="invisible absolute top-0 z-10 flex min-h-screen w-full flex-col items-center justify-center gap-2 bg-slate-500 p-5 text-white data-[open=true]:visible md:visible md:min-h-fit md:flex-row md:justify-between md:bg-white/0"
>
  <button
    onclick={toggleNav}
    class="absolute top-0 flex w-full justify-end p-5 text-white md:hidden"
  >
    <X></X>
  </button>
  <a onclick={toggleNav} href="/" class="invisible md:visible">QuizThing</a>
  <a onclick={toggleNav} href="/" class="md:hidden">home</a>
  <span class="contents md:flex md:gap-8">
    <a onclick={toggleNav} href="/about">about</a>
    {#if !admin}
      <form action="?/login" method="post">
        <button onclick={toggleNav}>log in</button>
      </form>
    {:else}
      <form action="?/logout" method="post">
        <button onclick={toggleNav}>log out</button>
      </form>
    {/if}
  </span>
</nav>

<div
  class="min-h-screen w-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-5 text-white"
>
  {@render children()}
</div>
