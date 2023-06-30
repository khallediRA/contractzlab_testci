export interface IOpenAIResponseLog {
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
