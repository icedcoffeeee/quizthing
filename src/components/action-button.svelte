<script lang="ts">
  import type { ButtonProps } from "./component";
  import { clsx } from "clsx";
  import { enhance } from "$app/forms";

  const { action, class_, children }: ButtonProps = $props();
</script>

<form
  {action}
  method="post"
  class={clsx("flex items-center justify-center", class_ ?? "")}
  use:enhance
>
  {#if children}
    {@render children()}
  {/if}
</form>
