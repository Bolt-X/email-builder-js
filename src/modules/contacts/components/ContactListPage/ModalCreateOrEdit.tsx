import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useCreateContactList, useUpdateContactList } from "../../../../hooks/useContactLists";
import { yupResolver } from "@hookform/resolvers/yup";

import * as yup from "yup";
import { useForm } from "react-hook-form";
import { Close } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import i18n from "../../../../i18n";

const createContactListSchema = yup.object().shape({
  name: yup.string().required("Name is required"),
  description: yup.string().nullable(),
});

const ModalCreateOrEditContactList = ({
  open,
  onClose,
  dataContactList,
}: {
  open: boolean;
  onClose: () => void;
  dataContactList?: any;
}) => {
  const navigate = useNavigate();
  const form = useForm({
    resolver: yupResolver(createContactListSchema),
  });

  const mutateCreateContactList = useCreateContactList();
  const mutateUpdateContactList = useUpdateContactList();

  const onSubmit = async (
    data: yup.InferType<typeof createContactListSchema>,
  ) => {
    try {
      if (dataContactList) {
        await mutateUpdateContactList.mutateAsync({
          slug: dataContactList.slug, payload: data
        });
        toast.success(i18n.t("contacts.update_success"));
      } else {
        const res = await mutateCreateContactList.mutateAsync(data);
        if (res) {
          navigate(`/contacts/${res.slug}`);
          toast.success(i18n.t("contacts.create_success"));
        }
      }
    } catch (error) {
      console.error("Failed to create contact list:", error);
      toast.error(i18n.t("contacts.create_error"));
    } finally {
      onClose();
      form.reset();
    }
  };

  useEffect(() => {
    if (dataContactList) {
      form.reset({
        name: dataContactList.name,
        description: dataContactList.description,
      });
    }
  }, [dataContactList]);

  useEffect(() => {
    if (!open) {
      form.reset();
    }
  }, [open]);

  return (
    <Dialog open={open} onClose={() => {
      onClose();
    }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        px={2}
        py={1}
        borderBottom={1}
        borderColor="divider"
      >
        <Typography variant="h6">{dataContactList ? "Edit Contact List" : "Create Contact List"}</Typography>
        <IconButton onClick={onClose}>
          <Close />
        </IconButton>
      </Stack>
      <DialogContent>
        <form>
          <Box mb={2}>
            <Typography>
              Name <span className="text-red-500">*</span>
            </Typography>
            <TextField
              fullWidth
              {...form.register("name")}
              error={!!form.formState.errors.name}
              helperText={form.formState.errors.name?.message}
              size="small"
            />
          </Box>
          <Box>
            <Typography>Description</Typography>
            <TextField
              fullWidth
              {...form.register("description")}
              multiline
              rows={4}
              size="small"
            />
          </Box>
        </form>
      </DialogContent>
      <DialogActions>
        <Button
          type="submit"
          form="create-contact-list-form"
          onClick={form.handleSubmit(onSubmit)}
          variant="contained"
          sx={{ height: "40px" }}
        >
          {dataContactList ? "Update" : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ModalCreateOrEditContactList;
