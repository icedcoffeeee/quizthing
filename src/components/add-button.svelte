<script lang="ts">
  import ActionButton from "./action-button.svelte";
  import type { ButtonProps } from "./comp";
  import { clsx } from "clsx";

  const { action, class_, children }: ButtonProps = $props();
</script>

<ActionButton
  {action}
  class_={clsx("rounded border border-dashed border-blue-500 text-2xl text-blue-500", class_)}
>
  {#if children}
    {@render children()}
  {/if}
  <button class="h-full w-full -translate-y-[2px]">+</button>
</ActionButton>
