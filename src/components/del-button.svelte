<script lang="ts">
  import ActionButton from "./action-button.svelte";
  import type { ButtonProps } from "./component";
  import { Trash } from "lucide-svelte";

  const { action, class_, children }: ButtonProps = $props();
</script>

<ActionButton {action} {class_}>
  {#if children}
    {@render children()}
  {/if}
  <button
    onclick={(e) => e.stopPropagation()}
    class="flex h-full w-full items-center justify-center rounded-full bg-red-900 p-1 text-white"
  >
    <Trash size={20}></Trash>
  </button>
</ActionButton>
