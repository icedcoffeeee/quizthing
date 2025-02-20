<script lang="ts">
  import ActionButton from "./action-button.svelte";
  import type { ButtonProps } from "./comp";
  import { Trash } from "lucide-svelte";
  import { clsx } from "clsx";

  const { action, class_, children }: ButtonProps = $props();
</script>

<ActionButton {action} class_={clsx("text-red-500", class_)}>
  {#if children}
    {@render children()}
  {/if}
  <button class="h-full w-full -translate-y-[2px]">
    <Trash size={20}></Trash>
  </button>
</ActionButton>
