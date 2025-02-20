<script lang="ts">
  import { getQuizStatus } from "$lib";
  import AddButton from "comp/add-button.svelte";
  import DelButton from "comp/del-button.svelte";

  const { data } = $props();
</script>

<h1 class="pt-15 pb-5 text-2xl">Your Quizzes</h1>

<div
  class="grid grid-cols-[repeat(auto-fill,20rem)] place-content-center gap-4 md:place-content-start"
>
  {#each data.quizzes as quiz, n}
    <a href="admin/{quiz.code}" class="flex aspect-video flex-col rounded bg-white/10 p-2">
      <h2 class="mb-2 text-lg">{quiz.name}</h2>
      <span class="flex justify-between">
        <p>{data.questionsL[n]} questions</p>
        <span class="rounded bg-blue-900 px-1">{quiz.code}</span>
      </span>
      <p>{quiz.participantIDs?.length} participants</p>
      <span class="grow"></span>
      <span class="flex justify-between">
        <p>status: {getQuizStatus(quiz.status ?? -1)}</p>
        <DelButton action="?/delquiz">
          <input type="hidden" name="quizID" value={quiz.id} />
        </DelButton>
      </span>
    </a>
  {/each}
  <AddButton action="?/addquiz" class_="aspect-video"></AddButton>
</div>
