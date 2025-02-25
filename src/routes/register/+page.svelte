<script>
  import { page } from "$app/state";
</script>

<div class="flex min-h-screen items-center justify-center">
  <form action="?/register" method="post" class="flex flex-col gap-2">
    <label for="name">Username</label>
    <input name="name" class="form-inp" />
    <button class="form-btn">Join</button>
    <input type="hidden" name="url" value={page.url} />
  </form>
</div>
