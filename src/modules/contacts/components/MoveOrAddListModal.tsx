import { Autocomplete, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, MenuItem, Select, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { useGetAllContactLists } from "../../../hooks/useContactLists";
import { useNavigate } from "react-router-dom";
import { addContactToList, moveContactToList } from "../../../services/contact";

interface MoveOrAddListModalProps {
    open: boolean;
    onClose: () => void;
    type: "move" | "add";
    contactIds: (string | number)[];
    oldListId?: string; // ID của list hiện tại (cần cho move)
    onSuccess?: () => void;
}

const MoveOrAddListModal = ({
    open,
    onClose,
    type,
    contactIds,
    oldListId,
    onSuccess
}: MoveOrAddListModalProps) => {
    const [selectedList, setSelectedList] = useState<any | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { data: contactLists } = useGetAllContactLists();

    const handleMove = async () => {
        if (!selectedList || !oldListId) {
            alert("Please select a list and ensure old list ID is provided");
            return;
        }

        setIsLoading(true);
        try {
            // Move từng contact
            for (const contactId of contactIds) {
                await moveContactToList(
                    contactId.toString(),
                    selectedList.slug,
                    oldListId
                );
            }
            onSuccess?.();
            onClose();
            setSelectedList(null);
        } catch (error) {
            console.error("Error moving contacts:", error);
            alert("Failed to move contacts. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }

    const handleAdd = async () => {
        if (!selectedList) {
            alert("Please select a list");
            return;
        }

        setIsLoading(true);
        try {
            // TODO: Implement add to list (không xóa khỏi list cũ)
            // Có thể tạo hàm addContactToList riêng
            await addContactToList(contactIds as string[], selectedList.slug);
            onSuccess?.();
            onClose();
            setSelectedList(null);
        } catch (error) {
            console.error("Error adding contacts:", error);
            alert("Failed to add contacts. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Move or add to list</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Select the list to move the contact to.
                </DialogContentText>
                <Autocomplete
                    size="small"
                    options={contactLists.filter((list) => list.slug !== oldListId) ?? []}
                    getOptionLabel={(option) => option.name}
                    isOptionEqualToValue={(option, value) => {
                        const optionSlug = option?.slug || option;
                        const valueSlug = value?.slug || value;
                        return optionSlug === valueSlug;
                    }}
                    value={selectedList}
                    onChange={(_, newValue) =>
                        setSelectedList(newValue)
                    }
                    renderTags={() => null}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            variant="outlined"
                            placeholder="Select contact list"
                        />
                    )}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={isLoading}>Cancel</Button>
                <Button
                    onClick={type === "move" ? handleMove : handleAdd}
                    variant="contained"
                    color="primary"
                    disabled={!selectedList || isLoading}
                >
                    {isLoading ? "Processing..." : type === "move" ? "Move to list" : "Add to list"}
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default MoveOrAddListModal;