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
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { MoreVert, Edit, Delete, PostAdd, Campaign, DriveFileMoveOutlined } from "@mui/icons-material";
import { Contact, ContactStatus } from "../types";
import ModalCustomDelete from "./base/ModalCustomDelete";
import { useDeleteContatsFromList } from "../../../hooks/useContact";

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
	onEdit?: (contact: Contact) => void;
	handleMoveOneContactToList?: (id: string | number) => void;
}

const statusStyles: Record<
	ContactStatus,
	{ bgcolor: string; color: string; label: string }
> = {
	subscribed: {
		bgcolor: "success.light",
		color: "success.contrastText",
		label: "Subscribed",
	},
	unsubscribed: {
		bgcolor: "error.light",
		color: "error.contrastText",
		label: "Unsubscribed",
	},
	non_subscribed: {
		bgcolor: "action.hover", // Neutral/Gray
		color: "text.primary",
		label: "Non-subscribed",
	},
};

export default function ContactTable({
	contacts,
	selectedContacts,
	onSelectOne,
	onSelectAll,
	onClearSelection,
	visibleColumns = [
		"email",
		"first_name",
		"last_name",
		"status",
		"date_created",
		"action",
	],
	total = 0,
	page = 0,
	rowsPerPage = 25,
	onPageChange,
	onRowsPerPageChange,
	onEdit,
	handleMoveOneContactToList,
}: ContactTableProps) {
	const navigate = useNavigate();
	const { t } = useTranslation();
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const [selectedId, setSelectedId] = useState<string | number | null>(null);
	const [deleteModalOpen, setDeleteModalOpen] = useState(false);
	const { mutateAsync: deleteContatsFromList, isPending: isDeleting } =
		useDeleteContatsFromList();
	console.log("selectedContacts", selectedId);

	const handleDelete = () => {
		if (selectedContacts.length > 0) {
			deleteContatsFromList(selectedContacts as string[]);
		} else {
			deleteContatsFromList([selectedId as string]);
		}
		setDeleteModalOpen(false);
	};
	const handleMenuOpen = (
		event: React.MouseEvent<HTMLElement>,
		id: string | number,
	) => {
		event.stopPropagation();
		setAnchorEl(event.currentTarget);
		setSelectedId(id);
	};

	const handleMenuClose = () => {
		setAnchorEl(null);
		setSelectedId(null);
	};

	const isAllSelected =
		contacts?.length > 0 && selectedContacts.length === contacts?.length;
	const isIndeterminate =
		selectedContacts.length > 0 && selectedContacts.length < contacts?.length;

	if (contacts?.length === 0) {
		return (
			<Paper
				sx={{
					p: 4,
					textAlign: "center",
					border: "none",
					borderRadius: 0,
				}}
				elevation={0}
			>
				<Typography
					variant="h6"
					color="text.secondary"
				>
					{t("contacts.no_contacts_found")}
				</Typography>
			</Paper>
		);
	}

	const headerStyle = {
		fontWeight: 700,
		color: "text.secondary",
		borderBottom: "1px solid",
		borderColor: "divider",
	};

	return (
		<>
			<ModalCustomDelete
				open={deleteModalOpen}
				onClose={() => setDeleteModalOpen(false)}
				onOk={handleDelete}
				title="Delete Contacts"
				content={
					<Typography>
						Are you sure you want to delete{" "}
						{selectedContacts.length > 1
							? `${selectedContacts.length} items`
							: "this item"}
						? You won't be able to undo this action.
					</Typography>
				}
				isPending={false}
			/>
			<TableContainer
				component={Paper}
				elevation={0}
				sx={{ border: "none", borderRadius: 0 }}
			>
				<Table>
					<TableHead sx={{ bgcolor: "action.hover" }}>
						<TableRow>
							<TableCell
								padding="checkbox"
								sx={{ ...headerStyle, paddingX: 3 }}
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
								<TableCell sx={headerStyle}>{t("contacts.email")}</TableCell>
							)}
							{visibleColumns.includes("first_name") && (
								<TableCell sx={headerStyle}>{t("common.first_name")}</TableCell>
							)}
							{visibleColumns.includes("last_name") && (
								<TableCell sx={headerStyle}>{t("common.last_name")}</TableCell>
							)}
							{visibleColumns.includes("status") && (
								<TableCell sx={headerStyle}>{t("common.status")}</TableCell>
							)}
							{visibleColumns.includes("date_created") && (
								<TableCell sx={headerStyle}>
									{t("common.date_created")}
								</TableCell>
							)}
							{visibleColumns.includes("action") && (
								<TableCell
									sx={{ ...headerStyle, paddingX: 3 }}
									align="right"
								>
									{t("common.actions")}
								</TableCell>
							)}
						</TableRow>
					</TableHead>
					<TableBody>
						{contacts?.map((contact) => {
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
									{visibleColumns.includes("first_name") && (
										<TableCell>
											<Typography variant="body2">
												{contact?.first_name || "-"}
											</Typography>
										</TableCell>
									)}
									{visibleColumns.includes("last_name") && (
										<TableCell>
											<Typography variant="body2">
												{contact?.last_name || "-"}
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
									{visibleColumns.includes("date_created") && (
										<TableCell>
											<Typography
												variant="body2"
												color="text.secondary"
											>
												{contact.date_created
													? new Date(contact.date_created).toLocaleDateString(
														"en-GB",
														{
															day: "2-digit",
															month: "2-digit",
															year: "numeric",
														},
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
												<Tooltip title={t("common.edit")}>
													<IconButton
														size="small"
														sx={{ color: "#666" }}
														onClick={() => onEdit?.(contact)}
													>
														<Edit fontSize="small" />
													</IconButton>
												</Tooltip>
												<Tooltip title={t("contacts.move_contact")}>
													<IconButton
														size="small"
														sx={{ color: "#666" }}
														onClick={() => handleMoveOneContactToList?.(contact.id)}
													>
														<DriveFileMoveOutlined fontSize="small" />
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
				<MenuItem
					onClick={() => {
						const contact = contacts?.find((c) => c.id === selectedId);
						if (contact && onEdit) {
							onEdit(contact);
						}
						handleMenuClose();
					}}
				>
					<Edit sx={{ mr: 1, fontSize: 20 }} />
					{t("contacts.edit_contact")}
				</MenuItem>
				<MenuItem
					onClick={() => setDeleteModalOpen(true)}
					sx={{ color: "error.main" }}
				>
					<Delete sx={{ mr: 1, fontSize: 20 }} />
					{t("contacts.delete_contact")}
				</MenuItem>
			</Menu>
		</>
	);
}
