import { create } from "zustand";
import { Segment } from "../types";
import { getAllSegments } from "../service";

type SegmentState = {
	segments: Segment[];
	currentSegment: Segment | null;
	loading: boolean;
	error: string | null;
};

const segmentStore = create<SegmentState>(() => ({
	segments: [],
	currentSegment: null,
	loading: false,
	error: null,
}));

// --- Selectors ---
export const useSegments = () => segmentStore((s) => s.segments);
export const useCurrentSegment = () => segmentStore((s) => s.currentSegment);
export const useSegmentsLoading = () => segmentStore((s) => s.loading);
export const useSegmentsError = () => segmentStore((s) => s.error);

// --- Actions ---
export const setCurrentSegment = (segment: Segment | null) => {
	segmentStore.setState({ currentSegment: segment });
};

// --- API Actions ---
export const fetchSegments = async () => {
	try {
		segmentStore.setState({ loading: true, error: null });
		const res = await getAllSegments();
		segmentStore.setState({
			segments: res ?? [],
			loading: false,
		});
	} catch (err: any) {
		segmentStore.setState({
			error: err.message,
			loading: false,
		});
	}
};

export const createSegmentAction = async (
	segment: Omit<Segment, "id" | "createdAt" | "updatedAt" | "estimatedCount">,
): Promise<Segment> => {
	try {
		segmentStore.setState({ loading: true, error: null });
		const newSegment = await createSegmentAction(segment);
		segmentStore.setState((state) => ({
			segments: [newSegment, ...state.segments],
			loading: false,
		}));
		return newSegment;
	} catch (err: any) {
		segmentStore.setState({
			error: err.message,
			loading: false,
		});
		throw err;
	}
};

export const updateSegmentAction = async (
	id: string | number,
	segment: Partial<Omit<Segment, "id" | "createdAt" | "updatedAt">>,
): Promise<Segment> => {
	try {
		segmentStore.setState({ loading: true, error: null });
		const updatedSegment = await updateSegmentAction(id, segment);
		segmentStore.setState((state) => ({
			segments: state.segments.map((s) => (s.id === id ? updatedSegment : s)),
			currentSegment:
				state.currentSegment?.id === id ? updatedSegment : state.currentSegment,
			loading: false,
		}));
		return updatedSegment;
	} catch (err: any) {
		segmentStore.setState({
			error: err.message,
			loading: false,
		});
		throw err;
	}
};

export const deleteSegmentAction = async (
	id: string | number,
): Promise<void> => {
	try {
		segmentStore.setState({ loading: true, error: null });
		await deleteSegmentAction(id);
		segmentStore.setState((state) => ({
			segments: state.segments.filter((s) => s.id !== id),
			currentSegment:
				state.currentSegment?.id === id ? null : state.currentSegment,
			loading: false,
		}));
	} catch (err: any) {
		segmentStore.setState({
			error: err.message,
			loading: false,
		});
		throw err;
	}
};

export const calculateSegmentCountAction = async (
	id: string | number,
): Promise<number> => {
	try {
		const count = await calculateSegmentCountAction(id);
		segmentStore.setState((state) => ({
			segments: state.segments.map((s) =>
				s.id === id ? { ...s, estimatedCount: count } : s,
			),
			currentSegment:
				state.currentSegment?.id === id
					? { ...state.currentSegment, estimatedCount: count }
					: state.currentSegment,
		}));
		return count;
	} catch (err: any) {
		console.error("Error calculating segment count:", err);
		throw err;
	}
};
