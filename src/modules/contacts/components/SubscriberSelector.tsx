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
import {
	useContactLists,
	fetchContactLists,
} from "../stores/contactList.store";
import { useSegments, fetchSegments } from "../stores/segment.store";
import { SubscriberSelection, SubscriberType } from "../../campaigns/types";

interface SubscriberSelectorProps {
	value: SubscriberSelection[];
	onChange: (subscribers: SubscriberSelection[]) => void;
	required?: boolean;
}

export default function SubscriberSelector({
	value,
	onChange,
	required = false,
}: SubscriberSelectorProps) {
	const contactLists = useContactLists();
	const segments = useSegments();

	useEffect(() => {
		fetchContactLists();
		fetchSegments();
	}, []);

	// Track if we have already auto-selected
	const hasAutoSelected = React.useRef(false);

	// Auto-select default list
	useEffect(() => {
		if (
			!hasAutoSelected.current &&
			value.length === 0 &&
			contactLists.length > 0
		) {
			const defaultList = contactLists.find((l) => l.is_default);
			if (defaultList) {
				const newSubscriber: SubscriberSelection = {
					id: defaultList.slug,
					type: "list",
					name: defaultList.name,
					count: defaultList.contactCount,
				};
				onChange([newSubscriber]);
				hasAutoSelected.current = true;
			}
		}
	}, [contactLists, value, onChange]);

	const handleAddList = (slug: string) => {
		const list = contactLists.find((l) => l.slug === slug);
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
		const segment = segments.find((s) => s.id === segmentId);
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
	const enabledLists = contactLists.filter(
		(list) => list.status === "published",
	);

	const availableLists = enabledLists.filter(
		(list) => !value.find((r) => r.id === list.slug && r.type === "list"),
	);

	const availableSegments = segments.filter(
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
					{/* <InputLabel>Add Contact List</InputLabel> */}
					<Select
						value=""
						// label="Add Contact List"
						onChange={(e) => handleAddList(e.target.value)}
						displayEmpty
						size="small"
					>
						{availableLists.length === 0 ? (
							<MenuItem
								disabled
								value=""
							>
								<ListItemText primary="No available lists" />
							</MenuItem>
						) : (
							availableLists.map((list) => (
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
														label="Default"
														size="small"
														color="info"
														variant="outlined"
														sx={{ height: 20, fontSize: "0.65rem" }}
													/>
												)}
											</Stack>
										}
										secondary={`${list.contactCount} subscribers`}
									/>
								</MenuItem>
							))
						)}
					</Select>
				</FormControl>

				{/* Segment Selector */}
				<FormControl fullWidth>
					<InputLabel>Add Segment</InputLabel>
					<Select
						value=""
						label="Add Segment"
						onChange={(e) => handleAddSegment(e.target.value)}
						displayEmpty
						size="small"
					>
						{availableSegments.length === 0 ? (
							<MenuItem
								disabled
								value=""
							>
								<ListItemText primary="No available segments" />
							</MenuItem>
						) : (
							availableSegments.map((segment) => (
								<MenuItem
									key={segment.id}
									value={segment.id}
								>
									<ListItemText
										primary={segment.name}
										secondary={`${segment.estimatedCount || 0} estimated subscribers`}
									/>
								</MenuItem>
							))
						)}
					</Select>
				</FormControl>
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
											label={subscriber.type === "list" ? "List" : "Segment"}
											size="small"
											variant="outlined"
										/>
										{subscriber.type === "list" &&
											contactLists.find((l) => l.slug === subscriber.id)
												?.is_default && (
												<Chip
													label="Default"
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
											{subscriber.count} subscribers
										</Typography>
									)}
								</Stack>
								<Button
									size="small"
									onClick={() => handleRemove(subscriber.id, subscriber.type)}
								>
									Remove
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
					Total subscribers: {value.reduce((sum, r) => sum + (r.count || 0), 0)}
				</Typography>
			)}
		</Stack>
	);
}
