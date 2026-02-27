import React, { useState } from "react";

import {
	CodeOffOutlined,
	CodeOutlined,
	HtmlOutlined,
	MonitorOutlined,
	PhoneIphoneOutlined,
	ChevronLeft,
	SaveOutlined,
} from "@mui/icons-material";
import {
	Box,
	Button,
	Divider,
	IconButton,
	Menu,
	MenuItem,
	Stack,
	SxProps,
	ToggleButton,
	ToggleButtonGroup,
	Tooltip,
} from "@mui/material";
import { Reader, renderToStaticMarkup } from "@usewaypoint/email-builder";

import EditorBlock from "../../documents/editor/EditorBlock";
import {
	setSelectedScreenSize,
	useDocument,
	useSelectedMainTab,
	useSelectedScreenSize,
} from "../../documents/editor/EditorContext";
import { READER_DICTIONARY } from "../../documents/editor/core";
import ToggleInspectorPanelButton from "../InspectorDrawer/ToggleInspectorPanelButton";
import ToggleSamplesPanelButton from "../SamplesDrawer/ToggleSamplesPanelButton";

import DownloadJson from "./DownloadJson";
import HtmlPanel from "./HtmlPanel";
import ImportJson from "./ImportJson";
import JsonPanel from "./JsonPanel";
import MainTabsGroup from "./MainTabsGroup";
import SaveButton from "./SaveButton";
import UndoButton from "./UndoButton";
import RedoButton from "./RedoButton";
import DrawerNote from "../../components/drawers/DrawerNote";
import { useCurrentTemplate } from "../../modules/templates/store";
import TemplateNameField from "../../components/inputs/TemplateNameField";
import ShowHTML from "../ShowHTML";
import SaveNewTemplateDialog from "../../modules/templates/components/SaveNewTemplateDialog";
import { setMessage } from "../../contexts";
import { useTranslation } from "react-i18next";
import { useParams, useNavigate } from "react-router-dom";

