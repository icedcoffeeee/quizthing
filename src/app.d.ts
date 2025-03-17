// See https://svelte.dev/docs/kit/types#app.d.ts

import type { z } from "zod";
import type { subjects } from "./auth";

// for information about these interfaces
declare global {
  namespace App {
    // interface Error {}
    interface Locals {
      user?: z.infer<typeof subjects.user>;
    }
    // interface PageData {}
    // interface PageState {}
    // interface Platform {}
  }
}

export {};
