<script lang="ts">
  import { Pause, X } from "lucide-svelte";
  import { enhance } from "$app/forms";
  import { invalidateAll } from "$app/navigation";
  import { io } from "socket.io-client";

  const { data } = $props();

  const socket = io();
  socket.on("db-updated", () => {
    invalidateAll();
  });
  const trigger = () => {
    socket.emit("update-db");
  };
  let userAnswer = $derived(data.userAnswers ? data.userAnswers[data.quiz.status - 1] : undefined);
  let chosenAnswerID = $state(0);
</script>

<div class="mb-5 flex items-baseline gap-5 pt-15">
  <h1 class="min-w-2rem text-2xl">
    {data.quiz.name}
  </h1>
  <span class="w-fit rounded bg-blue-900 px-1">{data.quiz.code}</span>
</div>

<div class="flex h-[70lvh] w-full flex-col gap-4 md:flex-row">
  <div class="relative flex h-full grow flex-col items-center justify-center">
    {#if data.quiz.status <= 0}
      <p class="animate-pulse">waiting for the host...</p>
    {:else}
      <div class="grid w-full max-w-md gap-5">
        <div class="flex flex-col gap-2 rounded bg-white p-4 text-lg text-black">
          <div class="mb-5">
            {Math.floor(data.questions[Math.floor(data.quiz.status) - 1].index)}
            {data.questions[Math.floor(data.quiz.status) - 1].title}
          </div>
          {#each data.answers[Math.floor(data.quiz.status) - 1] as answer, n}
            <div class="flex flex-col gap-2">
              <button
                onclick={() => (!userAnswer ? (chosenAnswerID = answer.id) : null)}
                class="w-full rounded border border-blue-500 px-2 text-left"
                class:bg-blue-500={(userAnswer ?? chosenAnswerID) === answer.id}
              >
                <span>{String.fromCharCode(65 + n)}:</span>
                <span>{answer.title}</span>
              </button>
            </div>
          {/each}
          {#if !data.admin}
            <form
              action="?/answer"
              method="post"
              use:enhance
              class="w-fit self-end rounded bg-blue-500 px-2 text-white"
              class:opacity-80={!(userAnswer ?? chosenAnswerID) ||
                data.quiz.status % 1 !== 0 ||
                !!userAnswer}
            >
              <input type="hidden" name="chosenAnswerID" value={chosenAnswerID} />
              <input type="hidden" name="userID" value={data.userID} />
              <button
                disabled={!(userAnswer ?? chosenAnswerID) ||
                  data.quiz.status % 1 !== 0 ||
                  !!userAnswer}
                onclick={trigger}
              >
                Submit
              </button>
            </form>
          {/if}
        </div>
        <div class="flex flex-col gap-2 rounded bg-white p-2">
          {#each data.answers[Math.floor(data.quiz.status) - 1].sort((a, b) => b.participantIDs.length - a.participantIDs.length) as answer, n}
            <div
              style="--amount:{(answer.participantIDs.length /
                Math.max(data.quiz.participantIDs.length, 1)) *
                100}%"
              class="w-(--amount) rounded bg-gray-300 px-2 text-nowrap text-black"
            >
              {data.quiz.status % 1 === 0
                ? `?? ${answer.participantIDs.length}`
                : String.fromCharCode(65 + n)}
            </div>
          {/each}
        </div>
      </div>
    {/if}

    {#if data.admin}
      <div
        style="--col:{Math.min(data.questions.length + 2, 10)}"
        class="absolute bottom-0 grid translate-y-full grid-cols-[repeat(var(--col),1fr)] gap-2"
      >
        <form action="?/stop" method="post" use:enhance class="contents">
          <input type="hidden" name="quizCode" value={data.quiz.code} />
          <button onclick={trigger} class="aspect-square rounded-full bg-green-900 p-2">
            <X size={15}></X>
          </button>
          <button
            onclick={trigger}
            formaction="?/pause"
            class="aspect-square rounded-full bg-blue-900 p-2"
          >
            <Pause size={15}></Pause>
          </button>
        </form>
        {#each data.questions as question (question.id)}
          <form action="?/question" method="post" use:enhance class="contents">
            <input type="hidden" name="quizCode" value={data.quiz.code} />
            <input type="hidden" name="questionIND" value={question.index} />
            <button onclick={trigger} class="aspect-square rounded-full bg-white text-black">
              <div>{question.index}</div>
            </button>
          </form>
        {/each}
      </div>
    {/if}
  </div>

  <div class="mt-10 rounded-lg bg-white/10 md:mt-0 md:w-[20rem]">
    <h2 class="p-4 text-lg">Participants</h2>
    <div class="flex"></div>
  </div>
</div>
