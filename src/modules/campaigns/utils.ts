import { CampaignStatus } from "./types";

export const statusColors: Record<
	CampaignStatus,
	"default" | "primary" | "success" | "warning" | "error" | "info"
> = {
	draft: "default",
	scheduled: "warning", // Orange in Figma
	running: "info", // Blue/Light blue in Figma
	finished: "success", // Green in Figma
	cancelled: "error", // Red in Figma
};

export const getRecipientCount = (recipients: any[]): number => {
	// Sum up recipient counts
	return recipients.reduce((total, recipient) => {
		return total + (recipient.count || 0);
	}, 0);
};
