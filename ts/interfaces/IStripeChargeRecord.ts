export interface IStripeChargeRecord {
	id?: string;
	status?: 'failed' | 'pending' | 'succeeded';
	amount?: number;
	description?: string;
	createdAt?: Date;
	updatedAt?: Date;

}
