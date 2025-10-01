import React from "react";

import {
	Avatar,
	Box,
	Button,
	Collapse,
	Divider,
	Drawer,
	Link,
	List,
	ListItemButton,
	ListItemIcon,
	ListItemText,
	Stack,
	Typography,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useSamplesDrawerOpen } from "../../documents/editor/EditorContext";
import {
	Search,
	DescriptionOutlined,
	HistoryOutlined,
	ExpandLess,
	ExpandMore,
} from "@mui/icons-material";
import { toggleSearchModalOpen } from "../../contexts";

export const SAMPLES_DRAWER_WIDTH = 240;

export default function SamplesDrawer() {
	const samplesDrawerOpen = useSamplesDrawerOpen();
	const [openTemplate, setOpenTemplate] = React.useState(false);

	return (
		<Drawer
			variant="persistent"
			anchor="left"
			open={samplesDrawerOpen}
			sx={{
				width: samplesDrawerOpen ? SAMPLES_DRAWER_WIDTH : 0,
				"& .MuiDrawer-paper": {
					width: SAMPLES_DRAWER_WIDTH,
					boxSizing: "border-box",
					display: "flex",
					flexDirection: "column",
					justifyContent: "space-between",
					p: 2,
				},
			}}
		>
			{/* Top Section */}
			<Stack spacing={2}>
				{/* Header */}
				<Stack
					direction="row"
					alignItems="center"
					spacing={1}
					sx={{ pl: 2, py: 1 }} // căn trái và padding gọn
				>
					<MenuIcon fontSize="small" />
					<Typography
						variant="subtitle1"
						fontWeight="bold"
					>
						MailBolter
					</Typography>
				</Stack>

				{/* Menu items */}
				<List sx={{ pt: 0 }}>
					<ListItemButton sx={{ py: 0.75, px: 2 }}>
						<ListItemIcon sx={{ minWidth: 32 }}>
							<Search fontSize="small" />
						</ListItemIcon>
						<ListItemText
							primary="Tìm kiếm"
							onClick={toggleSearchModalOpen}
						/>
					</ListItemButton>

					<ListItemButton sx={{ py: 0.75, px: 2 }}>
						<ListItemIcon sx={{ minWidth: 32 }}>
							<DescriptionOutlined fontSize="small" />
						</ListItemIcon>
						<ListItemText primary="Ghi chú" />
					</ListItemButton>

					<ListItemButton sx={{ py: 0.75, px: 2 }}>
						<ListItemIcon sx={{ minWidth: 32 }}>
							<HistoryOutlined fontSize="small" />
						</ListItemIcon>
						<ListItemText primary="Lịch sử" />
					</ListItemButton>

					<Divider />

					<ListItemButton
						onClick={() => setOpenTemplate(!openTemplate)}
						sx={{ py: 0.75, px: 2 }}
					>
						<ListItemText primary="Template" />
						{openTemplate ? <ExpandLess /> : <ExpandMore />}
					</ListItemButton>

					<Collapse
						in={openTemplate}
						timeout="auto"
						unmountOnExit
					>
						<List
							component="div"
							disablePadding
						>
							<ListItemButton sx={{ py: 0.5, pl: 4 }}>
								<ListItemText primary="Chào mừng Trung thu 2025" />
							</ListItemButton>
							<ListItemButton sx={{ py: 0.5, pl: 4 }}>
								<ListItemText primary="Chào mừng 20/10" />
							</ListItemButton>
						</List>
					</Collapse>
				</List>
			</Stack>

			{/* Footer */}
			<Stack spacing={2}>
				{/* Main Section */}
				<Stack spacing={1}>
					<ListItemButton sx={{ py: 0.75, px: 2 }}>
						<ListItemText primary="Dashboard" />
					</ListItemButton>
					<ListItemButton sx={{ py: 0.75, px: 2 }}>
						<ListItemText primary="List" />
					</ListItemButton>
					<ListItemButton sx={{ py: 0.75, px: 2 }}>
						<ListItemText primary="Subscribers" />
					</ListItemButton>
					<ListItemButton sx={{ py: 0.75, px: 2 }}>
						<ListItemText primary="Campaign" />
					</ListItemButton>
				</Stack>
				<Divider />

				<Box>
					<Typography
						variant="h6"
						color="primary"
					>
						boltx
					</Typography>
					<Typography
						variant="body2"
						color="text.secondary"
					>
						Giải pháp rút ngắn thời gian soạn và gửi email
					</Typography>
					<Button
						size="small"
						sx={{ mt: 1 }}
					>
						Learn more
					</Button>
				</Box>

				<Divider />

				<Stack
					direction="row"
					alignItems="center"
					spacing={1}
				>
					<Avatar sx={{ width: 32, height: 32 }}>A</Avatar>
					<Typography
						variant="body2"
						fontWeight="medium"
					>
						Account name
					</Typography>
				</Stack>
			</Stack>
		</Drawer>
	);
}
