<script lang="ts">
  import AddButton from "$components/add-button.svelte";
  import DelButton from "$components/del-button.svelte";
  import { getQuizStatus } from "$lib";

  const { data } = $props();
  const { quizzes, questionsL, usersL } = $derived(data);
</script>

<h1 class="pt-15 pb-5 text-2xl">Your Quizzes</h1>

<div
  class="grid grid-cols-[repeat(auto-fill,20rem)] place-content-center gap-4 md:place-content-start"
>
  {#each quizzes as quiz, n}
    <a href="admin/{quiz.code}" class="flex aspect-video flex-col rounded bg-white/10 p-2">
      <h2 class="mb-2 text-lg">{quiz.title}</h2>
      <span class="flex justify-between">
        <p>{questionsL[n]} questions</p>
        <span class="rounded bg-blue-900 px-1">{quiz.code}</span>
      </span>
      <p>{usersL[n]} participants</p>
      <span class="grow"></span>
      <span class="flex justify-between">
        <p>status: {getQuizStatus(quiz.status ?? -1)}</p>
        <DelButton action="?/delquiz">
          <input type="hidden" name="quizCode" value={quiz.code} />
        </DelButton>
      </span>
    </a>
  {/each}
  <AddButton action="?/addquiz" class_="aspect-video"></AddButton>
</div>
