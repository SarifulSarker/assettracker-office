import React, { useEffect } from "react";
import { Modal, TextInput, Textarea, Button, Stack } from "@mantine/core";
import { useForm, yupResolver } from "@mantine/form";
import * as Yup from "yup";
import { notifications } from "@mantine/notifications";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateVendorApi } from "../../services/vendor.js";

const schema = Yup.object().shape({
  name: Yup.string().required("Vendor name is required"),
  email: Yup.string().email("Invalid email").optional(),
  contact: Yup.string().optional(),
  address: Yup.string().optional(),
  notes: Yup.string().optional(),
});

const VendorEditModal = ({ opened, onClose, vendor, onSuccess }) => {
  const queryClient = useQueryClient();

  const form = useForm({
    initialValues: {
      name: vendor?.name || "",
      email: vendor?.email || "",
      contact: vendor?.contact || "",
      address: vendor?.address || "",
      notes: vendor?.notes || "",
    },
    validate: yupResolver(schema),
  });

  useEffect(() => {
    if (vendor) {
      form.setValues({
        name: vendor.name || "",
        email: vendor.email || "",
        contact: vendor.contact || "",
        address: vendor.address || "",
        notes: vendor.notes || "",
      });
    }
  }, [vendor]);

  const editMutation = useMutation({
    mutationFn: (values) => updateVendorApi({ id: vendor.id, data: values }),
    onSuccess: (res) => {
      if (res.success) {
        notifications.show({
          title: "Updated",
          message: res.message || "Vendor updated successfully!",
          position: "top-center",
          autoClose: 3000,
        });

        queryClient.invalidateQueries(["vendors"]); // ✅ make sure query key matches list
        onClose();

        if (onSuccess) onSuccess(); // ✅ call onSuccess prop
      } else {
        notifications.show({
          title: "Failed",
          message: res.error || "Update failed",
        });
      }
    },
    onError: (error) => {
      notifications.show({
        title: "Error",
        message:
          error.response?.data?.error ||
          error.message ||
          "Something went wrong",
        position: "top-center",
      });
    },
  });

  const handleSubmit = (values) => editMutation.mutate(values);

  return (
    <Modal opened={opened} onClose={onClose} title="Edit Vendor" centered>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          <TextInput
            label="Vendor Name"
            withAsterisk
            {...form.getInputProps("name")}
          />
          <TextInput label="Email" {...form.getInputProps("email")} />
          <TextInput label="Contact" {...form.getInputProps("contact")} />
          <Textarea
            label="Address"
            autosize
            minRows={2}
            {...form.getInputProps("address")}
          />
          <Textarea
            label="Notes"
            autosize
            minRows={2}
            {...form.getInputProps("notes")}
          />
          <Button type="submit" loading={editMutation.isPending}>
            {editMutation.isPending ? "Saving..." : "Update"}
          </Button>
        </Stack>
      </form>
    </Modal>
  );
};

export default VendorEditModal;
