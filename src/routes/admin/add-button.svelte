<script lang="ts">
  import { clsx } from "clsx";
  import type { Snippet } from "svelte";
  import { enhance } from "$app/forms";

  type Props = {
    action: string;
    class_?: string;
    children?: Snippet;
  };
  const { action, class_, children }: Props = $props();
</script>

<form
  {action}
  method="post"
  class={clsx(
    "flex items-center justify-center rounded border border-dashed border-blue-500 text-2xl text-blue-500",
    class_ ?? "",
  )}
  use:enhance
>
  {#if children}
    {@render children()}
  {/if}
  <button class="h-full w-full -translate-y-[2px]">+</button>
</form>
