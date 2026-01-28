import React, { useEffect } from "react";
import { Modal, Button, TextInput, Stack } from "@mantine/core";
import { useForm, yupResolver } from "@mantine/form";
import * as Yup from "yup";
import { notifications } from "@mantine/notifications";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateBrandApi } from "../../services/brand.js";

const schema = Yup.object().shape({
  name: Yup.string()
    .required("Brand name is required")
    .min(2, "Designation must be at least 2 characters")
    .max(80, "Designation cannot exceed 50 characters")
    .matches(/^[A-Za-z\s]+$/, "Name can only contain letters and spaces"),
});

const BrandEditModal = ({ opened, onClose, brand, onSuccess }) => {
  const queryClient = useQueryClient();

  const form = useForm({
    initialValues: { name: "" },
    validate: yupResolver(schema),
  });

  useEffect(() => {
    if (brand) {
      form.setValues({ name: brand.name });
    }
  }, [brand, opened]);
  const handleClose = () => {
    form.reset(); // Reset form to initialValues
    onClose();
  };
  const mutation = useMutation({
    mutationFn: (values) => updateBrandApi({ id: brand.id, data: values }),
    onSuccess: () => {
      notifications.show({
        title: "Success",
        message: "Brand updated successfully",
        position: "top-center",
      });
      onClose();
      queryClient.invalidateQueries(["brands"]);
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      notifications.show({
        title: "Error",
        message: error.response?.data?.message || "Something went wrong",
        position: "top-center",
      });
    },
  });

  const handleSubmit = (values) => {
    mutation.mutate(values);
  };

  return (
    <Modal opened={opened} onClose={handleClose} title="Edit Brand" centered>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          <TextInput
            label="Brand Name"
            placeholder="Brand Name"
            {...form.getInputProps("name")}
          />
          <Button type="submit" loading={mutation.isPending}>
            {mutation.isPending ? "Saving..." : "Update"}
          </Button>
        </Stack>
      </form>
    </Modal>
  );
};

export default BrandEditModal;
