import React, { useEffect, useState } from "react";
import {
	Box,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	Typography,
	Stack,
	Button,
	Chip,
	Paper,
	ListItemText,
} from "@mui/material";
import { People, FilterList } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import {
	useContactLists,
	fetchContactLists,
} from "../stores/contactList.store";
import { useSegments, fetchSegments } from "../stores/segment.store";
import { SubscriberSelection, SubscriberType } from "../../campaigns/types";
import { useGetAllContactLists } from "../../../hooks/useContactLists";
import { UseFormReturn } from "react-hook-form";

interface SubscriberSelectorProps {
	value: SubscriberSelection[];
	onChange: (subscribers: SubscriberSelection[]) => void;
	required?: boolean;
	form?: UseFormReturn<any>;
}

export default function SubscriberSelector({
	value,
	onChange,
	required = false,
	form = null,
}: SubscriberSelectorProps) {
	const { t } = useTranslation();
	// const contactLists = useContactLists();
	const segments = useSegments();

	const { data: contactLists } = useGetAllContactLists();

	useEffect(() => {
		fetchSegments();
	}, []);

	// Sync subscriber counts with latest data
	useEffect(() => {
		if (value.length === 0) return;

		let hasChanges = false;
		const newValue = value.map((sub) => {
			let currentCount = sub.count;
			if (sub.type === "list") {
				const list = contactLists?.find((l) => l.slug === sub.id);
				if (list && list.contactCount !== undefined) {
					currentCount = list.contactCount;
				}
			} else if (sub.type === "segment") {
				// eslint-disable-next-line
				const segment = segments?.find((s) => s.id == sub.id);
				if (segment && segment.estimatedCount !== undefined) {
					currentCount = segment.estimatedCount;
				}
			}

			if (currentCount !== sub.count) {
				hasChanges = true;
				return { ...sub, count: currentCount };
			}
			return sub;
		});

		if (hasChanges) {
			onChange(newValue);
		}
	}, [contactLists, segments, value, onChange]);

	const handleAddList = (slug: string) => {
		const list = contactLists?.find((l) => l.slug === slug);
		if (list && !value.find((r) => r.id === slug && r.type === "list")) {
			const newSubscriber: SubscriberSelection = {
				id: slug,
				type: "list",
				name: list.name,
				count: list.contactCount,
			};
			onChange([...value, newSubscriber]);
		}
	};

	const handleAddSegment = (segmentId: string | number) => {
		const segment = segments?.find((s) => s.id === segmentId);
		if (
			segment &&
			!value.find((r) => r.id === segmentId && r.type === "segment")
		) {
			const newSubscriber: SubscriberSelection = {
				id: segmentId,
				type: "segment",
				name: segment.name,
				count: segment.estimatedCount || 0,
			};
			onChange([...value, newSubscriber]);
		}
	};

	const handleRemove = (id: string | number, type: SubscriberType) => {
		onChange(value.filter((r) => !(r.id === id && r.type === type)));
	};

	// Filter out disabled lists
	const enabledLists = contactLists?.filter(
		(list) => list.status === "published",
	);

	const availableLists = enabledLists?.filter(
		(list) => !value.find((r) => r.id === list.slug && r.type === "list"),
	);

	const availableSegments = segments?.filter(
		(segment) =>
			!value.find((r) => r.id === segment.id && r.type === "segment"),
	);

	return (
		<Stack spacing={3}>
			<Stack
				direction={{ xs: "column", sm: "row" }}
				spacing={2}
			>
				{/* List Selector */}
				<FormControl fullWidth>
					<InputLabel>{t("contacts.add_contact_list")}</InputLabel>
					<Select
						{...form?.register("subscribers")}
						label={t("contacts.add_contact_list")}
						{...form?.register("subscribers")}
						error={!!form?.formState.errors.subscribers}
						displayEmpty
						size="small"
						sx={{
							minHeight: 46,
						}}
					>
						{availableLists?.length === 0 ? (
							<MenuItem
								disabled
								value=""
							>
								<ListItemText primary={t("contacts.no_available_lists")} />
							</MenuItem>
						) : (
							availableLists?.map((list) => (
								<MenuItem
									key={list.slug}
									value={list.slug}
								>
									<ListItemText
										primary={
											<Stack
												direction="row"
												alignItems="center"
												spacing={1}
											>
												<Typography>{list.name}</Typography>
												{list.is_default && (
													<Chip
														label={t("contacts.default")}
														size="small"
														color="info"
														variant="outlined"
														sx={{ height: 20, fontSize: "0.65rem" }}
													/>
												)}
											</Stack>
										}
										secondary={`${list.contactCount} ${t("contacts.subscribers")}`}
									/>
								</MenuItem>
							))
						)}
					</Select>
				</FormControl>

				{/* Segment Selector */}
				{/* <FormControl fullWidth>
					<InputLabel>{t("contacts.add_segment")}</InputLabel>
					<Select
						value=""
						label={t("contacts.add_segment")}
						onChange={(e) => handleAddSegment(e.target.value)}
						displayEmpty
						size="small"
						sx={{
							minHeight: 46,
						}}
					>
						{availableSegments?.length === 0 ? (
							<MenuItem
								disabled
								value=""
							>
								<ListItemText primary={t("contacts.no_available_segments")} />
							</MenuItem>
						) : (
							availableSegments?.map((segment) => (
								<MenuItem
									key={segment.id}
									value={segment.id}
								>
									<ListItemText
										primary={segment.name}
										secondary={`${segment.estimatedCount || 0} ${t("contacts.estimated_subscribers")}`}
									/>
								</MenuItem>
							))
						)}
					</Select>
				</FormControl> */}
			</Stack>

			{/* Selected Subscribers */}
			{value.length > 0 && (
				<Stack spacing={1}>
					{value.map((subscriber) => (
						<Paper
							key={`${subscriber.type}-${subscriber.id}`}
							variant="outlined"
							sx={{ p: 1.5 }}
						>
							<Stack
								direction="row"
								justifyContent="space-between"
								alignItems="center"
							>
								<Stack spacing={0.5}>
									<Stack
										direction="row"
										alignItems="center"
										spacing={1}
									>
										{subscriber.type === "list" ? (
											<People
												fontSize="small"
												color="primary"
											/>
										) : (
											<FilterList
												fontSize="small"
												color="secondary"
											/>
										)}
										<Typography
											variant="body2"
											fontWeight="medium"
										>
											{subscriber.name}
										</Typography>
										<Chip
											label={
												subscriber.type === "list"
													? t("contacts.list_type")
													: t("contacts.segment_type")
											}
											size="small"
											variant="outlined"
										/>
										{subscriber.type === "list" &&
											contactLists?.find((l) => l.slug === subscriber.id)
												?.is_default && (
												<Chip
													label={t("contacts.default")}
													size="small"
													color="info"
													variant="filled"
													sx={{ height: 24 }}
												/>
											)}
									</Stack>
									{subscriber.count !== undefined && (
										<Typography
											variant="caption"
											color="text.secondary"
										>
											{subscriber.count} {t("contacts.subscribers")}
										</Typography>
									)}
								</Stack>
								<Button
									size="small"
									onClick={() => handleRemove(subscriber.id, subscriber.type)}
								>
									{t("contacts.remove")}
								</Button>
							</Stack>
						</Paper>
					))}
				</Stack>
			)}

			{/* Total Subscribers */}
			{value.length > 0 && (
				<Typography
					variant="body2"
					color="primary"
				>
					{t("contacts.total_subscribers")}:{" "}
					{value.reduce((sum, r) => sum + (r.count || 0), 0)}
				</Typography>
			)}
		</Stack>
	);
}
