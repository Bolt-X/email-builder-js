import { Box, CircularProgress, Drawer, IconButton, Stack, SxProps, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useEffect } from "react";
import { fetchTemplateDetail, setCurrentTemplate, useActiveTemplateId, useTemplatesLoading } from "../store";
import { Reader } from "@usewaypoint/email-builder";
import { resetDocument, useDocument } from "../../../documents/editor/EditorContext";
import { Close } from "@mui/icons-material";
import EMPTY_EMAIL_MESSAGE from "../../../getConfiguration/sample/empty-email-message";

const DrawerPreview = ({ open, onClose, id }: { open: boolean, onClose: () => void, id: string | number | null }) => {
    const document = useDocument();
    const loading = useTemplatesLoading();
    const activeTemplateId = useActiveTemplateId();
    const isDrawerLoading =
        Boolean(open && id != null && loading) &&
        (activeTemplateId == null || String(activeTemplateId) !== String(id));
    useEffect(() => {
        if (open && id != null) {
            fetchTemplateDetail(id);
        } else {
            setCurrentTemplate(null);
            resetDocument(EMPTY_EMAIL_MESSAGE);
        }
    }, [id, open]);

    let mainBoxSx: SxProps = {
        height: "100%",
        flex: 1,
        overflow: "auto",
        position: "relative",
        px: 2,
        py: 2,
    };
    return (
        <Drawer
            open={open}
            onClose={onClose}
            anchor="right"
            PaperProps={{
                sx: {
                    width: { xs: "100vw", sm: 720, md: 920 },
                    maxWidth: "100vw",
                },
            }}
        >
            <Stack direction="row" justifyContent="space-between" alignItems="center" px={2} py={1} borderBottom={1} borderColor="divider">
                <Typography variant="h6">Preview</Typography>
                <IconButton onClick={onClose}>
                    <Close />
                </IconButton>
            </Stack>
            <Box sx={mainBoxSx}>
                <Reader
                    document={document as any}
                    rootBlockId="root"
                />
                {isDrawerLoading && (
                    <Box
                        sx={{
                            position: "absolute",
                            inset: 0,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            bgcolor: (theme) =>
                                alpha(theme.palette.background.paper, 0.72),
                            backdropFilter: "blur(1px)",
                        }}
                    >
                        <CircularProgress size={28} />
                    </Box>
                )}
            </Box>
        </Drawer>
    );
}

export default DrawerPreview;