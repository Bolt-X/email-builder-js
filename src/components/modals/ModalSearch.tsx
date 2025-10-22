import React from "react";
import {
	Dialog,
	DialogContent,
	Box,
	Stack,
	Typography,
	IconButton,
	InputBase,
	Paper,
} from "@mui/material";
import { Search, Tune } from "@mui/icons-material";
import { toggleSearchModalOpen, useModalSearchOpen } from "../../contexts";

const ModalSearch = () => {
	const modalSearchOpen = useModalSearchOpen();
	return (
		<Dialog
			open={modalSearchOpen}
			closeAfterTransition
			onClose={toggleSearchModalOpen}
			maxWidth="md"
			fullWidth
			PaperProps={{
				sx: {
					borderRadius: 3,
					boxShadow: "0px 8px 24px rgba(0,0,0,0.12)",
					p: 2,
				},
			}}
		>
			<DialogContent sx={{ p: 0 }}>
				{/* Header */}

				<Paper
					sx={{
						display: "flex",
						alignItems: "center",
						border: "1px solid #eee",
						borderRadius: 2,
						px: 1,
						py: 0.25,
						mb: 2,
					}}
					elevation={0}
				>
					{/* Icon search */}
					<Search
						fontSize="small"
						color="action"
						sx={{ mr: 1 }}
					/>

					{/* Input */}
					<InputBase
						type="text"
						placeholder="Tìm kiếm thông minh"
						sx={{ flex: 1, fontSize: 14 }}
					/>

					{/* Icon filter */}
					<IconButton size="small">
						<Tune fontSize="small" />
					</IconButton>
				</Paper>

				{/* Description */}
				<Typography
					variant="body2"
					color="text.secondary"
					sx={{ px: 1, mb: 2 }}
				>
					Không cần lục lại hay cuộn mãi trong lịch sử gửi. Với tính năng Tìm
					kiếm, bạn chỉ cần nhập từ khóa – hệ thống sẽ nhanh chóng hiển thị
					chính xác những email bạn đã gửi trước đó. Tiết kiệm thời gian, kiểm
					soát nội dung, và luôn sẵn sàng cho mọi chiến dịch tiếp theo.
				</Typography>

				{/* Nội dung chính (có thể thêm list kết quả tìm kiếm ở đây) */}
				<Box
					sx={{
						height: 400,
						bgcolor: "white",
						borderRadius: 2,
						boxShadow: "inset 0 1px 2px rgba(0,0,0,0.05)",
					}}
				/>
			</DialogContent>
		</Dialog>
	);
};

export default ModalSearch;
