<script lang="ts">
  import AddButton from "../add-button.svelte";

  const { data } = $props();
</script>

<div class="mb-5 flex items-baseline gap-5 pt-15">
  <h1 contenteditable class="text-2xl">{data.quiz.name}</h1>
  <span class="w-fit rounded bg-blue-900 px-1">{data.quiz.code}</span>
</div>
<h2 class="mb-5 text-lg">Questions</h2>
<div
  class="-mx-5 flex flex-col items-center gap-4 overflow-auto px-5 pb-5 md:flex-row md:items-start"
>
  {#each data.questions as question, n}
    <div class="h-fit max-w-min min-w-[20rem] rounded bg-white p-2 text-black">
      <input type="number" value={n + 1} min="1" max={data.questions.length} class="w-full" />
      <h3 contenteditable class="mb-4">{question.title}</h3>
      <div class="flex flex-col gap-2">
        {#each data.answers[n] as answer}
          {#if answer}
            <button contenteditable class="w-full rounded border border-blue-500 px-2 text-left">
              {answer.title}
            </button>
          {/if}
        {/each}
        <AddButton action="?/addanswer" class_="aspect-square inline w-fit">
          <input type="hidden" name="questionID" value={question.id} />
        </AddButton>
      </div>
    </div>
  {/each}
  <AddButton action="?/addquestion" class_="max-w-min min-w-[20rem]">
    <input type="hidden" name="quizID" value={data.quiz.id} />
  </AddButton>
</div>
