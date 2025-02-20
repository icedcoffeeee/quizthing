<script lang="ts">
  import ActionButton from "comp/action-button.svelte";
  import AddButton from "comp/add-button.svelte";
  import DelButton from "comp/del-button.svelte";
  import { X } from "lucide-svelte";

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
            <button
              contenteditable
              class="flex w-full justify-between rounded border border-blue-500 pl-2 text-left"
            >
              {answer.title}
              <ActionButton action="?/delanswer" class_="aspect-square h-fit self-center">
                <input type="hidden" name="answerID" value={answer.id} />
                <button
                  onclick={(e) => e.stopPropagation()}
                  class="flex h-full w-full items-center justify-center bg-white p-1 text-red-900"
                >
                  <X size={15}></X>
                </button>
              </ActionButton>
            </button>
          {/if}
        {/each}
        <div class="flex justify-between">
          <AddButton action="?/addanswer" class_="aspect-square inline w-fit">
            <input type="hidden" name="questionID" value={question.id} />
          </AddButton>
          <DelButton action="?/delquestion" class_="aspect-square h-fit self-center">
            <input type="hidden" name="questionID" value={question.id} />
          </DelButton>
        </div>
      </div>
    </div>
  {/each}
  <AddButton action="?/addquestion" class_="max-w-min min-w-[20rem]">
    <input type="hidden" name="quizID" value={data.quiz.id} />
  </AddButton>
</div>
