<script lang="ts">
  import "@fontsource/geist-mono";
  import "../app.css";

  import { Menu, X } from "lucide-svelte";

  let { children, data } = $props();

  let nav = $state(false);
  let openNav = () => (nav = !nav);
</script>

<button onclick={openNav} class="absolute top-0 flex w-full justify-end p-5 text-white md:hidden">
  <Menu></Menu>
</button>

<nav
  data-open={nav}
  class="invisible absolute top-0 flex min-h-screen w-full flex-col items-center justify-center gap-2 bg-slate-500 p-5 text-white data-[open=true]:visible md:visible md:min-h-fit md:flex-row md:justify-between md:bg-white/0"
>
  <button onclick={openNav} class="absolute top-0 flex w-full justify-end p-5 text-white md:hidden">
    <X></X>
  </button>
  <a onclick={openNav} href="/" class="invisible md:visible">QuizThing</a>
  <a onclick={openNav} href="/" class="md:hidden">home</a>
  <span class="contents md:flex md:gap-8">
    <a onclick={openNav} href="/about">about</a>
    {#if data.admin}
      <form action="/login?/logout" method="post">
        <button onclick={openNav}>log out</button>
      </form>
    {:else}
      <a onclick={openNav} href="/login">log in</a>
    {/if}
  </span>
</nav>

<div
  class="min-h-screen w-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-5 text-white"
>
  {@render children()}
</div>
