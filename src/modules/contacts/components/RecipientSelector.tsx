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
	Checkbox,
	ListItemText,
} from "@mui/material";
import { Add, People, FilterList } from "@mui/icons-material";
import {
	useContactLists,
	fetchContactLists,
} from "../stores/contactList.store";
import { useSegments, fetchSegments } from "../stores/segment.store";
import { ContactList } from "../types";
import { Recipient, RecipientType } from "../../campaigns/types";

interface RecipientSelectorProps {
	value: Recipient[];
	onChange: (recipients: Recipient[]) => void;
	required?: boolean;
}

export default function RecipientSelector({
	value,
	onChange,
	required = false,
}: RecipientSelectorProps) {
	const contactLists = useContactLists();
	const segments = useSegments();
	const [listSelectorOpen, setListSelectorOpen] = useState(false);
	const [segmentSelectorOpen, setSegmentSelectorOpen] = useState(false);

	useEffect(() => {
		fetchContactLists();
		fetchSegments();
	}, []);

	const handleAddList = (slug: string) => {
		const list = contactLists.find((l) => l.slug === slug);
		if (list && !value.find((r) => r.id === slug && r.type === "list")) {
			const newRecipient: Recipient = {
				id: slug,
				type: "list",
				name: list.name,
				count: list.contactCount,
			};
			onChange([...value, newRecipient]);
		}
		setListSelectorOpen(false);
	};

	const handleAddSegment = (segmentId: string | number) => {
		const segment = segments.find((s) => s.id === segmentId);
		if (
			segment &&
			!value.find((r) => r.id === segmentId && r.type === "segment")
		) {
			const newRecipient: Recipient = {
				id: segmentId,
				type: "segment",
				name: segment.name,
				count: segment.estimatedCount || 0,
			};
			onChange([...value, newRecipient]);
		}
		setSegmentSelectorOpen(false);
	};

	const handleRemove = (id: string | number, type: RecipientType) => {
		onChange(value.filter((r) => !(r.id === id && r.type === type)));
	};

	// Filter out disabled lists
	const enabledLists = contactLists.filter(
		(list) => list.status === "published",
	);

	return (
		<Stack spacing={2}>
			<Stack
				direction="row"
				spacing={1}
			>
				<Button
					size="small"
					startIcon={<People />}
					onClick={() => setListSelectorOpen(true)}
					variant="outlined"
				>
					Add list
				</Button>
				<Button
					size="small"
					startIcon={<FilterList />}
					onClick={() => setSegmentSelectorOpen(true)}
					variant="outlined"
				>
					Add segment
				</Button>
			</Stack>

			{/* Selected Recipients */}
			{value.length > 0 && (
				<Stack spacing={1}>
					{value.map((recipient) => (
						<Paper
							key={`${recipient.type}-${recipient.id}`}
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
										{recipient.type === "list" ? (
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
											{recipient.name}
										</Typography>
										<Chip
											label={recipient.type === "list" ? "List" : "Segment"}
											size="small"
											variant="outlined"
										/>
									</Stack>
									{recipient.count !== undefined && (
										<Typography
											variant="caption"
											color="text.secondary"
										>
											{recipient.count} recipients
										</Typography>
									)}
								</Stack>
								<Button
									size="small"
									onClick={() => handleRemove(recipient.id, recipient.type)}
								>
									Remove
								</Button>
							</Stack>
						</Paper>
					))}
				</Stack>
			)}

			{/* Total Recipients */}
			{value.length > 0 && (
				<Typography
					variant="body2"
					color="primary"
				>
					Total recipients: {value.reduce((sum, r) => sum + (r.count || 0), 0)}
				</Typography>
			)}

			{/* List Selector Dialog */}
			{listSelectorOpen && (
				<Paper
					variant="outlined"
					sx={{ p: 2, mt: 1 }}
				>
					<Typography
						variant="subtitle2"
						mb={1}
					>
						Select Contact Lists
					</Typography>
					<FormControl fullWidth>
						<Select
							value=""
							onChange={(e) => handleAddList(e.target.value)}
							displayEmpty
						>
							<MenuItem
								value=""
								disabled
							>
								Select a list
							</MenuItem>
							{enabledLists
								.filter(
									(list) =>
										!value.find((r) => r.id === list.slug && r.type === "list"),
								)
								.map((list) => (
									<MenuItem
										key={list.slug}
										value={list.slug}
									>
										<ListItemText
											primary={list.name}
											secondary={`${list.contactCount} contacts`}
										/>
									</MenuItem>
								))}
						</Select>
					</FormControl>
					<Button
						size="small"
						onClick={() => setListSelectorOpen(false)}
						sx={{ mt: 1 }}
					>
						Cancel
					</Button>
				</Paper>
			)}

			{/* Segment Selector Dialog */}
			{segmentSelectorOpen && (
				<Paper
					variant="outlined"
					sx={{ p: 2, mt: 1 }}
				>
					<Typography
						variant="subtitle2"
						mb={1}
					>
						Select Segments
					</Typography>
					<FormControl fullWidth>
						<Select
							value=""
							onChange={(e) => handleAddSegment(e.target.value)}
							displayEmpty
						>
							<MenuItem
								value=""
								disabled
							>
								Select a segment
							</MenuItem>
							{segments
								.filter(
									(segment) =>
										!value.find(
											(r) => r.id === segment.id && r.type === "segment",
										),
								)
								.map((segment) => (
									<MenuItem
										key={segment.id}
										value={segment.id}
									>
										<ListItemText
											primary={segment.name}
											secondary={`${segment.estimatedCount || 0} estimated contacts`}
										/>
									</MenuItem>
								))}
						</Select>
					</FormControl>
					<Button
						size="small"
						onClick={() => setSegmentSelectorOpen(false)}
						sx={{ mt: 1 }}
					>
						Cancel
					</Button>
				</Paper>
			)}
		</Stack>
	);
}
