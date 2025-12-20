import React, { useEffect, useState } from "react";
import { Modal, TextInput, Button, Stack, Textarea } from "@mantine/core";
import { useForm, yupResolver } from "@mantine/form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import * as Yup from "yup";

import { createVendorApi } from "../../services/vendor"; // ← তোমার API helper

// Validation schema
const schema = Yup.object().shape({
  name: Yup.string().required("Vendor name is required"),
  email: Yup.string().email("Invalid email").optional(),
  contact: Yup.string().optional(),
  address: Yup.string().optional(),
  notes: Yup.string().optional(),
});

const VendorCreateModal = ({ opened, onClose }) => {
 
  const queryClient = useQueryClient();

 
  const form = useForm({
    initialValues: {
      name: "",
      email: "",
      contact: "",
      address: "",
      notes: "",
    },
    validate: yupResolver(schema),
  });

  const createMutation = useMutation({
    mutationFn: (values) => createVendorApi(values),
    onSuccess: (res) => {
      if (res.success) {
        notifications.show({
          title: "Success",
          message: res.message || "Vendor created successfully",
          position: "top-center",
          autoClose: 3000,
        });
        form.reset();
        onClose();
        queryClient.invalidateQueries(["vendor"]);
      } else {
        notifications.show({
          title: "Failed",
          message: res.error || "Vendor already exists",
          position: "top-center",
          autoClose: 3000,
        });
      }
    },
    onError: () => {
      notifications.show({
        title: "Error",
        message: "Something went wrong",
        position: "top-center",
      });
    },
  });

  const handleSubmit = (values) => createMutation.mutate(values);

  return (
    <Modal opened={opened} onClose={onClose} title="Create Vendor" centered>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>

          <TextInput label="Vendor Name" withAsterisk {...form.getInputProps("name")} />

          <TextInput label="Email" {...form.getInputProps("email")} />

          <TextInput label="Contact" {...form.getInputProps("contact")} />

          <Textarea label="Address" autosize minRows={2} {...form.getInputProps("address")} />

          <Textarea label="Notes" autosize minRows={2} {...form.getInputProps("notes")} />

          <Button type="submit" loading={createMutation.isLoading}>
            Create Vendor
          </Button>
        </Stack>
      </form>
    </Modal>
  );
};

export default VendorCreateModal;
