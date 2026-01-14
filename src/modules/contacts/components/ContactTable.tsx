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
	Typography,
	Box,
	Stack,
	Tooltip,
	TablePagination,
} from "@mui/material";
import { MoreVert, Edit, Delete, PostAdd, Campaign } from "@mui/icons-material";
import { Contact, ContactStatus } from "../types";

interface ContactTableProps {
	contacts: Contact[];
	selectedContacts: (string | number)[];
	onSelectOne: (id: string | number) => void;
	onSelectAll: () => void;
	onClearSelection: () => void;
	visibleColumns?: string[];
	total?: number;
	page?: number;
	rowsPerPage?: number;
	onPageChange?: (page: number) => void;
	onRowsPerPageChange?: (rows: number) => void;
}

const statusStyles: Record<
	ContactStatus,
	{ bgcolor: string; color: string; label: string }
> = {
	subscribed: { bgcolor: "#2E7D32", color: "white", label: "Subscribed" },
	unsubscribed: { bgcolor: "#D32F2F", color: "white", label: "Unsubscribed" },
	"non-subscribed": {
		bgcolor: "#757575",
		color: "white",
		label: "Non-subscribed",
	},
	bounced: { bgcolor: "#000000", color: "white", label: "Bounced" },
};

export default function ContactTable({
	contacts,
	selectedContacts,
	onSelectOne,
	onSelectAll,
	onClearSelection,
	visibleColumns = [
		"email",
		"firstName",
		"lastName",
		"address",
		"status",
		"tags",
		"createdAt",
		"action",
	],
	total = 0,
	page = 0,
	rowsPerPage = 25,
	onPageChange,
	onRowsPerPageChange,
}: ContactTableProps) {
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const [selectedId, setSelectedId] = useState<string | number | null>(null);

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

	const isAllSelected =
		contacts.length > 0 && selectedContacts.length === contacts.length;
	const isIndeterminate =
		selectedContacts.length > 0 && selectedContacts.length < contacts.length;

	if (contacts.length === 0) {
		return (
			<Paper
				sx={{
					p: 4,
					textAlign: "center",
					border: "1px solid",
					borderColor: "divider",
					borderRadius: 2,
				}}
				elevation={0}
			>
				<Typography
					variant="h6"
					color="text.secondary"
				>
					No contacts found
				</Typography>
			</Paper>
		);
	}

	return (
		<>
			<TableContainer
				component={Paper}
				elevation={0}
				sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2 }}
			>
				<Table>
					<TableHead sx={{ bgcolor: "#F9FAFB" }}>
						<TableRow>
							<TableCell
								padding="checkbox"
								sx={{ borderBottom: "1px solid #E5E7EB", paddingX: 3 }}
							>
								<Checkbox
									indeterminate={isIndeterminate}
									checked={isAllSelected}
									onChange={(e) => {
										if (e.target.checked) onSelectAll();
										else onClearSelection();
									}}
								/>
							</TableCell>
							{visibleColumns.includes("email") && (
								<TableCell
									sx={{
										fontWeight: 700,
										color: "text.secondary",
										borderBottom: "1px solid #E5E7EB",
									}}
								>
									Mail address
								</TableCell>
							)}
							{visibleColumns.includes("firstName") && (
								<TableCell
									sx={{
										fontWeight: 700,
										color: "text.secondary",
										borderBottom: "1px solid #E5E7EB",
									}}
								>
									First name
								</TableCell>
							)}
							{visibleColumns.includes("lastName") && (
								<TableCell
									sx={{
										fontWeight: 700,
										color: "text.secondary",
										borderBottom: "1px solid #E5E7EB",
									}}
								>
									Last name
								</TableCell>
							)}
							{visibleColumns.includes("address") && (
								<TableCell
									sx={{
										fontWeight: 700,
										color: "text.secondary",
										borderBottom: "1px solid #E5E7EB",
									}}
								>
									Address
								</TableCell>
							)}
							{visibleColumns.includes("status") && (
								<TableCell
									sx={{
										fontWeight: 700,
										color: "text.secondary",
										borderBottom: "1px solid #E5E7EB",
									}}
								>
									Status
								</TableCell>
							)}
							{visibleColumns.includes("tags") && (
								<TableCell
									sx={{
										fontWeight: 700,
										color: "text.secondary",
										borderBottom: "1px solid #E5E7EB",
									}}
								>
									Tags
								</TableCell>
							)}
							{visibleColumns.includes("createdAt") && (
								<TableCell
									sx={{
										fontWeight: 700,
										color: "text.secondary",
										borderBottom: "1px solid #E5E7EB",
									}}
								>
									Date created
								</TableCell>
							)}
							{visibleColumns.includes("action") && (
								<TableCell
									sx={{
										fontWeight: 700,
										color: "text.secondary",
										borderBottom: "1px solid #E5E7EB",
										paddingX: 3,
									}}
									align="right"
								>
									Action
								</TableCell>
							)}
						</TableRow>
					</TableHead>
					<TableBody>
						{contacts.map((contact) => {
							const isSelected = selectedContacts.includes(contact.id);
							const style =
								statusStyles[contact.status] || statusStyles.subscribed;

							return (
								<TableRow
									key={contact.id}
									hover
									selected={isSelected}
								>
									<TableCell
										padding="checkbox"
										sx={{ paddingX: 3 }}
									>
										<Checkbox
											checked={isSelected}
											onChange={() => onSelectOne(contact.id)}
										/>
									</TableCell>
									{visibleColumns.includes("email") && (
										<TableCell>
											<Typography
												variant="body2"
												sx={{
													color: "primary.main",
													fontWeight: 600,
													cursor: "pointer",
													"&:hover": { textDecoration: "underline" },
												}}
											>
												{contact.email}
											</Typography>
										</TableCell>
									)}
									{visibleColumns.includes("firstName") && (
										<TableCell>
											<Typography variant="body2">
												{contact.firstName || "-"}
											</Typography>
										</TableCell>
									)}
									{visibleColumns.includes("lastName") && (
										<TableCell>
											<Typography variant="body2">
												{contact.lastName || "-"}
											</Typography>
										</TableCell>
									)}
									{visibleColumns.includes("address") && (
										<TableCell>
											<Typography
												variant="body2"
												color="text.secondary"
												noWrap
												sx={{
													maxWidth: 200,
													display: "block",
													overflow: "hidden",
													textOverflow: "ellipsis",
												}}
											>
												{contact.address || "-"}
											</Typography>
										</TableCell>
									)}
									{visibleColumns.includes("status") && (
										<TableCell>
											<Chip
												label={style.label}
												size="small"
												sx={{
													bgcolor: style.bgcolor,
													color: style.color,
													fontWeight: 600,
													borderRadius: "4px",
													fontSize: "0.75rem",
													height: 24,
												}}
											/>
										</TableCell>
									)}
									{visibleColumns.includes("tags") && (
										<TableCell>
											<Stack
												direction="row"
												spacing={0.5}
											>
												{contact.tags.slice(0, 2).map((tag) => (
													<Chip
														key={tag}
														label={tag}
														size="small"
														sx={{
															bgcolor: "#F3F4F6",
															color: "#374151",
															fontWeight: 500,
															borderRadius: "4px",
															fontSize: "0.75rem",
															height: 24,
														}}
													/>
												))}
												{contact.tags.length > 2 && (
													<Chip
														label={`+${contact.tags.length - 2}`}
														size="small"
														sx={{
															bgcolor: "#F3F4F6",
															color: "#374151",
															fontWeight: 500,
															borderRadius: "4px",
															fontSize: "0.75rem",
															height: 24,
														}}
													/>
												)}
											</Stack>
										</TableCell>
									)}
									{visibleColumns.includes("createdAt") && (
										<TableCell>
											<Typography
												variant="body2"
												color="text.secondary"
											>
												{contact.createdAt
													? new Date(contact.createdAt).toLocaleDateString(
															"en-GB",
															{
																day: "2-digit",
																month: "2-digit",
																year: "numeric",
															}
														)
													: "-"}
											</Typography>
										</TableCell>
									)}
									{visibleColumns.includes("action") && (
										<TableCell
											align="right"
											sx={{ paddingX: 3 }}
										>
											<Stack
												direction="row"
												spacing={0.5}
												justifyContent="flex-end"
											>
												<Tooltip title="Edit">
													<IconButton
														size="small"
														sx={{ color: "#666" }}
													>
														<Edit fontSize="small" />
													</IconButton>
												</Tooltip>
												<Tooltip title="Add content">
													<IconButton
														size="small"
														sx={{ color: "#666" }}
													>
														<PostAdd fontSize="small" />
													</IconButton>
												</Tooltip>
												<IconButton
													size="small"
													onClick={(e) => handleMenuOpen(e, contact.id)}
													sx={{ color: "#666" }}
												>
													<MoreVert fontSize="small" />
												</IconButton>
											</Stack>
										</TableCell>
									)}
								</TableRow>
							);
						})}
					</TableBody>
				</Table>
				<TablePagination
					rowsPerPageOptions={[10, 25, 50, 100]}
					component="div"
					count={total}
					rowsPerPage={rowsPerPage}
					page={page}
					onPageChange={(_, p) => onPageChange?.(p)}
					onRowsPerPageChange={(e) =>
						onRowsPerPageChange?.(parseInt(e.target.value, 10))
					}
					sx={{ px: 3 }}
				/>
			</TableContainer>

			{/* Action Menu */}
			<Menu
				anchorEl={anchorEl}
				open={Boolean(anchorEl)}
				onClose={handleMenuClose}
			>
				<MenuItem onClick={handleMenuClose}>
					<Edit sx={{ mr: 1, fontSize: 20 }} />
					Edit contact
				</MenuItem>
				<MenuItem
					onClick={handleMenuClose}
					sx={{ color: "error.main" }}
				>
					<Delete sx={{ mr: 1, fontSize: 20 }} />
					Delete contact
				</MenuItem>
			</Menu>
		</>
	);
}