export default function TemplatePanel() {
	const { t } = useTranslation();
	const { id } = useParams();
	const navigate = useNavigate();
	const document = useDocument();
	const selectedMainTab = useSelectedMainTab();
	const selectedScreenSize = useSelectedScreenSize();
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const [saveDialogOpen, setSaveDialogOpen] = useState(false);
	const open = Boolean(anchorEl);

	const isNew = id === "new";

	const handleManualSaveClick = () => {
		try {
			const html = renderToStaticMarkup(document as any, {
				rootBlockId: "root",
			});
			const blockCount = (document.root.data as any).childrenIds?.length || 0;
			if (blockCount === 0) {
				setMessage("At least one block is required to save the template.");
				return;
			}
			setSaveDialogOpen(true);
		} catch (error) {
			console.error("Error rendering document to HTML:", error);
			setMessage("Failed to render template. Please check for errors.");
		}
	};

	const handleClick = (event: React.MouseEvent<HTMLElement>) => {
		setAnchorEl(event.currentTarget);
	};
	const handleClose = () => {
		setAnchorEl(null);
	};

	let mainBoxSx: SxProps = {
		height: "100%",
	};
	if (selectedScreenSize === "mobile") {
		mainBoxSx = {
			...mainBoxSx,
			margin: "32px auto",
			width: 370,
			height: 800,
			boxShadow:
				"rgba(33, 36, 67, 0.04) 0px 10px 20px, rgba(33, 36, 67, 0.04) 0px 2px 6px, rgba(33, 36, 67, 0.04) 0px 0px 1px",
		};
	}

	const handleScreenSizeChange = (_: unknown, value: unknown) => {
		switch (value) {
			case "mobile":
			case "desktop":
				setSelectedScreenSize(value);
				return;
			default:
				setSelectedScreenSize("desktop");
		}
	};

	const renderMainPanel = () => {
		switch (selectedMainTab) {
			case "editor":
				return (
					<Box sx={mainBoxSx}>
						<EditorBlock id="root" />
					</Box>
				);
			case "preview":
				return (
					<Box sx={mainBoxSx}>
						<Reader
							document={document as any}
							rootBlockId="root"
							{...({ blockConfigurationDictionary: READER_DICTIONARY } as any)}
						/>
					</Box>
				);
			case "html":
				return <HtmlPanel />;
			case "json":
				return <JsonPanel />;
		}
	};

	return (
		<>
			<Stack
				sx={{
					height: 49,
					borderBottom: 1,
					borderColor: "divider",
					backgroundColor: "background.paper",
					position: "sticky",
					top: 0,
					zIndex: "appBar",
					px: 1,
				}}
				direction="row"
				justifyContent="space-between"
				alignItems="center"
			>
				{/* <ToggleSamplesPanelButton /> */}
				<Stack
					px={2}
					direction="row"
					gap={2}
					width="100%"
					justifyContent="space-between"
					alignItems="center"
				>
					<Stack
						direction="row"
						spacing={2}
						alignItems="center"
					>
						<Button
							size="small"
							startIcon={<ChevronLeft />}
							onClick={() => navigate("/templates")}
							sx={{ mr: 1 }}
						>
							{t("templates.editor.back")}
						</Button>
						<Divider
							orientation="vertical"
							flexItem
							sx={{ height: 24, alignSelf: "center" }}
						/>
						<TemplateNameField />
						<Divider
							orientation="vertical"
							flexItem
							sx={{ height: 24, alignSelf: "center" }}
						/>
						<MainTabsGroup />
						<Divider
							orientation="vertical"
							flexItem
							sx={{ height: 24, alignSelf: "center" }}
						/>
						<UndoButton />
						<RedoButton />
					</Stack>
					<Stack
						direction="row"
						spacing={2}
					>
						<ToggleButtonGroup
							value={selectedScreenSize}
							exclusive
							size="small"
							onChange={handleScreenSizeChange}
						>
							<ToggleButton value="desktop">
								<Tooltip title={t("templates.editor.desktop_view")}>
									<MonitorOutlined fontSize="small" />
								</Tooltip>
							</ToggleButton>
							<ToggleButton value="mobile">
								<Tooltip title={t("templates.editor.mobile_view")}>
									<PhoneIphoneOutlined fontSize="small" />
								</Tooltip>
							</ToggleButton>
						</ToggleButtonGroup>

						<Box sx={{ display: "flex", alignItems: "center" }}>
							<SaveButton />
						</Box>

						<Divider
							orientation="vertical"
							flexItem
						/>

						{/* Dropdown JSON Menu */}
						<Tooltip title={t("templates.editor.code_actions")}>
							<IconButton
								size="small"
								onClick={handleClick}
								sx={{
									padding: 1,
								}}
							>
								<CodeOutlined fontSize="small" />
							</IconButton>
						</Tooltip>
						<Menu
							anchorEl={anchorEl}
							open={open}
							onClose={handleClose}
							slotProps={{
								paper: {
									sx: {
										boxShadow: "0px 2px 12px rgba(0,0,0,0.2)", // shadow
										borderRadius: 2, // bo góc
										overflow: "hidden",
									},
								},
							}}
						>
							<MenuItem>
								<DownloadJson />
							</MenuItem>
							<MenuItem>
								<ImportJson />
							</MenuItem>
							<MenuItem>
								<ShowHTML />
							</MenuItem>
						</Menu>

						<Divider
							orientation="vertical"
							flexItem
						/>
					</Stack>
				</Stack>
				<ToggleInspectorPanelButton />
			</Stack>
			<Box
				sx={{ height: "calc(100vh - 49px)", overflow: "auto", minWidth: 370 }}
			>
				{renderMainPanel()}
				<DrawerNote />
			</Box>
			<SaveNewTemplateDialog
				open={saveDialogOpen}
				onClose={() => setSaveDialogOpen(false)}
				campaignId="mock-campaign-id" // Placeholder or from context
			/>
		</>
	);
}
