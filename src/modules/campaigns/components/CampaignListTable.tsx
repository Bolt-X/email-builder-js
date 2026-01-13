import {
	BarChartOutlined,
	Block,
	ContentCopy,
	Delete,
	Edit,
	MoreHoriz,
	RocketLaunchOutlined,
} from "@mui/icons-material";
import {
	Box,
	Checkbox,
	Chip,
	IconButton,
	Menu,
	MenuItem,
	Pagination,
	Paper,
	Select,
	Stack,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Tooltip,
	Typography
} from "@mui/material";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { startCampaign, stopCampaign } from "../service";
import {
	deleteCampaignAction,
	duplicateCampaignAction,
	useVisibleColumns,
} from "../stores/campaign.metadata.store";
import { Campaign } from "../types";

interface CampaignListTableProps {
  campaigns: Campaign[];
}

export default function CampaignListTable({
  campaigns,
}: CampaignListTableProps) {
  const navigate = useNavigate();
  const visibleColumns = useVisibleColumns();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedId, setSelectedId] = useState<string | number | null>(null);
  const [selectedRows, setSelectedRows] = useState<(string | number)[]>([]);

  // Pagination state
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Reset page when campaigns list changes (filters applied)
  React.useEffect(() => {
    setPage(1);
  }, [campaigns]);

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    id: string | number
  ) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedId(id);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedId(null);
  };

  // Status Badge Styles
  const getStatusStyles = (status: string) => {
    switch (status) {
      case "running":
        return { bgcolor: "#0091FF", color: "white" };
      case "draft":
        return { bgcolor: "#F5F5F5", color: "rgba(0,0,0,0.87)" };
      case "finished":
        return { bgcolor: "#2FB344", color: "white" };
      case "scheduled":
        return { bgcolor: "#FF9100", color: "white" };
      case "cancelled":
        return { bgcolor: "#F44336", color: "white" };
      default:
        return { bgcolor: "#757575", color: "white" };
    }
  };

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedRows(campaigns.map((c) => c.id));
    } else {
      setSelectedRows([]);
    }
  };

  const handleSelectRow = (
    event: React.ChangeEvent<HTMLInputElement>,
    id: string | number
  ) => {
    event.stopPropagation();
    if (event.target.checked) {
      setSelectedRows((prev) => [...prev, id]);
    } else {
      setSelectedRows((prev) => prev.filter((rowId) => rowId !== id));
    }
  };

  const handleAction = async (
    e: React.MouseEvent,
    action: string,
    id: string | number
  ) => {
    e.stopPropagation();
    try {
      if (action === "start") await startCampaign(id, true);
      if (action === "stop") await stopCampaign(id);
      if (action === "analytics") navigate(`/campaigns/${id}/analytics`);
      // Refresh list (simplified for now)
      window.location.reload();
    } catch (error) {
      console.error(`Failed to perform ${action}:`, error);
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedCampaigns = campaigns.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const start = (page - 1) * rowsPerPage;
  const end = start + rowsPerPage;

  const visibleCampaigns = campaigns.slice(start, end);

  return (
    <Box mt={[0, "0rem !important"]}>
      <TableContainer component={Paper} elevation={0}>
        <Table>
          <TableHead sx={{ bgcolor: "grey.50" }}>
            <TableRow>
              <TableCell padding="checkbox" sx={{ paddingX: 3 }}>
                <Checkbox
                  indeterminate={
                    selectedRows.length > 0 &&
                    selectedRows.length < campaigns.length
                  }
                  checked={
                    campaigns.length > 0 &&
                    selectedRows.length === campaigns.length
                  }
                  onChange={handleSelectAll}
                  size="small"
                />
              </TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
              {visibleColumns.includes("status") && (
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
              )}
              {visibleColumns.includes("contacts") && (
                <TableCell sx={{ fontWeight: 600 }}>Contacts</TableCell>
              )}
              {visibleColumns.includes("tags") && (
                <TableCell sx={{ fontWeight: 600 }}>Tags</TableCell>
              )}
              {visibleColumns.includes("timestamps") && (
                <TableCell sx={{ fontWeight: 600 }}>Timestamps</TableCell>
              )}
              {visibleColumns.includes("stats") && (
                <TableCell sx={{ fontWeight: 600 }}>Stats</TableCell>
              )}
              <TableCell sx={{ fontWeight: 600, paddingX: 3 }} align="right">
                Action
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {visibleCampaigns.map((campaign) => {
              const isSelected = selectedRows.includes(campaign.id);
              return (
                <TableRow
                  key={campaign.id}
                  hover
                  selected={isSelected}
                  sx={{ cursor: "pointer" }}
                  onClick={() => navigate(`/campaigns/${campaign.id}`)}
                >
                  <TableCell padding="checkbox" sx={{ paddingX: 3 }}>
                    <Checkbox
                      checked={isSelected}
                      onChange={(e) => handleSelectRow(e, campaign.id)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 600, color: "primary.main" }}
                      >
                        {campaign.name}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: "block" }}
                      >
                        {campaign.description}
                      </Typography>
                    </Box>
                  </TableCell>
                  {visibleColumns.includes("status") && (
                    <TableCell>
                      <Chip
                        label={
                          campaign.status.charAt(0).toUpperCase() +
                          campaign.status.slice(1)
                        }
                        size="small"
                        sx={{
                          ...getStatusStyles(campaign.status),
                          fontWeight: 500,
                          borderRadius: "4px",
                        }}
                      />
                    </TableCell>
                  )}
                  {visibleColumns.includes("contacts") && (
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {campaign.recipients?.[0]?.name || "N/A"}
                      </Typography>
                    </TableCell>
                  )}
                  {visibleColumns.includes("tags") && (
                    <TableCell>
                      <Stack direction="row" spacing={0.5}>
                        {campaign.tags?.slice(0, 2).map((tag) => (
                          <Chip
                            key={tag}
                            label={tag}
                            size="small"
                            variant="outlined"
                            sx={{
                              borderRadius: "4px",
                              height: 20,
                              fontSize: "0.65rem",
                            }}
                          />
                        ))}
                        {campaign.tags && campaign.tags.length > 2 && (
                          <Typography variant="caption" color="text.secondary">
                            +{campaign.tags.length - 2}
                          </Typography>
                        )}
                      </Stack>
                    </TableCell>
                  )}
                  {visibleColumns.includes("timestamps") && (
                    <TableCell>
                      <Box
                        sx={{ fontSize: "0.75rem", color: "text.secondary" }}
                      >
                        <Box>
                          Created:{" "}
                          {campaign.createdAt
                            ? new Date(campaign.createdAt).toLocaleDateString()
                            : "-"}
                        </Box>
                        {campaign.startedAt && (
                          <Box>
                            Started:{" "}
                            {new Date(campaign.startedAt).toLocaleDateString()}
                          </Box>
                        )}
                      </Box>
                    </TableCell>
                  )}
                  {visibleColumns.includes("stats") && (
                    <TableCell>
                      <Box
                        sx={{ fontSize: "0.75rem", color: "text.secondary" }}
                      >
                        <Box>
                          Views: {campaign.stats?.opened.toLocaleString()}
                        </Box>
                        <Box>
                          Clicks: {campaign.stats?.clicked.toLocaleString()}
                        </Box>
                        <Box>
                          Sent: {campaign.stats?.sent}/{campaign.stats?.total}
                        </Box>
                        <Box>Bounces: {campaign.stats?.bounced}</Box>
                      </Box>
                    </TableCell>
                  )}
                  <TableCell align="right" sx={{ paddingX: 3 }}>
                    <Stack
                      direction="row"
                      spacing={0.5}
                      justifyContent="flex-end"
                    >
                      <Tooltip title="Start">
                        <IconButton
                          size="small"
                          onClick={(e) => handleAction(e, "start", campaign.id)}
                        >
                          <RocketLaunchOutlined
                            fontSize="small"
                            color="primary"
                          />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Stop">
                        <IconButton
                          size="small"
                          onClick={(e) => handleAction(e, "stop", campaign.id)}
                        >
                          <Block
                            fontSize="small"
                            sx={{ color: "error.light" }}
                          />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Analytics">
                        <IconButton
                          size="small"
                          onClick={(e) =>
                            handleAction(e, "analytics", campaign.id)
                          }
                        >
                          <BarChartOutlined fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, campaign.id)}
                      >
                        <MoreHoriz fontSize="small" />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        sx={{
          backgroundColor: "white",
          paddingY: 1,
          paddingX: 3,
          position: "sticky",
          bottom: 0,
		  boxShadow: "0 1px 8px 0 rgba(0, 0, 0, 0.12), 0 3px 4px 0 rgba(0, 0, 0, 0.14), 0 3px 3px -2px rgba(0, 0, 0, 0.20)",
        }}
		mt={[0, "0rem !important"]}
      >
        {/* Rows per page */}
        <Stack direction="row" alignItems="center">
          <Typography variant="body2" sx={{ marginTop: 0 }}>Rows per page:</Typography>
          <Select
            size="small"
            value={rowsPerPage}
            onChange={(e) => {
              setRowsPerPage(Number(e.target.value));
              setPage(1); // reset về page 1
            }}
            sx={{
              m: 0,
              p: 0,
              "& .MuiOutlinedInput-notchedOutline": {
                border: "none",
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                border: "none", // Removes the border when focused
              },
              // Optionally, remove box shadow on focus
              boxShadow: "none",
            }}
          >
            {[10, 25, 50].map((size) => (
              <MenuItem key={size} value={size}>
                {size}
              </MenuItem>
            ))}
          </Select>
        </Stack>

        {/* Pagination */}
        <Pagination
          count={Math.ceil(campaigns.length / rowsPerPage)}
          page={page}
          onChange={(_, value) => setPage(value)}
          boundaryCount={2}
		  sx={{ m: 0 }}
        />
      </Box>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem
          onClick={() => {
            navigate(`/campaigns/${selectedId}`);
            handleMenuClose();
          }}
        >
          <Edit sx={{ mr: 1, fontSize: 20 }} /> Edit
        </MenuItem>
        <MenuItem
          onClick={() => {
            selectedId && duplicateCampaignAction(selectedId);
            handleMenuClose();
          }}
        >
          <ContentCopy sx={{ mr: 1, fontSize: 20 }} /> Duplicate
        </MenuItem>
        <MenuItem
          onClick={() => {
            selectedId && deleteCampaignAction(selectedId);
            handleMenuClose();
          }}
          sx={{ color: "error.main" }}
        >
          <Delete sx={{ mr: 1, fontSize: 20 }} /> Delete
        </MenuItem>
      </Menu>
    </Box>
  );
}
