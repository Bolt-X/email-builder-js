import { EmailProvider, SendResult } from "../types";
import { Contact } from "../../contacts/types";

export class MockProvider implements EmailProvider {
	async send(
		campaignId: string | number,
		html: string,
		contacts: Contact[]
	): Promise<SendResult> {
		// Simulate sending with delay
		await new Promise((resolve) => setTimeout(resolve, 2000 + Math.random() * 3000));

		const sent = Math.floor(contacts.length * 0.9); // 90% success rate
		const failed = contacts.length - sent;
		const errors = failed > 0 ? ["Some emails failed to send"] : undefined;

		return {
			success: failed === 0,
			sent,
			failed,
			errors,
		};
	}
}
