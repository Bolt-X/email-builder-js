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
import { useTemplates, useTemplatesLoading, fetchTemplates } from "../store";
import TemplateListTable from "./TemplateListTable";
import TemplateFilters from "./TemplateFilters";

export default function TemplatesPage() {
	const navigate = useNavigate();
	const templates = useTemplates();
	const loading = useTemplatesLoading();
	const [searchQuery, setSearchQuery] = useState("");

	useEffect(() => {
		fetchTemplates();
	}, []);

	const filteredTemplates = useMemo(() => {
		if (!searchQuery) return templates;
		const query = searchQuery.toLowerCase();
		return templates.filter(
			(t) =>
				t.name.toLowerCase().includes(query) ||
				(t.description && t.description.toLowerCase().includes(query))
		);
	}, [templates, searchQuery]);

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
				sx={{ px: 3, py: "20px", bgcolor: "white" }}
			>
				<Typography
					variant="h4"
					sx={{ fontWeight: 800, color: "text.primary" }}
				>
					Templates
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
					Create Template
				</Button>
			</Stack>

			<Stack spacing={2}>
				<TemplateFilters
					searchQuery={searchQuery}
					onSearchChange={setSearchQuery}
					disabled={isEmpty}
				/>

				{!isEmpty ? (
					<TemplateListTable templates={filteredTemplates} />
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
