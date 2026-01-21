import {
  Block,
  CloseOutlined,
  ContentCopy,
  DeleteOutlined,
  EditOutlined,
  LeaderboardOutlined,
  MoreHoriz,
  PreviewOutlined,
  RefreshOutlined,
  RocketLaunchOutlined,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
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
  TextField,
  Tooltip,
  Typography
} from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDeleteCampaign, useDeleteMutipleCampaigns, useUpdateCampaign, useUpdateMutipleCampaigns } from "../../../hooks/useCampaigns";
import { startCampaign, stopCampaign } from "../service";
import {
  deleteCampaignAction,
  duplicateCampaignAction,
  useVisibleColumns,
} from "../stores/campaign.metadata.store";
import { Campaign } from "../types";

interface CampaignListTableProps {
  campaigns: any[];
  loading: boolean;
}

const getStatusStyles = (status: string) => {
  switch (status) {
    case "running":
      return { bgcolor: "brand.primary.info", color: "white" };
    case "draft":
      return { bgcolor: "neutral.black.5", color: "neutral.black.100" };
    case "finished":
      return { bgcolor: "green.800", color: "white" };
    case "scheduled":
      return { bgcolor: "orange.800", color: "white" };
    case "cancelled":
      return { bgcolor: "info.error", color: "white" };
    default:
      return { bgcolor: "neutral.black.5", color: "neutral.black.100" };
  }
};

