export type IStripeChargeRecord = {
	id?: string;
	status?: 'failed' | 'pending' | 'succeeded';
	amount?: number;
	description?: string;
	createdAt?: Date;
	updatedAt?: Date;

}
export const keysofIStripeChargeRecord: (keyof IStripeChargeRecord)[] = ["id", "status", "amount", "description", "createdAt", "updatedAt"]
