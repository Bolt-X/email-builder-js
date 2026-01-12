import React, { useEffect, useState } from "react";
import {
	Box,
	Typography,
	Stack,
	Paper,
	Tabs,
	Tab,
	Button,
	Chip,
	IconButton,
	TextField,
	InputAdornment,
	Menu,
	MenuItem,
} from "@mui/material";
import {
	ArrowBack,
	Edit,
	Delete,
	Search,
	Add,
	People,
	Email,
	Tag,
} from "@mui/icons-material";
import { useParams, useNavigate } from "react-router-dom";
import {
	useContactLists,
	fetchContactLists,
	fetchContacts,
	useContacts,
} from "../store";
import { Contact, ContactList } from "../types";
import ContactTable from "./ContactTable";
import ContactListFormDrawer from "./ContactListFormDrawer";

interface TabPanelProps {
	children?: React.ReactNode;
	index: number;
	value: number;
}

function TabPanel(props: TabPanelProps) {
	const { children, value, index, ...other } = props;

	return (
		<div
			role="tabpanel"
			hidden={value !== index}
			id={`contact-tabpanel-${index}`}
			aria-labelledby={`contact-tab-${index}`}
			{...other}
		>
			{value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
		</div>
	);
}

export default function ContactListDetailPage() {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const contactLists = useContactLists();
	const contacts = useContacts();
	const [tabValue, setTabValue] = useState(0);
	const [searchQuery, setSearchQuery] = useState("");
	const [editDrawerOpen, setEditDrawerOpen] = useState(false);

	const contactList = contactLists.find((list) => list.id === id);
	const listContacts = contacts.filter((contact) =>
		contactList?.contactIds?.includes(contact.id)
	);

	// Filter contacts by search query
	const filteredContacts = listContacts.filter((contact) => {
		if (!searchQuery) return true;
		const query = searchQuery.toLowerCase();
		return (
			contact.email.toLowerCase().includes(query) ||
			contact.name?.toLowerCase().includes(query) ||
			contact.tags.some((tag) => tag.toLowerCase().includes(query))
		);
	});

	useEffect(() => {
		fetchContactLists();
		fetchContacts();
	}, []);

	const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
		setTabValue(newValue);
	};

	const handleBack = () => {
		navigate("/contacts");
	};

	const handleEdit = () => {
		setEditDrawerOpen(true);
	};

	const handleDelete = () => {
		if (
			window.confirm(
				"Are you sure you want to delete this contact list? This action cannot be undone."
			)
		) {
			// TODO: Implement delete
			console.log("Delete contact list:", id);
		}
	};

	if (!contactList) {
		return (
			<Box>
				<Button
					startIcon={<ArrowBack />}
					onClick={handleBack}
					sx={{ mb: 2 }}
				>
					Back to Contact Lists
				</Button>
				<Typography variant="h6">Contact list not found</Typography>
			</Box>
		);
	}

	return (
		<Box>
			{/* Header */}
			<Stack
				direction="row"
				justifyContent="space-between"
				alignItems="flex-start"
				mb={3}
			>
				<Stack spacing={1}>
					<Button
						startIcon={<ArrowBack />}
						onClick={handleBack}
						size="small"
					>
						Back to Contact Lists
					</Button>
					<Stack
						direction="row"
						alignItems="center"
						spacing={2}
					>
						<People fontSize="large" color="primary" />
						<Box>
							<Typography variant="h4">{contactList.name}</Typography>
							{contactList.description && (
								<Typography
									variant="body2"
									color="text.secondary"
									mt={0.5}
								>
									{contactList.description}
								</Typography>
							)}
						</Box>
					</Stack>
					<Stack
						direction="row"
						spacing={1}
						mt={1}
					>
						<Chip
							icon={<People />}
							label={`${listContacts.length} contacts`}
							size="small"
							color="primary"
							variant="outlined"
						/>
						{contactList.createdAt && (
							<Chip
								label={`Created ${new Date(contactList.createdAt).toLocaleDateString()}`}
								size="small"
								variant="outlined"
							/>
						)}
					</Stack>
				</Stack>
				<Stack
					direction="row"
					spacing={1}
				>
					<Button
						variant="outlined"
						startIcon={<Edit />}
						onClick={handleEdit}
					>
						Edit
					</Button>
					<IconButton
						color="error"
						onClick={handleDelete}
					>
						<Delete />
					</IconButton>
				</Stack>
			</Stack>

			{/* Tabs */}
			<Paper sx={{ mb: 3 }}>
				<Tabs
					value={tabValue}
					onChange={handleTabChange}
					aria-label="contact list tabs"
				>
					<Tab
						icon={<People />}
						iconPosition="start"
						label="Contacts"
					/>
					<Tab
						icon={<Tag />}
						iconPosition="start"
						label="Tags"
					/>
					<Tab
						icon={<Email />}
						iconPosition="start"
						label="Email Status"
					/>
				</Tabs>
			</Paper>

			{/* Contacts Tab */}
			<TabPanel value={tabValue} index={0}>
				<Stack spacing={2}>
					{/* Search and Actions */}
					<Stack
						direction="row"
						spacing={2}
						justifyContent="space-between"
						alignItems="center"
					>
						<TextField
							placeholder="Search contacts..."
							size="small"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							InputProps={{
								startAdornment: (
									<InputAdornment position="start">
										<Search />
									</InputAdornment>
								),
							}}
							sx={{ minWidth: 300 }}
						/>
						<Button
							variant="contained"
							startIcon={<Add />}
							onClick={() => {
								// TODO: Open add contacts dialog
								console.log("Add contacts to list");
							}}
						>
							Add Contacts
						</Button>
					</Stack>

					{/* Contacts Table */}
					<ContactTable contacts={filteredContacts} />
				</Stack>
			</TabPanel>

			{/* Tags Tab */}
			<TabPanel value={tabValue} index={1}>
				<Box>
					<Typography variant="h6" gutterBottom>
						Tags in this list
					</Typography>
					<Typography
						variant="body2"
						color="text.secondary"
						mb={3}
					>
						View and manage tags used by contacts in this list
					</Typography>
					{/* TODO: Implement tags view */}
					<Paper sx={{ p: 3, textAlign: "center" }}>
						<Typography color="text.secondary">
							Tags management coming soon
						</Typography>
					</Paper>
				</Box>
			</TabPanel>

			{/* Email Status Tab */}
			<TabPanel value={tabValue} index={2}>
				<Box>
					<Typography variant="h6" gutterBottom>
						Email Status
					</Typography>
					<Typography
						variant="body2"
						color="text.secondary"
						mb={3}
					>
						View subscription status of contacts in this list
					</Typography>
					{/* TODO: Implement email status view */}
					<Paper sx={{ p: 3, textAlign: "center" }}>
						<Typography color="text.secondary">
							Email status view coming soon
						</Typography>
					</Paper>
				</Box>
			</TabPanel>

			{/* Edit Drawer */}
			<ContactListFormDrawer
				open={editDrawerOpen}
				onClose={() => setEditDrawerOpen(false)}
				contactListId={id}
				mode="edit"
			/>
		</Box>
	);
}
