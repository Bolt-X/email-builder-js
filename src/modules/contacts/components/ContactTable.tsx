import React, { useState } from "react";
import {
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Paper,
	Chip,
	IconButton,
	Menu,
	MenuItem,
	Checkbox,
} from "@mui/material";
import {
	MoreVert,
	Edit,
	Delete,
	Email,
} from "@mui/icons-material";
import { Contact, ContactStatus } from "../types";

interface ContactTableProps {
	contacts: Contact[];
	onSelect?: (contactIds: (string | number)[]) => void;
	selectable?: boolean;
}

const statusColors: Record<ContactStatus, "default" | "success" | "error"> = {
	subscribed: "success",
	unsubscribed: "error",
};

export default function ContactTable({
	contacts,
	onSelect,
	selectable = false,
}: ContactTableProps) {
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const [selectedId, setSelectedId] = useState<string | number | null>(null);
	const [selectedContacts, setSelectedContacts] = useState<
		(string | number)[]
	>([]);

	const handleMenuOpen = (
		event: React.MouseEvent<HTMLElement>,
		id: string | number
	) => {
		setAnchorEl(event.currentTarget);
		setSelectedId(id);
	};

	const handleMenuClose = () => {
		setAnchorEl(null);
		setSelectedId(null);
	};

	const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
		if (event.target.checked) {
			const allIds = contacts.map((c) => c.id);
			setSelectedContacts(allIds);
			onSelect?.(allIds);
		} else {
			setSelectedContacts([]);
			onSelect?.([]);
		}
	};

	const handleSelectOne = (
		event: React.ChangeEvent<HTMLInputElement>,
		id: string | number
	) => {
		if (event.target.checked) {
			const newSelected = [...selectedContacts, id];
			setSelectedContacts(newSelected);
			onSelect?.(newSelected);
		} else {
			const newSelected = selectedContacts.filter((cId) => cId !== id);
			setSelectedContacts(newSelected);
			onSelect?.(newSelected);
		}
	};

	const handleEdit = () => {
		// TODO: Open edit dialog
		handleMenuClose();
	};

	const handleDelete = () => {
		if (selectedId) {
			if (
				window.confirm(
					"Are you sure you want to delete this contact? This action cannot be undone."
				)
			) {
				// TODO: Implement delete
				console.log("Delete contact:", selectedId);
			}
			handleMenuClose();
		}
	};

	if (contacts.length === 0) {
		return (
			<Paper sx={{ p: 4, textAlign: "center" }}>
				<Email sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
				<Typography variant="h6" color="text.secondary">
					No contacts in this list
				</Typography>
			</Paper>
		);
	}

	return (
		<>
			<TableContainer component={Paper}>
				<Table>
					<TableHead>
						<TableRow>
							{selectable && (
								<TableCell padding="checkbox">
									<Checkbox
										indeterminate={
											selectedContacts.length > 0 &&
											selectedContacts.length < contacts.length
										}
										checked={
											contacts.length > 0 &&
											selectedContacts.length === contacts.length
										}
										onChange={handleSelectAll}
									/>
								</TableCell>
							)}
							<TableCell>Email</TableCell>
							<TableCell>Name</TableCell>
							<TableCell>Tags</TableCell>
							<TableCell>Status</TableCell>
							<TableCell align="right">Actions</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{contacts.map((contact) => (
							<TableRow
								key={contact.id}
								hover
							>
								{selectable && (
									<TableCell padding="checkbox">
										<Checkbox
											checked={selectedContacts.includes(contact.id)}
											onChange={(e) => handleSelectOne(e, contact.id)}
										/>
									</TableCell>
								)}
								<TableCell>{contact.email}</TableCell>
								<TableCell>{contact.name || "-"}</TableCell>
								<TableCell>
									{contact.tags && contact.tags.length > 0 ? (
										<Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
											{contact.tags.slice(0, 2).map((tag) => (
												<Chip
													key={tag}
													label={tag}
													size="small"
													variant="outlined"
												/>
											))}
											{contact.tags.length > 2 && (
												<Chip
													label={`+${contact.tags.length - 2}`}
													size="small"
													variant="outlined"
												/>
											)}
										</Box>
									) : (
										"-"
									)}
								</TableCell>
								<TableCell>
									<Chip
										label={contact.status}
										color={statusColors[contact.status]}
										size="small"
									/>
								</TableCell>
								<TableCell align="right">
									<IconButton
										size="small"
										onClick={(e) => handleMenuOpen(e, contact.id)}
									>
										<MoreVert />
									</IconButton>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>

			{/* Action Menu */}
			<Menu
				anchorEl={anchorEl}
				open={Boolean(anchorEl)}
				onClose={handleMenuClose}
			>
				<MenuItem onClick={handleEdit}>
					<Edit sx={{ mr: 1 }} />
					Edit
				</MenuItem>
				<MenuItem
					onClick={handleDelete}
					sx={{ color: "error.main" }}
				>
					<Delete sx={{ mr: 1 }} />
					Delete
				</MenuItem>
			</Menu>
		</>
	);
}
