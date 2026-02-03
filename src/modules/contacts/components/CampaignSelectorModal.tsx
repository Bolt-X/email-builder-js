import React, { useEffect, useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogTitle,
	IconButton,
	Box,
	Typography,
	List,
	ListItem,
	ListItemButton,
	ListItemIcon,
	ListItemText,
	Radio,
	Button,
	DialogActions,
	Chip,
	Stack,
} from "@mui/material";
import { CloseOutlined, CampaignOutlined } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { useGetAllCampaigns } from "../../../hooks/useCampaigns"; // Assuming this hook exists or similar
import { Campaign } from "../../campaigns/types";
// Alternatively, if hook not available, use store or service directly, but hook is cleaner if consistent.
// Re-using useGetAllCampaigns from CampaignListPage if it was exported, or creating local duplicate if needed.
// Checking previous responses, useGetAllCampaigns was used in CampaignListPage. (modules/campaigns/stores/campaign.metadata.store or hooks folder)
// Based on file structure in Step 20, hooks/useCampaigns existence is likely or check imported path in CampaignListPage.
// CampaignListPage imported from "../../../hooks/useCampaigns".

interface CampaignSelectorModalProps {
	open: boolean;
	onClose: () => void;
	onSelect: (campaignId: string) => void;
}

export default function CampaignSelectorModal({
	open,
	onClose,
	onSelect,
}: CampaignSelectorModalProps) {
	const { t } = useTranslation();
	const [selectedId, setSelectedId] = useState<string | null>(null);


	const { data: campaigns } = useGetAllCampaigns({
		status: ["draft", "scheduled"],
	});

	const handleConfirm = () => {
		if (selectedId) {
			onSelect(selectedId);
			onClose();
		}
	};

	return (
		<Dialog
			open={open}
			onClose={onClose}
			fullWidth
			maxWidth="sm"
		>
			<Box
				display="flex"
				justifyContent="space-between"
				alignItems="center"
				p={2}
				borderBottom="1px solid #e0e0e0"
			>
				<Typography variant="h6">
					{t("contacts.select_campaign") || "Select Campaign"}
				</Typography>
				<IconButton onClick={onClose}>
					<CloseOutlined />
				</IconButton>
			</Box>
			<DialogContent sx={{ p: 0, height: 400, overflow: "auto" }}>
				{campaigns && campaigns.length > 0 ? (
					<List>
						{campaigns.map((campaign: Campaign) => (
							<ListItem
								key={campaign.slug}
								disablePadding
							>
								<ListItemButton
									onClick={() => setSelectedId(campaign.slug)}
									selected={selectedId === campaign.slug}
								>
									<ListItemIcon>
										<Radio
											checked={selectedId === campaign.slug}
											onChange={() => setSelectedId(campaign.slug)}
											value={campaign.slug}
										/>
									</ListItemIcon>
									<ListItemText
										primary={campaign.name}
										secondary={campaign.subject || t("campaigns.no_subject")}
									/>
									<Chip
										label={t(`campaigns.status.${campaign.status}`)}
										size="small"
									/>
								</ListItemButton>
							</ListItem>
						))}
					</List>
				) : (
					<Box
						p={4}
						textAlign="center"
					>
						<Typography color="text.secondary">
							{t("campaigns.no_campaigns") || "No campaigns found"}
						</Typography>
					</Box>
				)}
			</DialogContent>
			<DialogActions sx={{ p: 2, borderTop: "1px solid #e0e0e0" }}>
				<Button
					onClick={onClose}
					color="inherit"
				>
					{t("common.cancel")}
				</Button>
				<Button
					variant="contained"
					onClick={handleConfirm}
					disabled={!selectedId}
				>
					{t("common.confirm") || "Confirm"}
				</Button>
			</DialogActions>
		</Dialog>
	);
}
