import { ADMIN_PASSWORD, ADMIN_USERNAME } from "$env/static/private";
import { redirect, type Actions } from "@sveltejs/kit";
import { zfd } from "zod-form-data";

export const actions: Actions = {
  async login({ cookies, request }) {
    const schema = zfd.formData({ user: zfd.text(), pass: zfd.text() });
    const { user, pass } = schema.parse(await request.formData());

    if (user === ADMIN_USERNAME && pass === ADMIN_PASSWORD) {
      cookies.set("logged", pass, {
        path: "/",
        maxAge: 24 * 60 * 60,
        secure: import.meta.env.PROD,
      });
      redirect(303, "/");
    }
    return { success: false, message: "incorrect username or password" };
  },
  async logout({ cookies }) {
    cookies.delete("logged", { path: "/" });
    redirect(303, "/");
  },
};
