<script>
	let { form } = $props();
</script>

<div class="min-h-screen flex justify-center items-center">
	<form action="?/login" method="post" class="flex flex-col gap-2">
		<label for="user">Username</label>
		<input name="user" class="form-inp" />
		<label for="pass">Password</label>
		<input name="pass" type="password" class="form-inp" />
		<button class="form-btn">Log In</button>
		{#if form && !form.success}
			<p class="w-60 text-red-500">{form.message}</p>
		{/if}
	</form>
</div>
