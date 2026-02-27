import { Close } from "@mui/icons-material";
import { Box, Button, Dialog, DialogActions, DialogContent, IconButton, Stack, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { useDuplicateContactList } from "../../../../hooks/useContactLists";

const ModalDuplicate = ({ open, onClose, slug }: { open: boolean, onClose: () => void, slug: string }) => {
    const [newName, setNewName] = useState<string>("");

    const { mutateAsync: duplicateContactList, isPending } = useDuplicateContactList();

    const handleDuplicate = async () => {
        try {
            await duplicateContactList({ slug, newName });
        } catch (error) {
            console.error("Error duplicating contact list:", error);
        }
        finally {
            onClose();
        }
    }
    return (
        <Dialog open={open} onClose={onClose}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" px={2} py={1} borderBottom={1} borderColor="divider">
                <Typography variant="h6">Duplicate Contact List</Typography>
                <IconButton onClick={onClose} disabled={isPending}>
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
                <Typography sx={{ color: "red" }}>
                    Note*: If no new name is provided, the new contact list will be created with the same name as the original contact list, with a “(Copy)” suffix.
                </Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleDuplicate} variant="contained" disabled={isPending}>{isPending ? "Duplicating..." : "Duplicate"}</Button>
            </DialogActions>
        </Dialog>
    )
}

export default ModalDuplicate;