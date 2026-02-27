import { Close } from "@mui/icons-material";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton, Stack, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { duplicateTemplate } from "../service";

const ModalDuplicateTemplate = ({ open, onClose, id }: { open: boolean, onClose: () => void, id: string | number }) => {
    const [newName, setNewName] = useState("");

    const handleDuplicate = async () => {
        try {
            const duplicatedTemplate = await duplicateTemplate(id, newName);
            if (duplicatedTemplate) {
                onClose();
                setNewName("");
            }
        } catch (error) {
            console.error("Error duplicating template:", error);
        }
    }

    return (
        <Dialog open={open} onClose={onClose}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" px={2} py={1} borderBottom={1} borderColor="divider">
                <Typography variant="h6">Duplicate Template</Typography>
                <IconButton onClick={onClose}>
                    <Close />
                </IconButton>
            </Stack>
            <DialogContent>
                <Box mb={2}>
                    <Typography variant="subtitle2">
                        New Name
                    </Typography>
                    <TextField size="small" value={newName} onChange={(e) => setNewName(e.target.value)} fullWidth />
                </Box>
                <Typography>
                    Are you sure you want to duplicate this template?
                </Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} variant="outlined">Cancel</Button>
                <Button onClick={handleDuplicate} variant="contained">Duplicate</Button>
            </DialogActions>
        </Dialog>
    );
};

export default ModalDuplicateTemplate;