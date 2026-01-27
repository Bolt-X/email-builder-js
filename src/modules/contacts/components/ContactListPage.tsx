import React, { useEffect, useState } from "react";
import {
	Box,
	Button,
	CircularProgress,
	Stack,
	Typography,
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
} from "@mui/material";
import {
	Add,
	MoreVert,
	Edit,
	Delete,
	Visibility,
	People,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
	useContactLists,
	useContactsLoading,
	fetchContactLists,
} from "../store";
import { ContactList } from "../types";

export default function ContactListPage() {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const contactLists = useContactLists();
	const loading = useContactsLoading();
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const [selectedId, setSelectedId] = useState<string | number | null>(null);

	useEffect(() => {
		fetchContactLists();
	}, []);

	const handleMenuOpen = (
		event: React.MouseEvent<HTMLElement>,
		id: string | number,
	) => {
		setAnchorEl(event.currentTarget);
		setSelectedId(id);
	};

	const handleMenuClose = () => {
		setAnchorEl(null);
		setSelectedId(null);
	};

	const handleView = () => {
		if (selectedId) {
			navigate(`/contacts/lists/${selectedId}`);
			handleMenuClose();
		}
	};

	const handleEdit = () => {
		if (selectedId) {
			// TODO: Open edit dialog
			handleMenuClose();
		}
	};

	const handleDelete = async () => {
		if (selectedId) {
			if (window.confirm(t("contacts.confirm_delete_list"))) {
				// TODO: Implement delete
				console.log("Delete contact list:", selectedId);
			}
			handleMenuClose();
		}
	};

	if (loading && contactLists.length === 0) {
		return (
			<Box
				display="flex"
				justifyContent="center"
				alignItems="center"
				minHeight="400px"
			>
				<CircularProgress />
			</Box>
		);
	}

	return (
		<Box>
			<Stack
				direction="row"
				justifyContent="space-between"
				alignItems="center"
				mb={3}
			>
				<Typography variant="h4">{t("contacts.list_title")}</Typography>
				<Button
					variant="contained"
					startIcon={<Add />}
					onClick={() => navigate("/contacts/lists/new")}
				>
					{t("contacts.create_list")}
				</Button>
			</Stack>

			<TableContainer component={Paper}>
				<Table>
					<TableHead>
						<TableRow>
							<TableCell>{t("common.name")}</TableCell>
							<TableCell>{t("common.description")}</TableCell>
							<TableCell>{t("contacts.contacts")}</TableCell>
							<TableCell>{t("common.created_at")}</TableCell>
							<TableCell align="right">{t("common.actions")}</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{contactLists.map((list) => (
							<TableRow
								key={list.slug}
								hover
								sx={{ cursor: "pointer" }}
								onClick={() => navigate(`/contacts/lists/${list.slug}`)}
							>
								<TableCell>
									<Stack
										direction="row"
										alignItems="center"
										spacing={1}
									>
										<People
											fontSize="small"
											color="primary"
										/>
										<Typography variant="body1">{list.name}</Typography>
									</Stack>
								</TableCell>
								<TableCell>
									<Typography
										variant="body2"
										color="text.secondary"
									>
										{list.status || t("contacts.no_status")}
									</Typography>
								</TableCell>
								<TableCell>
									<Chip
										label={`${list.subscribers?.length || 0} ${t("contacts.contacts_count")}`}
										size="small"
										color="primary"
										variant="outlined"
									/>
								</TableCell>
								<TableCell>
									{list.date_created
										? new Date(list.date_created).toLocaleDateString()
										: "-"}
								</TableCell>
								<TableCell
									align="right"
									onClick={(e) => e.stopPropagation()}
								>
									<IconButton
										size="small"
										onClick={(e) => handleMenuOpen(e, list.slug)}
									>
										<MoreVert />
									</IconButton>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>

			{/* Empty State */}
			{contactLists.length === 0 && !loading && (
				<Box
					textAlign="center"
					py={8}
				>
					<People sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
					<Typography
						variant="h6"
						color="text.secondary"
						mb={2}
					>
						{t("contacts.no_lists_found")}
					</Typography>
					<Button
						variant="outlined"
						startIcon={<Add />}
						onClick={() => navigate("/contacts/lists/new")}
					>
						{t("contacts.create_first_list")}
					</Button>
				</Box>
			)}

			{/* Action Menu */}
			<Menu
				anchorEl={anchorEl}
				open={Boolean(anchorEl)}
				onClose={handleMenuClose}
			>
				<MenuItem onClick={handleView}>
					<Visibility sx={{ mr: 1 }} />
					{t("contacts.view_details")}
				</MenuItem>
				<MenuItem onClick={handleEdit}>
					<Edit sx={{ mr: 1 }} />
					{t("common.edit")}
				</MenuItem>
				<MenuItem
					onClick={handleDelete}
					sx={{ color: "error.main" }}
				>
					<Delete sx={{ mr: 1 }} />
					{t("common.delete")}
				</MenuItem>
			</Menu>
		</Box>
	);
}
