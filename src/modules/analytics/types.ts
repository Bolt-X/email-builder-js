export interface CampaignStats {
	campaignId: string | number;
	sent: number;
	opened: number;
	clicked: number;
	bounced: number;
	openRate: number;
	clickRate: number;
}
