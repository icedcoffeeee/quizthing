import { redirect, type Actions } from '@sveltejs/kit';

export const actions: Actions = {
	async default({ request }) {
		const { quizCode } = Object.fromEntries(await request.formData()) as any;
		if (quizCode) redirect(303, quizCode);
	}
};
