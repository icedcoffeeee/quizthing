<script lang="ts">
  import { page } from "$app/state";
</script>

<div class="flex h-screen w-full items-center justify-center">
  <p>{page.error?.message}</p>
</div>
