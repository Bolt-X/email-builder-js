import { Close } from "@mui/icons-material";
import { Box, Button, Dialog, DialogActions, DialogContent, IconButton, Stack, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { useDuplicateContactList } from "../../../../hooks/useContactLists";

const ModalDuplicate = ({ open, onClose, slug }: { open: boolean, onClose: () => void, slug: string }) => {
    const [newName, setNewName] = useState<string>("");

    const { mutate: duplicateContactList } = useDuplicateContactList();

    const handleDuplicate = () => {
        duplicateContactList({ slug, newName });
        onClose();
    }
    return (
        <Dialog open={open} onClose={onClose}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" px={2} py={1} borderBottom={1} borderColor="divider">
                <Typography variant="h6">Duplicate Contact List</Typography>
                <IconButton onClick={onClose}>
                    <Close />
                </IconButton>
            </Stack>
            <DialogContent>
                <Box mb={2}>
                    <Typography>
                        New Name
                    </Typography>
                    <TextField
                        fullWidth
                        size="small"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                    />
                </Box>
                <Typography sx={{ color: "yellow" }}>
                    Note*: If no new name is provided, the new contact list will be created with the same name as the original contact list, with a “(Copy)” suffix.
                </Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleDuplicate} variant="contained">Duplicate</Button>
            </DialogActions>
        </Dialog>
    )
}

export default ModalDuplicate;