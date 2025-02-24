<script lang="ts">
  import type { Answers } from "$lib/server/db";
  import { Pause, X } from "lucide-svelte";
  import { enhance } from "$app/forms";
  import { invalidateAll } from "$app/navigation";
  import { io } from "socket.io-client";

  const { data } = $props();
  const { quiz, questions, answers, participants, userAnswers, admin, userID } = $derived(data);
  const questionIND = $derived(Math.floor(quiz.status) - 1);
  const question: (typeof questions)[number] | undefined = $derived(questions[questionIND]);
  const shown = $derived(quiz.status % 1 !== 0);

  const socket = io();
  socket.on("db-updated", () => {
    invalidateAll();
  });
  const trigger = () => {
    socket.emit("update-db");
  };
  let userAnswer = $derived(userAnswers ? userAnswers[questionIND] : undefined);
  let chosenAnswerID = $state(0);
</script>

<div class="mb-5 flex items-baseline gap-5 pt-15">
  <h1 class="min-w-2rem text-2xl">
    {quiz.name}
  </h1>
  <span class="w-fit rounded bg-blue-900 px-1">{quiz.code}</span>
</div>

<div class="flex h-[70lvh] w-full flex-col gap-4 md:flex-row">
  <div class="relative flex h-full grow flex-col items-center justify-center">
    {#if quiz.status <= 0}
      <p class="animate-pulse">waiting for the host...</p>
    {:else}
      <div class="grid w-full max-w-md gap-5">
        <div class="flex flex-col gap-2 rounded bg-white p-4 text-lg text-black">
          <div class="mb-5">
            {Math.floor(questions[questionIND].index)}
            {questions[questionIND].title}
          </div>
          {#each answers[questionIND] as answer, n}
            <div class="flex flex-col gap-2">
              <button
                onclick={() => (!userAnswer ? (chosenAnswerID = answer.id) : null)}
                class="w-full rounded border border-blue-500 px-2 text-left
                data-[chosen=true]:bg-blue-500
                data-[correct=true]:border-green-400 data-[correct=true]:bg-green-400"
                data-correct={answer.id === question?.correctID && shown}
                data-chosen={answer.id === (userAnswer ?? chosenAnswerID)}
              >
                <span>{String.fromCharCode(65 + n)}:</span>
                <span>{answer.title}</span>
              </button>
            </div>
          {/each}
          {#if userID}
            <form
              action="?/answer"
              method="post"
              use:enhance
              class="w-fit self-end rounded bg-blue-500 px-2 text-white"
              class:opacity-80={!(userAnswer ?? chosenAnswerID) || shown || !!userAnswer}
            >
              <input type="hidden" name="chosenAnswerID" value={chosenAnswerID} />
              <input type="hidden" name="correctID" value={question?.correctID} />
              <input type="hidden" name="userID" value={userID} />
              <button
                disabled={!(userAnswer ?? chosenAnswerID) || shown || !!userAnswer}
                onclick={trigger}
              >
                Submit
              </button>
            </form>
          {/if}
        </div>
        <div class="flex flex-col gap-2 rounded bg-white p-2">
          {#each answers[questionIND]
            .map<[Answers, number]>((a, i) => [a, i])
            .sort((a, b) => (b[0].participantIDs?.length ?? 0) - (a[0].participantIDs?.length ?? 0)) as [answer, ind]}
            <div
              style="--amount:{((answer.participantIDs?.length ?? 0) /
                Math.max(quiz.participantIDs.length, 1)) *
                100}%"
              class="w-(--amount) rounded {shown && questions[questionIND].correctID === answer.id
                ? 'bg-green-400'
                : 'bg-gray-300'} px-2 text-nowrap text-black"
            >
              {!shown ? `??` : String.fromCharCode(65 + ind)}
              {answer.participantIDs?.length ?? 0}
            </div>
          {/each}
        </div>
      </div>
    {/if}

    {#if admin}
      <div
        style="--col:{Math.min(questions.length + 2, 10)}"
        class="absolute bottom-0 grid translate-y-full grid-cols-[repeat(var(--col),1fr)] gap-2"
      >
        <form action="?/stop" method="post" use:enhance class="contents">
          <input type="hidden" name="quizCode" value={quiz.code} />
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
        {#each questions as question (question.id)}
          <form action="?/question" method="post" use:enhance class="contents">
            <input type="hidden" name="quizCode" value={quiz.code} />
            <input type="hidden" name="questionIND" value={question.index} />
            <button onclick={trigger} class="aspect-square rounded-full bg-white text-black">
              <div>{question.index}</div>
            </button>
          </form>
        {/each}
      </div>
    {/if}
  </div>

  <div class="mt-10 rounded-lg bg-white/10 p-4 md:mt-0 md:w-[20rem]">
    <h2 class="mb-4 text-lg">Participants</h2>
    <div class="flex flex-col">
      {#each participants as participant}
        <p
          data-chosen={shown &&
            answers[questionIND]
              .find((a) => a.id === question?.correctID)
              ?.participantIDs.includes(participant.id)}
          class="data-[chosen=true]:text-green-400"
        >
          {participant.name} - {participant.correct}
        </p>
      {/each}
    </div>
  </div>
</div>
