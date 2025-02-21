<script lang="ts">
  import ActionButton from "./action-button.svelte";
  import type { ButtonProps } from "./component";
  import { clsx } from "clsx";

  const { action, class_, children }: ButtonProps = $props();
</script>

<ActionButton
  {action}
  class_={clsx("rounded border border-dashed border-blue-500 text-blue-500", class_)}
>
  {#if children}
    {@render children()}
  {/if}
  <button class="h-full w-full">+</button>
</ActionButton>