const ModalRenameCampaign = ({
  open,
  onClose,
  campaign,
}: {
  open: boolean;
  onClose: () => void;
  campaign: Campaign;
}) => {
  const [newName, setNewName] = useState("");
  const { mutate: updateCampaignMutation } = useUpdateCampaign();
  const handleRename = async () => {
    delete campaign.fromAddress;
    updateCampaignMutation({
      slug: campaign?.slug,
      payload: { ...campaign, name: newName },
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <Box
        py={2}
        pl={3}
        pr={2}
        display={"flex"}
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ borderBottom: "1px solid #E5E7EB" }}
      >
        <Typography variant="h6" fontWeight={600}>
          Rename Campaign
        </Typography>
        <IconButton onClick={onClose}>
          <CloseOutlined />
        </IconButton>
      </Box>

      <DialogContent sx={{ px: 3, pt: 3 }}>
        <TextField
          label="Campaign name"
          fullWidth
          size="small"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleRename}
          disabled={!newName.trim()}
        >
          Rename
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const ModalDeleteCampaign = ({ open, onClose, campaigns }: { open: boolean; onClose: () => void; campaigns: Campaign[] }) => {
  const mutateDeleteMutiple = useDeleteMutipleCampaigns();
  const mutateUpdateMutipleCampaigns = useUpdateMutipleCampaigns();

  const [listCampaigns, setListCampaigns] = useState<any[]>(campaigns);

  useEffect(() => {
    setListCampaigns(campaigns);
  }, [campaigns]);

  const handleDelete = async () => {
    if (campaigns.length === 1) {
      const campaign = await mutateUpdateMutipleCampaigns.mutateAsync({ ids: [campaigns[0].slug], payload: { status: "finished" } });
      if (campaign[0].status === "finished") {
        mutateDeleteMutiple.mutate(campaigns.map((c) => c.slug));
      }
    } else {
      const campaigns = await mutateUpdateMutipleCampaigns.mutateAsync({ ids: listCampaigns?.map((c) => c.slug) as string[], payload: { status: "finished" } });
      const isAllFinished =
        campaigns?.length > 0 &&
        campaigns.every((campaign) => campaign.status === "finished");
      if (isAllFinished) {
        mutateDeleteMutiple.mutate(campaigns.map((c) => c.slug));
      }
    }
    onClose();
  };

  const handleRomoveCampaignInList = (slug: string) => {
    setListCampaigns(listCampaigns.filter((c) => c.slug !== slug));
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <Stack px={3} py={2} direction="row" justifyContent="space-between" alignItems="center" sx={{ borderBottom: "1px solid #E5E7EB" }}>
        <Typography variant="h6">Delete Campaign</Typography>
        <IconButton onClick={onClose}>
          <CloseOutlined />
        </IconButton>
      </Stack>
      <DialogContent>
        <Typography variant="body1">Are you sure you want to delete {listCampaigns?.length ?? 0} items? You won't be able to undo this action.</Typography>
        <TableContainer sx={{ border: "1px solid #E5E7EB", mt: 2, borderRadius: "4px" }}>
          <Table>
            <TableHead sx={{ bgColor: "#FAFAFA", maxHeight: "480px", overflowY: "auto" }}>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell align="right">Status</TableCell>
                <TableCell align="right">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {listCampaigns?.map((campaign) => (
                <TableRow key={campaign.slug}>
                  <TableCell align="left">
                    <Typography variant="body2" sx={{ fontWeight: 600, color: "brand.primary.600" }}>{campaign.name}</Typography>
                    <Typography variant="caption" sx={{ display: "block", color: "neutral.black.60" }}>{campaign.description}</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Chip label={campaign.status} size="small" sx={{ ...getStatusStyles(campaign.status) }} />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => handleRomoveCampaignInList(campaign.slug)}>
                      <DeleteOutlined />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit" variant="outlined">
          Cancel
        </Button>
        <Button onClick={handleDelete} color="error" variant="contained">
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default function CampaignListTable({
  campaigns,
  loading,
}: CampaignListTableProps) {
  const navigate = useNavigate();
  const visibleColumns = useVisibleColumns();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [menuCampaign, setMenuCampaign] = useState<Campaign | null>(null);
  const [openModalDelete, setOpenModalDelete] = useState(false);
  //Modal action state
  const [openModalRename, setOpenModalRename] = useState(false);
  const [campaignModal, setCampaignModal] = useState<any | null>(null);

  // Pagination state
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Reset page when campaigns list changes (filters applied)
  React.useEffect(() => {
    setPage(1);
  }, [campaigns]);

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    id: string,
    campaign: Campaign,
  ) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedId(id);
    setMenuCampaign(campaign);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedId(null);
    setMenuCampaign(null);
  };

  // Status Badge Styles

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    const visibleCampaignIds = visibleCampaigns.map((c) => c.slug);
    if (event.target.checked) {
      // Add all visible campaigns to selection (avoid duplicates)
      setSelectedRows((prev) => {
        const newSelection = [...prev];
        visibleCampaignIds.forEach((slug) => {
          if (!newSelection.includes(slug)) {
            newSelection.push(slug);
          }
        });
        return newSelection;
      });
    } else {
      // Remove only visible campaigns from selection
      setSelectedRows((prev) =>
        prev.filter((slug) => !visibleCampaignIds.includes(slug)),
      );
    }
  };

  const handleSelectAllButton = () => {
    const visibleCampaignIds = visibleCampaigns.map((c) => c.slug);
    const allVisibleSelected = visibleCampaignIds.every((slug) =>
      selectedRows.includes(slug),
    );

    if (allVisibleSelected) {
      // Deselect all visible campaigns
      setSelectedRows((prev) =>
        prev.filter((slug) => !visibleCampaignIds.includes(slug)),
      );
    } else {
      // Select all visible campaigns (avoid duplicates)
      setSelectedRows((prev) => {
        const newSelection = [...prev];
        visibleCampaignIds.forEach((slug) => {
          if (!newSelection.includes(slug)) {
            newSelection.push(slug);
          }
        });
        return newSelection;
      });
    }
  };

  const handleSelectRow = (
    event: React.ChangeEvent<HTMLInputElement>,
    slug: string,
  ) => {
    event.stopPropagation();
    if (event.target.checked) {
      setSelectedRows((prev) => [...prev, slug]);
    } else {
      setSelectedRows((prev) => prev.filter((rowSlug) => rowSlug !== slug));
    }
  };

  const handleCancelSelection = () => {
    setSelectedRows([]);
  };

  const handleBulkRename = (campaign: Campaign) => {
    setCampaignModal(campaign);
    setOpenModalRename(true);
  };

  const handleBulkDeleteModal = (campaigns: any[]) => {
    setOpenModalDelete(true);
    setCampaignModal(campaigns);
  };

  const handleAction = async (
    e: React.MouseEvent,
    action: string,
    slug: string,
  ) => {
    e.stopPropagation();
    try {
      if (action === "start") await startCampaign(slug, true);
      if (action === "stop") await stopCampaign(slug);
      if (action === "analytics") navigate(`/campaigns/${slug}/analytics`);
      window.location.reload();
    } catch (error) {
      console.error(`Failed to perform ${action}:`, error);
    }
  };

  const start = (page - 1) * rowsPerPage;
  const end = start + rowsPerPage;

  const visibleCampaigns = campaigns.slice(start, end);

  // Calculate selection state for current page
  const visibleCampaignIds = visibleCampaigns.map((c) => c.slug);
  const selectedVisibleCount = visibleCampaignIds.filter((slug) =>
    selectedRows.includes(slug),
  ).length;
  const allVisibleSelected =
    visibleCampaigns.length > 0 &&
    selectedVisibleCount === visibleCampaigns.length;
  const someVisibleSelected =
    selectedVisibleCount > 0 && selectedVisibleCount < visibleCampaigns.length;

  // Refs for selection bar and pagination
  const selectionBarRef = useRef<HTMLDivElement>(null);
  const paginationRef = useRef<HTMLDivElement>(null);

  return (
    <Box
      mt={[0, "0rem !important"]}
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "calc(100vh - 159px)",
        position: "relative",
      }}
    >
      {/* Modal Rename Campaign */}
      <ModalRenameCampaign
        open={openModalRename}
        onClose={() => setOpenModalRename(false)}
        campaign={campaignModal}
      />
      {/* Modal Delete Campaign */}
      <ModalDeleteCampaign
        open={openModalDelete}
        onClose={() => setOpenModalDelete(false)}
        campaigns={campaignModal}
      />
      {/* Selection Bar */}
      {selectedRows.length > 0 && (
        <Box
          ref={selectionBarRef}
          sx={{
            bgcolor: "brand.primary.600",
            color: "white",
            px: 3,
            py: 1.5,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexShrink: 0,
          }}
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {selectedRows.length} item{selectedRows.length > 1 ? "s" : ""}{" "}
              selected
            </Typography>
            <Button
              size="small"
              onClick={handleSelectAllButton}
              sx={{
                color: "white",
                textTransform: "none",
                fontWeight: 500,
                "&:hover": {
                  bgcolor: "brand.primary.100",
                  color: "brand.primary.600",
                },
              }}
            >
              Select all
            </Button>
          </Stack>
          <Stack direction="row" spacing={2} alignItems="center">
            {selectedRows.length === 1 && (
              <Button
                size="small"
                startIcon={<EditOutlined sx={{ fontSize: 18 }} />}
                onClick={() =>
                  handleBulkRename(
                    campaigns.find((c) => c.slug === selectedRows[0]) || null,
                  )
                }
                sx={{
                  color: "white",
                  textTransform: "none",
                  fontWeight: 500,
                  "&:hover": {
                    bgcolor: "brand.primary.100",
                    color: "brand.primary.600",
                  },
                }}
              >
                Rename
              </Button>
            )}
            <Button
              size="small"
              startIcon={<DeleteOutlined sx={{ fontSize: 18 }} />}
              onClick={() => handleBulkDeleteModal(campaigns.filter((c) => selectedRows.includes(c.slug)))}
              sx={{
                color: "white",
                textTransform: "none",
                fontWeight: 500,
                "&:hover": {
                  bgcolor: "brand.primary.100",
                  color: "brand.primary.600",
                },
              }}
            >
              Delete
            </Button>
            <Button
              size="small"
              onClick={handleCancelSelection}
              sx={{
                color: "white",
                textTransform: "none",
                fontWeight: 500,
                "&:hover": {
                  bgcolor: "brand.primary.100",
                  color: "brand.primary.600",
                },
              }}
            >
              Cancel
            </Button>
          </Stack>
        </Box>
      )}
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          flex: 1,
          overflow: "auto",
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          m: 0,
          p: 0,

          "&::-webkit-scrollbar-button": {
            display: "none",
          },
          "&::-webkit-scrollbar": {
            width: "8px",
            height: "8px",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "rgba(0, 0, 0, 0.3)",
            borderRadius: "4px",
          },
          "&::-webkit-scrollbar-track": {
            backgroundColor: "transparent",
          },
        }}
      >
        <Table stickyHeader>
          <TableHead sx={{ bgcolor: "grey.50" }}>
            <TableRow>
              <TableCell padding="checkbox" sx={{ paddingX: 3 }}>
                <Checkbox
                  indeterminate={someVisibleSelected}
                  checked={allVisibleSelected}
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
          <TableBody sx={{ opacity: loading ? 0.5 : 1 }}>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={visibleColumns.length + 1}
                  sx={{ textAlign: "center" }}
                >
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : (
              visibleCampaigns.map((campaign) => {
                const isSelected = selectedRows.includes(campaign.slug);
                const isDisabledStart =
                  campaign.status === "running" || campaign.status === "cancelled" ||
                  campaign.status === "finished";
                const isDisabledStop =
                  campaign.status === "draft" ||
                  campaign.status === "finished" ||
                  campaign.status === "scheduled";
                const isDisabledAnalytics =
                  campaign.status === "draft" ||
                  campaign.status === "running" ||
                  campaign.status === "scheduled";

                return (
                  <TableRow
                    key={campaign.slug}
                    hover
                    selected={isSelected}
                    sx={{ cursor: "pointer" }}
                    onClick={(e) => {
                      navigate(`/campaigns/${campaign.slug}`);
                    }}
                  >
                    <TableCell padding="checkbox" sx={{ paddingX: 3 }}>
                      <Checkbox
                        checked={isSelected}
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                        onChange={(e) => {
                          handleSelectRow(e, campaign.slug);
                        }}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 600, color: "brand.primary.600" }}
                        >
                          {campaign.name}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: "block", color: "neutral.black.60" }}
                        >
                          {campaign.description}
                        </Typography>
                      </Box>
                    </TableCell>
                    {visibleColumns.includes("status") && (
                      <TableCell>
                        <Chip
                          label={
                            <Stack
                              direction="row"
                              spacing={0.5}
                              alignItems="center"
                            >
                              <Typography
                                variant="body2"
                                color={
                                  campaign.status === "draft"
                                    ? "neutral.black.100"
                                    : "white"
                                }
                                sx={{ fontWeight: 600 }}
                              >
                                {campaign.status.charAt(0).toUpperCase()}
                                {campaign.status.slice(1)}
                              </Typography>
                              {campaign.status === "running" && (
                                <Typography variant="body2" color="white">
                                  <RefreshOutlined fontSize="small" />
                                </Typography>
                              )}
                            </Stack>
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
                        <Typography
                          variant="body2"
                          color="brand.primary.600"
                          sx={{ fontWeight: 600, fontSize: "14px" }}
                        >
                          {campaign.recipients
                            ?.map((r: any) => r.name)
                            .join(", ") || "N/A"}
                        </Typography>
                      </TableCell>
                    )}
                    {visibleColumns.includes("tags") && (
                      <TableCell>
                        <Stack direction="row" spacing={0.5}>
                          {campaign.tags?.slice(0, 2).map((tag: any) => (
                            <Chip
                              key={tag.slug || tag}
                              label={tag.title || tag}
                              size="small"
                              variant="outlined"
                              sx={{
                                borderRadius: "4px",
                                height: 20,
                                fontSize: "0.65rem",
                                backgroundColor: "neutral.black.10",
                                color: "neutral.black.80",
                                border: "none",
                              }}
                            />
                          ))}
                          {campaign.tags && campaign.tags.length > 2 && (
                            <Typography
                              variant="caption"
                              color="neutral.black.80"
                            >
                              +{campaign.tags.length - 2}
                            </Typography>
                          )}
                        </Stack>
                      </TableCell>
                    )}
                    {visibleColumns.includes("timestamps") && (
                      <TableCell>
                        <Box
                          sx={{
                            fontSize: "0.75rem",
                            color: "neutral.black.60",
                          }}
                        >
                          <Box>
                            Created{" "}
                            {campaign.createdAt
                              ? new Date(
                                campaign.createdAt,
                              ).toLocaleDateString()
                              : "-"}
                          </Box>
                          {campaign.startedAt && (
                            <Box>
                              Started{" "}
                              {new Date(
                                campaign.startedAt,
                              ).toLocaleDateString()}
                            </Box>
                          )}
                        </Box>
                      </TableCell>
                    )}
                    {visibleColumns.includes("stats") && (
                      <TableCell>
                        <Box
                          sx={{
                            fontSize: "0.75rem",
                            color: "neutral.black.60",
                          }}
                        >
                          <Box display="flex" flexDirection="row" gap={2}>
                            Views{" "}
                            <Typography
                              variant="body2"
                              color="neutral.black.80"
                            >
                              {campaign.stats?.opened.toLocaleString()}
                            </Typography>
                          </Box>
                          <Box display="flex" flexDirection="row" gap={2}>
                            Clicks{" "}
                            <Typography
                              variant="body2"
                              color="neutral.black.80"
                            >
                              {campaign.stats?.clicked.toLocaleString()}
                            </Typography>
                          </Box>
                          <Box display="flex" flexDirection="row" gap={2}>
                            Sent{" "}
                            <Typography
                              variant="body2"
                              color="neutral.black.80"
                            >
                              {campaign.stats?.sent}/{campaign.stats?.total}
                            </Typography>
                          </Box>
                          <Box display="flex" flexDirection="row" gap={2}>
                            Bounces{" "}
                            <Typography
                              variant="body2"
                              color="neutral.black.80"
                            >
                              {campaign.stats?.bounced}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                    )}
                    <TableCell align="right" sx={{ paddingX: 3 }}>
                      <Stack
                        direction="row"
                        spacing={0.5}
                        justifyContent="flex-end"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Tooltip title="Start">
                          <span>
                            <IconButton
                              size="small"
                              onClick={(e) =>
                                handleAction(e, "start", campaign.slug)
                              }
                              disabled={isDisabledStart}
                            >
                              <RocketLaunchOutlined
                                fontSize="small"
                                sx={{
                                  color: isDisabledStart
                                    ? "neutral.black.20"
                                    : "neutral.black.60",
                                  "&:hover": { color: "primary.main" },
                                }}
                              />
                            </IconButton>
                          </span>
                        </Tooltip>
                        <Tooltip title="Stop">
                          <span>
                            <IconButton
                              size="small"
                              onClick={(e) =>
                                handleAction(e, "stop", campaign.slug)
                              }
                              disabled={isDisabledStop}
                              sx={{
                                "&:hover": { backgroundColor: "error.50" },
                              }}
                            >
                              <Block
                                fontSize="small"
                                sx={{
                                  color: isDisabledStop
                                    ? "neutral.black.20"
                                    : "neutral.black.60",
                                  "&:hover": { color: "error.600" },
                                }}
                              />
                            </IconButton>
                          </span>
                        </Tooltip>
                        <Tooltip title="Preview">
                          <IconButton
                            size="small"
                            onClick={(e) =>
                              handleAction(e, "analytics", campaign.slug)
                            }
                          >
                            <PreviewOutlined fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <IconButton
                          size="small"
                          onClick={(e) =>
                            handleMenuOpen(e, campaign.slug, campaign)
                          }
                        >
                          <MoreHoriz fontSize="small" />
                        </IconButton>
                      </Stack>
                    </TableCell>
                    <Menu
                      anchorEl={anchorEl}
                      open={Boolean(anchorEl)}
                      onClose={handleMenuClose}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MenuItem
                        onClick={() => {
                          selectedId && duplicateCampaignAction(selectedId);
                          handleMenuClose();
                        }}
                      >
                        <ContentCopy
                          sx={{
                            mr: 1,
                            fontSize: 20,
                            color: "neutral.black.60",
                          }}
                        />{" "}
                        Duplicate
                      </MenuItem>
                      <MenuItem
                        onClick={() => {
                          navigate(`/campaigns/${selectedId}`);
                          handleMenuClose();
                        }}
                        sx={{
                          color: isDisabledAnalytics
                            ? "neutral.black.20"
                            : "neutral.black.60",
                        }}
                        disabled={isDisabledAnalytics}
                      >
                        <LeaderboardOutlined
                          sx={{
                            mr: 1,
                            fontSize: 20,
                            color: isDisabledAnalytics
                              ? "neutral.black.20"
                              : "neutral.black.60",
                          }}
                        />{" "}
                        Analytics
                      </MenuItem>
                      <MenuItem
                        onClick={() => {
                          selectedId && deleteCampaignAction(selectedId);
                          handleMenuClose();
                        }}
                        sx={{
                          color:
                            menuCampaign?.status === "running"
                              ? "neutral.black.20"
                              : "error.600",
                        }}
                        disabled={menuCampaign?.status === "running"}
                      >
                        <DeleteOutlined
                          sx={{
                            mr: 1,
                            fontSize: 20,
                            color:
                              menuCampaign?.status === "running"
                                ? "neutral.black.20"
                                : "error.600",
                          }}
                        />{" "}
                        Delete
                      </MenuItem>
                    </Menu>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <Box
        ref={paginationRef}
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        sx={{
          backgroundColor: "white",
          paddingY: 1,
          paddingX: 3,
          flexShrink: 0,
          boxShadow:
            "0 1px 8px 0 rgba(0, 0, 0, 0.12), 0 3px 4px 0 rgba(0, 0, 0, 0.14), 0 3px 3px -2px rgba(0, 0, 0, 0.20)",
        }}
      >
        {/* Rows per page */}
        <Stack direction="row" alignItems="center">
          <Typography variant="body2" sx={{ marginTop: 0 }}>
            Rows per page:
          </Typography>
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
    </Box>
  );
}
