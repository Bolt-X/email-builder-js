import { create } from "zustand";
import { Media } from "./types";
import { getMediaByCampaign, uploadMedia } from "./service";

type MediaState = {
	media: Media[];
	selectedMedia: Media | null;
	loading: boolean;
	error: string | null;
};

const mediaStore = create<MediaState>(() => ({
	media: [],
	selectedMedia: null,
	loading: false,
	error: null,
}));

export const useMedia = () => mediaStore((s) => s.media);
export const useMediaLoading = () => mediaStore((s) => s.loading);
export const useSelectedMedia = () => mediaStore((s) => s.selectedMedia);

export const fetchMediaByCampaign = async (campaignId: string | number) => {
	try {
		mediaStore.setState({ loading: true, error: null });
		const res = await getMediaByCampaign(campaignId);
		mediaStore.setState({
			media: res ?? [],
			loading: false,
		});
	} catch (err: any) {
		mediaStore.setState({
			error: err.message,
			loading: false,
		});
	}
};

export const uploadMediaAction = async (
	campaignId: string | number,
	file: File
): Promise<Media> => {
	try {
		mediaStore.setState({ loading: true, error: null });
		const newMedia = await uploadMedia(campaignId, file);
		mediaStore.setState((state) => ({
			media: [newMedia, ...state.media],
			loading: false,
		}));
		return newMedia;
	} catch (err: any) {
		mediaStore.setState({
			error: err.message,
			loading: false,
		});
		throw err;
	}
};

export const setSelectedMedia = (media: Media | null) => {
	mediaStore.setState({ selectedMedia: media });
};
