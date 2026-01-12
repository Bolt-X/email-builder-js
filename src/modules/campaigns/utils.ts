import { CampaignStatus } from "./types";

export const statusColors: Record<
	CampaignStatus,
	"default" | "primary" | "success" | "warning" | "error"
> = {
	draft: "default",
	scheduled: "primary",
	sending: "warning",
	completed: "success",
	cancelled: "error",
};

export const getRecipientCount = (recipients: any[]): number => {
	// Sum up recipient counts
	return recipients.reduce((total, recipient) => {
		return total + (recipient.count || 0);
	}, 0);
};
