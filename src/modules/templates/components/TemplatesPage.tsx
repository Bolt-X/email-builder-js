import React, { useEffect, useState, useMemo } from "react";
import {
	Box,
	Typography,
	Button,
	Stack,
	CircularProgress,
} from "@mui/material";
import { Add } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useTemplates, useTemplatesLoading, fetchTemplates } from "../store";
import TemplateListTable from "./TemplateListTable";
import TemplateFilters from "./TemplateFilters";

export default function TemplatesPage() {
	const navigate = useNavigate();
	const { t } = useTranslation();
	const templates = useTemplates();
	const loading = useTemplatesLoading();
	const [searchQuery, setSearchQuery] = useState("");
	const [debouncedQuery, setDebouncedQuery] = useState("");

	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedQuery(searchQuery);
		}, 300); // 300ms delay

		return () => clearTimeout(timer);
	}, [searchQuery]);

	useEffect(() => {
		fetchTemplates();
	}, []);

	const filteredTemplates = useMemo(() => {
		if (!debouncedQuery) return templates;
		const query = debouncedQuery.toLowerCase();
		return templates.filter(
			(t) =>
				t.name.toLowerCase().includes(query) ||
				(t.description && t.description.toLowerCase().includes(query)),
		);
	}, [templates, debouncedQuery]);

	const handleCreateTemplate = () => {
		navigate("/templates/new");
	};

	if (loading && templates.length === 0) {
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

	const isEmpty = templates.length === 0 && !loading;

	return (
		<Box>
			<Stack
				direction="row"
				justifyContent="space-between"
				alignItems="center"
				sx={{
					px: 3,
					py: 2,
					height: 64,
					bgcolor: "background.paper",
					borderBottom: 1,
					borderColor: "divider",
				}}
			>
				<Typography
					variant="h4"
					sx={{ fontWeight: 600, color: "text.primary" }}
				>
					{t("templates.title")}
				</Typography>
				<Button
					variant="contained"
					startIcon={<Add />}
					onClick={handleCreateTemplate}
					sx={{
						borderRadius: 10,
						textTransform: "none",
						px: 3,
						height: 44,
						fontWeight: 700,
					}}
				>
					{t("templates.create")}
				</Button>
			</Stack>

			<Stack spacing={0}>
				<TemplateFilters
					searchQuery={searchQuery}
					onSearchChange={setSearchQuery}
					disabled={isEmpty}
				/>

				{!isEmpty ? (
					<TemplateListTable templates={filteredTemplates} />
				) : searchQuery ? (
					<Box
						display="flex"
						flexDirection="column"
						alignItems="center"
						justifyContent="center"
						minHeight="40vh"
						textAlign="center"
						sx={{
							bgcolor: "background.paper",
							borderRadius: 2,
							p: 4,
							border: "1px solid",
							borderColor: "divider",
							mx: 3,
						}}
					>
						<Typography
							variant="h6"
							sx={{ fontWeight: 600, mb: 1 }}
						>
							No templates found
						</Typography>
						<Typography
							variant="body2"
							color="text.secondary"
							sx={{ mb: 3 }}
						>
							Try adjusting your search query to find what you're looking for.
						</Typography>
						<Button
							variant="outlined"
							onClick={() => setSearchQuery("")}
						>
							Clear search
						</Button>
					</Box>
				) : (
					<Box sx={{ textAlign: "center", py: 10 }}>
						<Typography color="text.secondary">
							No templates found. Create your first template!
						</Typography>
					</Box>
				)}
			</Stack>
		</Box>
	);
}
