<script lang="ts">
  import { invalidateAll } from "$app/navigation";
  import ActionButton from "comp/action-button.svelte";
  import AddButton from "comp/add-button.svelte";
  import DelButton from "comp/del-button.svelte";
  import { X } from "lucide-svelte";

  const { data } = $props();

  function manualFetch(action: string, data: string[][]) {
    fetch(action, { method: "post", body: new URLSearchParams(data) });
    invalidateAll();
  }
</script>

<div class="mb-5 flex items-baseline gap-5 pt-15">
  <h1
    contenteditable
    onfocusout={(e) => {
      manualFetch("?/changequizname", [
        ["quizID", data.quiz.id.toString()],
        ["name", e.currentTarget.innerHTML],
      ]);
    }}
    class="min-w-2rem text-2xl"
  >
    {data.quiz.name}
  </h1>
  <span class="w-fit rounded bg-blue-900 px-1">{data.quiz.code}</span>
</div>
<h2 class="mb-5 text-lg">Questions</h2>
<div
  class="-mx-5 flex flex-col items-center gap-4 overflow-auto px-5 pb-5 md:flex-row md:items-start"
>
  {#each data.questions as question, n (question.index)}
    <div class="h-fit max-w-min min-w-[20rem] rounded bg-white p-2 text-black">
      <input
        type="number"
        value={n + 1}
        min="1"
        max={data.questions.length}
        class="w-full"
        onchange={(e) => {
          const val = parseInt(e.currentTarget.value);
          e.currentTarget.value = Math.min(Math.max(1, n + 1), data.questions.length).toString();
          manualFetch("?/changequestionorder", [
            ["questionID", question.id.toString()],
            ["oldIndex", question.index.toString()],
            ["newIndex", val.toString()],
          ]);
        }}
      />
      <h3
        contenteditable
        onfocusout={(e) => {
          manualFetch("?/changequestiontitle", [
            ["questionID", question.id.toString()],
            ["title", e.currentTarget.innerHTML],
          ]);
        }}
        class="min-w-2rem mb-4"
      >
        {question.title}
      </h3>
      <div class="flex flex-col gap-2">
        {#each data.answers[question.index - 1] as answer}
          <div class="flex w-full justify-between rounded border border-blue-500 pl-2 text-left">
            <div
              contenteditable
              onfocusout={(e) => {
                manualFetch("?/changeanswertitle", [
                  ["answerID", answer.id.toString()],
                  ["title", e.currentTarget.innerHTML],
                ]);
              }}
              class="min-w-2rem"
            >
              {answer.title}
            </div>
            <ActionButton action="?/delanswer" class_="aspect-square h-fit self-center">
              <input type="hidden" name="answerID" value={answer.id} />
              <button
                onclick={(e) => e.stopPropagation()}
                class="flex h-full w-full items-center justify-center bg-white p-1 text-red-900"
              >
                <X size={15}></X>
              </button>
            </ActionButton>
          </div>
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
