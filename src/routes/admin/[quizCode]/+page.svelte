<script lang="ts">
  import ActionButton from "$com/action-button.svelte";
  import AddButton from "$com/add-button.svelte";
  import DelButton from "$com/del-button.svelte";
  import type { PageProps } from "./$types";
  import type { User } from "$lib/server";
  import { ArrowRight, Check, Play, Trash, X } from "lucide-svelte";
  import { getQuizStatus, clamp, manualFetch } from "$lib";

  const { data, form }: PageProps = $props();
  const { quiz, questions, answers, users } = $derived(data);

  const getusercorrectanswers = (u: User) =>
    answers
      .flat()
      .map((a) => a.userIDs.includes(u.id) && questions.map((q) => q.correctID).includes(a.id));
</script>

<div class="mb-5 flex items-baseline gap-5 pt-15">
  <h1
    contenteditable
    onfocusout={(e) => {
      manualFetch("?/changequizname", {
        quizCode: quiz.code.toString(),
        name: e.currentTarget.innerHTML,
      });
    }}
    class="min-w-2rem text-2xl"
  >
    {quiz.title}
  </h1>
  <span class="w-fit rounded bg-blue-900 px-1">{quiz.code}</span>
</div>

<div class="mb-5 flex items-center gap-4">
  <ActionButton action="?/togglestatus" class_="aspect-square w-fit self-center">
    <input type="hidden" name="quizCode" value={quiz.code} />
    <button class="flex h-full w-full items-center justify-center rounded-full bg-green-900 p-2">
      {#if quiz.status === -1}
        <Play size={15}></Play>
      {:else}
        <X size={15}></X>
      {/if}
    </button>
  </ActionButton>
  <p>status: {getQuizStatus(quiz.status)}</p>
  {#if form && form.error}
    <p class="text-red-400">{form.error}</p>
  {/if}
  {#if quiz.status !== -1}
    <a href="/{quiz.code}" class="flex items-center justify-center rounded-full bg-blue-900 p-2">
      <ArrowRight size={15}></ArrowRight>
    </a>
  {/if}
</div>

<h2 class="mb-5 text-lg">Questions</h2>
<div
  class="-mx-5 mb-10 flex flex-col items-center gap-4 overflow-auto px-5 pb-5 md:flex-row md:items-start"
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
          manualFetch("?/changequestionorder", {
            questionID: q.id.toString(),
            oldIndex: q.index.toString(),
            newIndex: e.currentTarget.value,
          });
        }}
      />
      <h3
        contenteditable
        onfocusout={(e) => {
          manualFetch("?/changequestiontitle", {
            questionID: q.id.toString(),
            title: e.currentTarget.innerHTML,
          });
        }}
        class="min-w-2rem mb-4"
      >
        {q.title}
      </h3>
      <div class="flex flex-col gap-2">
        {#each answers[n] as a}
          <div
            class="flex w-full justify-between rounded border border-blue-500 pl-2 text-left"
            class:bg-blue-500={a.id === q.correctID}
          >
            <div
              contenteditable
              onfocusout={(e) => {
                manualFetch("?/changeanswertitle", {
                  answerID: a.id.toString(),
                  title: e.currentTarget.innerHTML,
                });
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
    <input type="hidden" name="quizCode" value={quiz.code} />
    <input type="hidden" name="lastIndex" value={questions.length} />
  </AddButton>
</div>

<div class="rounded-lg bg-white/10 p-4 md:mt-0 md:w-[20rem]">
  <h2 class="mb-4 text-lg">Participants</h2>
  <div class="flex flex-col">
    {#each users.sort((u1, u2) => getusercorrectanswers(u2).filter((a) => !!a).length - getusercorrectanswers(u1).filter((a) => !!a).length) as user}
      <p>
        {user.username} - {getusercorrectanswers(user).filter((a) => !!a).length}
      </p>
    {/each}
  </div>
</div>
