import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Stack, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { useCreateTag } from "../../hooks/useTags";
import { Close } from "@mui/icons-material";

const ModalCreateTag = ({ open, onClose }: { open: boolean, onClose: () => void }) => {
    const [tag, setTag] = useState("")

    const { mutate: createTagMutation } = useCreateTag();

    const handleSubmit = () => {
        createTagMutation(tag);
        onClose();
    }
    return (
        <Dialog open={open} onClose={onClose}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" px={2} py={1} borderBottom={1} borderColor="divider">
                <Typography variant="h6">Create Tag</Typography>
                <IconButton onClick={onClose}>
                    <Close />
                </IconButton>
            </Stack>
            <DialogContent>
                <Box>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        Tag Name
                    </Typography>
                    <TextField size="small" value={tag} onChange={(e) => setTag(e.target.value)} fullWidth />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} variant="outlined">Cancel</Button>
                <Button onClick={handleSubmit} variant="contained">Create</Button>
            </DialogActions>
        </Dialog>
    );
}

export default ModalCreateTag;