import React, { useEffect } from "react";
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
} from "@mui/material";
import { Add, People } from "@mui/icons-material";
import {
	useContactLists,
	fetchContactLists,
	useContactsLoading,
} from "../store";
import { ContactList } from "../types";

interface ContactListSelectorProps {
	value: string | null;
	onChange: (contactListSlug: string | null) => void;
	required?: boolean;
	showCreateButton?: boolean;
	onCreateNew?: () => void;
}

export default function ContactListSelector({
	value,
	onChange,
	required = false,
	showCreateButton = false,
	onCreateNew,
}: ContactListSelectorProps) {
	const contactLists = useContactLists();
	const loading = useContactsLoading();

	useEffect(() => {
		fetchContactLists();
	}, []);

	const selectedList = contactLists.find((list) => list.slug === value);

	return (
		<Stack spacing={2}>
			<FormControl
				fullWidth
				required={required}
			>
				<InputLabel>Contact List</InputLabel>
				<Select
					value={value || ""}
					onChange={(e) => onChange(e.target.value as string)}
					label="Contact List"
					disabled={loading}
				>
					{contactLists.map((list) => (
						<MenuItem
							key={list.slug}
							value={list.slug}
						>
							<Stack
								direction="row"
								justifyContent="space-between"
								alignItems="center"
								width="100%"
							>
								<Box>
									<Typography variant="body1">{list.name}</Typography>
								</Box>
								<Chip
									label={`${list.subscribers?.length || 0} contacts`}
									size="small"
									variant="outlined"
									sx={{ ml: 2 }}
								/>
							</Stack>
						</MenuItem>
					))}
					{contactLists.length === 0 && !loading && (
						<MenuItem disabled>No contact lists available</MenuItem>
					)}
				</Select>
			</FormControl>

			{/* Selected Contact List Info */}
			{selectedList && (
				<Paper
					variant="outlined"
					sx={{ p: 2, bgcolor: "grey.50" }}
				>
					<Stack
						direction="row"
						alignItems="center"
						spacing={1}
						mb={1}
					>
						<People
							fontSize="small"
							color="primary"
						/>
						<Typography variant="subtitle2">{selectedList.name}</Typography>
					</Stack>
					<Typography
						variant="caption"
						color="text.secondary"
					>
						{selectedList.subscribers?.length || 0} contacts in this list
					</Typography>
				</Paper>
			)}

			{/* Create New Contact List Button */}
			{showCreateButton && onCreateNew && (
				<Button
					variant="outlined"
					startIcon={<Add />}
					onClick={onCreateNew}
					fullWidth
				>
					Create New Contact List
				</Button>
			)}
		</Stack>
	);
}
