<script lang="ts">
  import ActionButton from "$components/action-button.svelte";
  import AddButton from "$components/add-button.svelte";
  import DelButton from "$components/del-button.svelte";
  import { ArrowRight, Check, Play, Trash, X } from "lucide-svelte";
  import { clamp, manualFetch } from "$lib";
  import { getQuizStatus } from "$lib";

  const { data } = $props();
  const { quiz, questions, answers } = $derived(data);
</script>

<div class="mb-5 flex items-baseline gap-5 pt-15">
  <h1
    contenteditable
    onfocusout={(e) => {
      manualFetch("?/changequizname", [
        ["quizID", quiz.id.toString()],
        ["name", e.currentTarget.innerHTML],
      ]);
    }}
    class="min-w-2rem text-2xl"
  >
    {quiz.name}
  </h1>
  <span class="w-fit rounded bg-blue-900 px-1">{quiz.code}</span>
</div>
<div class="mb-5 flex items-center gap-4">
  <ActionButton action="?/togglestatus" class_="aspect-square w-fit self-center">
    <input type="hidden" name="quizID" value={quiz.id} />
    <button class="flex h-full w-full items-center justify-center rounded-full bg-green-900 p-2">
      {#if quiz.status === -1}
        <Play size={15}></Play>
      {:else}
        <X size={15}></X>
      {/if}
    </button>
  </ActionButton>
  <p>status: {getQuizStatus(quiz.status)}</p>
  {#if quiz.status !== -1}
    <a
      href="/{quiz.code}"
      class="flex items-center justify-center rounded-full bg-blue-900 p-2"
    >
      <ArrowRight size={15}></ArrowRight>
    </a>
  {/if}
</div>
<h2 class="mb-5 text-lg">Questions</h2>
<div
  class="-mx-5 flex flex-col items-center gap-4 overflow-auto px-5 pb-5 md:flex-row md:items-start"
>
  {#each questions as q, n (q.id)}
    <div class="h-fit max-w-min min-w-[20rem] rounded bg-white p-2 text-black">
      <input
        type="number"
        value={n + 1}
        min="1"
        max={questions.length}
        class="w-full"
        onchange={(e) => {
          e.currentTarget.value = clamp(e.currentTarget.value, 1, questions.length).toString();
          manualFetch("?/changequestionorder", [
            ["questionID", q.id.toString()],
            ["oldIndex", q.index.toString()],
            ["newIndex", e.currentTarget.value],
          ]);
        }}
      />
      <h3
        contenteditable
        onfocusout={(e) => {
          manualFetch("?/changequestiontitle", [
            ["questionID", q.id.toString()],
            ["title", e.currentTarget.innerHTML],
          ]);
        }}
        class="min-w-2rem mb-4"
      >
        {q.title}
      </h3>
      <div class="flex flex-col gap-2">
        {#each answers[q.index - 1] as a}
          <div
            class="flex w-full justify-between rounded border border-blue-500 pl-2 text-left"
            class:bg-blue-500={a.id === q.correctID}
          >
            <div
              contenteditable
              onfocusout={(e) => {
                manualFetch("?/changeanswertitle", [
                  ["answerID", a.id.toString()],
                  ["title", e.currentTarget.innerHTML],
                ]);
              }}
              class="min-w-2rem"
              class:text-white={a.id === q.correctID}
            >
              {a.title}
            </div>
            <div class="flex items-start">
              <ActionButton action="?/coranswer" class_="aspect-square h-fit self-center">
                <input type="hidden" name="questionID" value={q.id} />
                <input type="hidden" name="answerID" value={a.id} />
                <button
                  onclick={(e) => e.stopPropagation()}
                  class="flex h-full w-full items-center justify-center p-1 {a.id === q.correctID
                    ? 'bg-blue-500 text-white'
                    : 'text-blue-900" bg-white'}"
                >
                  <Check size={15}></Check>
                </button>
              </ActionButton>
              <ActionButton action="?/delanswer" class_="aspect-square h-fit self-center">
                <input type="hidden" name="answerID" value={a.id} />
                <button
                  onclick={(e) => e.stopPropagation()}
                  class="flex h-full w-full items-center justify-center p-1 {a.id === q.correctID
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-red-900'}"
                >
                  <Trash size={15}></Trash>
                </button>
              </ActionButton>
            </div>
          </div>
        {/each}
        <div class="flex justify-between">
          <AddButton action="?/addanswer" class_="aspect-square inline w-fit">
            <input type="hidden" name="questionID" value={q.id} />
          </AddButton>
          <DelButton action="?/delquestion" class_="aspect-square h-fit self-center">
            <input type="hidden" name="questionID" value={q.id} />
          </DelButton>
        </div>
      </div>
    </div>
  {/each}
  <AddButton action="?/addquestion" class_="max-w-min min-w-[20rem]">
    <input type="hidden" name="quizID" value={quiz.id} />
  </AddButton>
</div>
