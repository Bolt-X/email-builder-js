import { Contact } from "../contacts/types";

export interface EmailProvider {
	send(
		campaignId: string | number,
		html: string,
		contacts: Contact[]
	): Promise<SendResult>;
}

export interface SendResult {
	success: boolean;
	sent: number;
	failed: number;
	errors?: string[];
}
