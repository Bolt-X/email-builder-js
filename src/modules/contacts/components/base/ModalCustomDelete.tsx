import { Close } from "@mui/icons-material"
import { Button, Dialog, DialogActions, DialogContent, IconButton, Stack, Typography } from "@mui/material"

const ModalCustomDelete = ({ open, onClose, onOk, title, content, isPending }: { open: boolean, onClose: () => void, onOk: () => void, title: string, content: React.ReactNode, isPending: boolean }) => {
    return (
        <Dialog open={open} onClose={onClose}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" px={2} py={1} borderBottom={1} borderColor="divider">
                <Typography variant="h6">{title}</Typography>
                <IconButton onClick={onClose} disabled={isPending}>
                    <Close />
                </IconButton>
            </Stack>
            <DialogContent>
                {content}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} variant="outlined" disabled={isPending}>{"Cancel"}</Button>
                <Button onClick={onOk} variant="contained" color="error" disabled={isPending}>{isPending ? "Deleting..." : "Delete"}</Button>
            </DialogActions>
        </Dialog>
    )
}

export default ModalCustomDelete;