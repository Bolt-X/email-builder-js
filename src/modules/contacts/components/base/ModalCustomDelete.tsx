import { Close } from "@mui/icons-material"
import { Button, Dialog, DialogActions, DialogContent, IconButton, Stack, Typography } from "@mui/material"

const ModalCustomDelete = ({open, onClose, onOk, title, content}: {open: boolean, onClose: () => void, onOk: () => void, title: string, content: React.ReactNode}) => {
    return (
        <Dialog open={open} onClose={onClose}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" px={2} py={1} borderBottom={1} borderColor="divider">
                <Typography variant="h6">{title}</Typography>
                <IconButton onClick={onClose}>
                    <Close />
                </IconButton>
            </Stack>
            <DialogContent>
                {content}
            </DialogContent>
            <DialogActions>
                <Button onClick={onOk} variant="contained" color="error">Delete</Button>
            </DialogActions>
        </Dialog>
    )
}

export default ModalCustomDelete;