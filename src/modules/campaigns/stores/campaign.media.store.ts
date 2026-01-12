import { create } from "zustand";
import { Media } from "../../media/types";
import { getMediaByCampaign, uploadMedia, deleteMedia } from "../../media/service";

/**
 * Campaign Media Store
 * Manages media library for a specific campaign.
 * Each campaign has its own media library (not global).
 */
type CampaignMediaState = {
	campaignId: string | number | null;
	media: Media[];
	loading: boolean;
	error: string | null;
};

const campaignMediaStore = create<CampaignMediaState>(() => ({
	campaignId: null,
	media: [],
	loading: false,
	error: null,
}));

// --- Selectors ---
export const useCampaignMedia = () => campaignMediaStore((s) => s.media);
export const useCampaignMediaLoading = () =>
	campaignMediaStore((s) => s.loading);
export const useCampaignMediaError = () => campaignMediaStore((s) => s.error);

// --- Actions ---
export const setCampaignMedia = (campaignId: string | number | null) => {
	campaignMediaStore.setState({ campaignId });
};

/**
 * Fetch media for a campaign
 */
export const fetchCampaignMedia = async (
	campaignId: string | number
): Promise<Media[]> => {
	try {
		campaignMediaStore.setState({ loading: true, error: null });
		const media = await getMediaByCampaign(campaignId);
		campaignMediaStore.setState({
			campaignId,
			media: media ?? [],
			loading: false,
		});
		return media;
	} catch (err: any) {
		campaignMediaStore.setState({
			error: err.message,
			loading: false,
		});
		throw err;
	}
};

/**
 * Upload media for a campaign
 */
export const uploadCampaignMedia = async (
	campaignId: string | number,
	file: File
): Promise<Media> => {
	try {
		campaignMediaStore.setState({ loading: true, error: null });
		const newMedia = await uploadMedia(campaignId, file);
		campaignMediaStore.setState((state) => ({
			media: [newMedia, ...state.media],
			loading: false,
		}));
		return newMedia;
	} catch (err: any) {
		campaignMediaStore.setState({
			error: err.message,
			loading: false,
		});
		throw err;
	}
};

/**
 * Delete media from campaign
 */
export const deleteCampaignMedia = async (
	mediaId: string | number
): Promise<void> => {
	try {
		campaignMediaStore.setState({ loading: true, error: null });
		await deleteMedia(mediaId);
		campaignMediaStore.setState((state) => ({
			media: state.media.filter((m) => m.id !== mediaId),
			loading: false,
		}));
	} catch (err: any) {
		campaignMediaStore.setState({
			error: err.message,
			loading: false,
		});
		throw err;
	}
};

/**
 * Reset media store
 */
export const resetCampaignMedia = () => {
	campaignMediaStore.setState({
		campaignId: null,
		media: [],
		loading: false,
		error: null,
	});
};
