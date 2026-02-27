import { createProvider } from "./providers";
import { Contact } from "../contacts/types";
import { updateCampaign } from "../campaigns/service";

export async function sendCampaign(
	campaignId: string | number,
	html: string,
	contacts: Contact[]
): Promise<void> {
	const provider = createProvider("mock");
	const result = await provider.send(campaignId, html, contacts);

	// Update campaign stats
	await updateCampaign(campaignId, {
		status: "sending",
		stats: {
			sent: result.sent,
			opened: 0,
			clicked: 0,
			bounced: result.failed,
		},
	});
}
