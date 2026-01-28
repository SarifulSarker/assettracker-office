import React from "react";
import { Modal, TextInput, Button, Stack } from "@mantine/core";
import { useForm, yupResolver } from "@mantine/form";
import * as Yup from "yup";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import { createCategoryApi } from "../../services/category.js";

// Validation schema
const schema = Yup.object().shape({
  name: Yup.string()
    .required("Category name is required")
    .required("Department name is required")
    .min(2, "Designation must be at least 2 characters")
    .max(80, "Designation cannot exceed 50 characters")
    .matches(/^[A-Za-z\s]+$/, "Name can only contain letters and spaces"),
});

const CategoryCreateModal = ({ opened, onClose, onSuccess }) => {
  const queryClient = useQueryClient();

  const form = useForm({
    initialValues: { name: "" },
    validate: yupResolver(schema),
  });

  const mutation = useMutation({
    mutationFn: (values) => createCategoryApi(values),
    onSuccess: () => {
      notifications.show({
        title: "Success",
        message: "Category created successfully!",
        position: "top-center",
        autoClose: 3000,
      });
      form.reset();
      onClose();
      queryClient.invalidateQueries(["categories"]);
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      const msg = error.response?.data?.message || "Something went wrong";
      notifications.show({
        title: "Error",
        message: msg,
        position: "top-center",
      });
    },
  });

  const handleSubmit = (values) => {
    mutation.mutate(values);
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Create Category" centered>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          <TextInput
            label="Category Name"
            placeholder="Enter category name"
            {...form.getInputProps("name")}
          />
          <Button type="submit" loading={mutation.isPending}>
            Create
          </Button>
        </Stack>
      </form>
    </Modal>
  );
};

export default CategoryCreateModal;
