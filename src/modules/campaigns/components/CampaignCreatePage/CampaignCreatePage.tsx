import { ArrowBack } from "@mui/icons-material";
import {
  Autocomplete,
  Box,
  Button,
  Chip,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateCampaign } from "../../../../hooks/useCampain";
import { useGetAllTags } from "../../../../hooks/useTags";
import ModalCreateTag from "../../../tags/ModalCreateTag";
import { useGetAllTemplates } from "../../../../hooks/useTemplates";

interface CampaignFormValues {
  name: string;
  subject: string;
  fromAddress: string;
  tags: any[];
  sendType: "now" | "schedule";
  description: string;
  template: number | null;
  scheduledAt: string | null;
}

export default function CampaignCreatePage() {
  const navigate = useNavigate();

  const { data: tags } = useGetAllTags();
  const { data: templates } = useGetAllTemplates();

  const [addTagModalOpen, setAddTagModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [values, setValues] = useState<CampaignFormValues>({
    name: "",
    subject: "",
    fromAddress: "BoltX Digital <norereply@boltxmail.com>",
    tags: [],
    sendType: "now",
    description: "",
    template: null,
    scheduledAt: null,
  });
  const { mutate: createCampaignMutation } = useCreateCampaign();
  const handleChange = (prop: keyof CampaignFormValues) => (event: any) => {
    setValues({ ...values, [prop]: event.target.value });
  };

  const handleScheduledAtChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValues({ ...values, scheduledAt: event.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      createCampaignMutation({
        name: values.name,
        subject: values.subject,
        fromAddress: values.fromAddress,
        status: "draft",
        recipients: [],
        tags: values.tags,
        sendTime: values.sendType === "now" ? "now" : "schedule",
        date_scheduled:
          values.sendType === "schedule" ? new Date().toISOString() : undefined,
        lastEditedAt: new Date().toISOString(),
        description: values.description,
        template: values.template,
      });

    } catch (error) {
      console.error("Failed to create campaign:", error);
    } finally {
      setSubmitting(false);
      navigate(`/campaigns`);
    }
  };

  const previewData = {
    name: values.name || "Untitled Campaign",
    subject: values.subject || "No Subject",
    fromAddress: values.fromAddress,
    status: "draft",
    tags: values.tags,
    sendTime: values.sendType === "now" ? "now" : "schedule",
  };

  const handleRemoveTag = (id: string) => {
    setValues({ ...values, tags: values.tags.filter((tag) => tag.slug !== id) });
  };

  const handleAddTag = () => {
    setAddTagModalOpen(true);
  };

  return (
    <Box bgcolor="white">
      <ModalCreateTag open={addTagModalOpen} onClose={() => setAddTagModalOpen(false)} />
      {/* Header / Breadcrumbs */}
      <Stack
        direction="row"
        alignItems="center"
        spacing={2}
        mb={3}
        py={2}
        borderBottom={1}
        borderColor="divider"
        sx={{ px: 1 }}
      >
        <IconButton
          onClick={() => navigate("/campaigns")}
          sx={{ color: "text.primary" }}
        >
          <ArrowBack />
        </IconButton>
        <Typography variant="h5" fontWeight="bold">
          New campaign
        </Typography>
        <Chip
          label="Draft"
          color="primary"
          size="small"
          sx={{
            backgroundColor: "neutral.black.10",
            color: "neutral.black.100",
            fontWeight: "500",
          }}
        />
      </Stack>

      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <form onSubmit={handleSubmit} className="px-6">
            <Stack spacing={3}>
              {/* Campaign Name */}
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Campaign name <span style={{ color: "red" }}>*</span>
                </Typography>
                <TextField
                  fullWidth
                  placeholder="Enter your campaign name"
                  variant="outlined"
                  size="small"
                  value={values.name}
                  onChange={handleChange("name")}
                  required
                />
              </Box>

              {/* Subject */}
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Subject <span style={{ color: "red" }}>*</span>
                </Typography>
                <TextField
                  fullWidth
                  placeholder="How do you want to stand out in the recipient's inbox?"
                  variant="outlined"
                  size="small"
                  value={values.subject}
                  onChange={handleChange("subject")}
                  required
                />
              </Box>

              {/* Description */}
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Description
                </Typography>
                <TextField
                  fullWidth
                  placeholder="Enter your campaign description"
                  variant="outlined"
                  size="small"
                  value={values.description}
                  onChange={handleChange("description")}
                  multiline
                  rows={3}
                />
              </Box>

              {/* From Address */}
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  From address <span style={{ color: "red" }}>*</span>
                </Typography>
                <FormControl fullWidth size="small">
                  <Select
                    value={values.fromAddress}
                    onChange={handleChange("fromAddress")}
                  >
                    <MenuItem value="BoltX Digital <norereply@boltxmail.com>">
                      BoltX Digital &lt;norereply@boltxmail.com&gt;
                    </MenuItem>
                    <MenuItem value="BoltX Worker <norereply@boltxworker.com>">
                      BoltX Worker &lt;norereply@boltxworker.com&gt;
                    </MenuItem>
                  </Select>
                </FormControl>
              </Box>

              {/* Template */}
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Template <span style={{ color: "red" }}>*</span>
                </Typography>
                <FormControl fullWidth size="small">
                  <Autocomplete
                    size="small"
                    options={templates ?? []}
                    getOptionLabel={(option) => option.name}
                    value={templates?.find((template) => template.id === values.template)}
                    onChange={(_, newValue) =>
                      setValues({ ...values, template: newValue?.id as number })
                    }
                    renderTags={() => null}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        variant="outlined"
                        placeholder="Choose template"
                        size="small"
                      />
                    )}
                  />
                </FormControl>
              </Box>

              {/* Tags */}
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Tags <span style={{ color: "red" }}>*</span>
                </Typography>
                <FormControl fullWidth size="small">
                  <Autocomplete
                    multiple
                    size="small"
                    options={tags ?? []}
                    getOptionLabel={(option) => option.title}
                    value={values.tags}
                    onChange={(_, newValue) =>
                      setValues({ ...values, tags: newValue })
                    }
                    renderTags={() => null}
                    noOptionsText={
                      <div style={{ padding: 16, textAlign: 'center' }}>
                        <Typography>No tags found</Typography>
                        <Button onClick={handleAddTag} variant="outlined" size="small">Add new tag</Button>
                      </div>
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        variant="outlined"
                        placeholder="Click để chọn"
                      />
                    )}
                  />
                  <Box display="flex" flexDirection={"row"} gap={1} flexWrap="wrap" mt={1}>
                    {values.tags.map((tag) => (
                      <Chip key={tag.slug} label={tag.title} onDelete={() => handleRemoveTag(tag.slug)} />
                    ))}
                  </Box>
                </FormControl>
              </Box>

              {/* Send Time */}
              <Box sx={{ width: "100%" }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  When would you like to send the campaign?
                </Typography>
                <RadioGroup
                  row
                  value={values.sendType}
                  onChange={handleChange("sendType")}
                  sx={{
                    gap: 2,
                    width: "100%",
                    display: "flex",
                    "& .MuiFormControlLabel-root": {
                      flex: 1,
                      margin: 0,
                    }
                  }}
                >
                  <FormControlLabel
                    value="now"
                    control={<Radio sx={{ display: "none" }} />}
                    label={
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1.5,
                          border:
                            values.sendType === "now"
                              ? "1px solid #1976d2"
                              : "1px solid #e0e0e0",
                          p: 1.5,
                          px: 2.5,
                          borderRadius: 1,
                          cursor: "pointer",
                          bgcolor: values.sendType === "now" ? "transparent" : "transparent",
                          width: "100%",
                          "&:hover": {
                            borderColor: values.sendType === "now" ? "#1976d2" : "#bdbdbd",
                          },
                        }}
                      >
                        <Radio
                          checked={values.sendType === "now"}
                          sx={{
                            color: values.sendType === "now" ? "#1976d2" : "#9e9e9e",
                            "&.Mui-checked": {
                              color: "#1976d2",
                            },
                            p: 0,
                            "& .MuiSvgIcon-root": {
                              fontSize: 20,
                            },
                          }}
                        />
                        <Typography
                          variant="body2"
                          sx={{
                            color: "text.primary",
                            userSelect: "none",
                          }}
                        >
                          Send now
                        </Typography>
                      </Box>
                    }
                    sx={{ m: 0, flex: 1, width: "100%" }}
                  />
                  <FormControlLabel
                    value="schedule"
                    control={<Radio sx={{ display: "none" }} />}
                    label={
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1.5,
                          border:
                            values.sendType === "schedule"
                              ? "1px solid #1976d2"
                              : "1px solid #e0e0e0",
                          p: 1.5,
                          px: 2.5,
                          borderRadius: 1,
                          cursor: "pointer",
                          bgcolor: values.sendType === "schedule" ? "transparent" : "transparent",
                          width: "100%",
                          "&:hover": {
                            borderColor: values.sendType === "schedule" ? "#1976d2" : "#bdbdbd",
                          },
                        }}
                      >
                        <Radio
                          checked={values.sendType === "schedule"}
                          sx={{
                            color: values.sendType === "schedule" ? "#1976d2" : "#9e9e9e",
                            "&.Mui-checked": {
                              color: "#1976d2",
                            },
                            p: 0,
                            "& .MuiSvgIcon-root": {
                              fontSize: 20,
                            },
                          }}
                        />
                        <Typography
                          variant="body2"
                          sx={{
                            color: "text.primary",
                            userSelect: "none",
                          }}
                        >
                          Schedule for later
                        </Typography>
                      </Box>
                    }
                    sx={{ m: 0, flex: 1, width: "100%" }}
                  />
                </RadioGroup>
                {values.sendType === "schedule" && (
                  <Box>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      Schedule date & time
                    </Typography>
                    <TextField
                      type="datetime-local"
                      value={values.scheduledAt}
                      onChange={handleScheduledAtChange}
                      fullWidth
                      size="small"
                    />
                  </Box>
                )}
              </Box>

              <Box>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={submitting}
                  sx={{ borderRadius: 100, px: 4 }}
                >
                  {submitting ? "Saving..." : "Save & Continue"}
                </Button>
              </Box>
            </Stack>
          </form>
        </Grid>

        {/* Preview Panel - Right Side */}
        <Grid item xs={12} md={4}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              bgcolor: "grey.50",
              height: "100%",
              minHeight: 400,
              borderLeft: 1,
              borderColor: "divider",
            }}
          >
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              PREVIEW
            </Typography>

            {/* Mock Email Preview */}
            <Box
              sx={{
                bgcolor: "white",
                p: 2,
                borderRadius: 1,
                boxShadow: 1,
                mb: 3,
              }}
            >
              <Typography variant="caption" color="text.secondary">
                Subject:
              </Typography>
              <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>
                {previewData.subject}
              </Typography>

              <Typography variant="caption" color="text.secondary">
                From:
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                {previewData.fromAddress}
              </Typography>

              <Box sx={{ borderTop: 1, borderColor: "divider", pt: 2 }}>
                <img
                  src="http://localhost:3845/assets/679b03a7df399888084497cd7ade7df2361e5116.png"
                  alt="Banner"
                  style={{ width: "100%", marginBottom: 10, borderRadius: 4 }}
                />
                <Typography variant="h6" color="primary" fontWeight="bold">
                  {previewData.name.toUpperCase()}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Kính gửi: Toàn thể cộng sự...
                </Typography>
              </Box>
            </Box>

            {/* Dummy Data JSON Preview */}
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              DUMMY DATA (JSON)
            </Typography>
            <Box
              sx={{
                bgcolor: "#1e1e1e",
                p: 1.5,
                borderRadius: 1,
                overflow: "auto",
                maxHeight: 200,
                fontSize: "0.7rem",
              }}
            >
              <pre style={{ color: "#d4d4d4", margin: 0 }}>
                {JSON.stringify(previewData, null, 2)}
              </pre>
            </Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontStyle: "italic", mt: 1, display: "block" }}
            >
              * This data will be saved to simulated JSON storage
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
