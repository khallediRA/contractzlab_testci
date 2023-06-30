export type IOpenAIResponseLog = {
	id?: string;
	user?: string;
	object?: string;
	created?: Date;
	model?: string;
	prompt_tokens?: number;
	completion_tokens?: number;
	total_tokens?: number;
	role?: string;
	content?: string;
	index?: number;
	finish_reason?: string;
	createdAt?: Date;
	updatedAt?: Date;

}
export const keysofIOpenAIResponseLog: (keyof IOpenAIResponseLog)[] = ["id", "user", "object", "created", "model", "prompt_tokens", "completion_tokens", "total_tokens", "role", "content", "index", "finish_reason", "createdAt", "updatedAt"]
