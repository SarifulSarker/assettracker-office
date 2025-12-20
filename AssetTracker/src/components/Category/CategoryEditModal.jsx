import React, { useEffect } from "react";
import { Modal, TextInput, Button, Stack } from "@mantine/core";
import { useForm, yupResolver } from "@mantine/form";
import * as Yup from "yup";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import { updateCategoryApi } from "../../services/category.js";

// Validation schema
const schema = Yup.object().shape({
  name: Yup.string().required("Category name is required"),
});

const CategoryEditModal = ({ opened, onClose, category, onSuccess }) => {
  const queryClient = useQueryClient();

  const form = useForm({
    initialValues: { name: "" },
    validate: yupResolver(schema),
  });

  useEffect(() => {
    if (category) form.setValues({ name: category.name });
  }, [category]);

  const mutation = useMutation({
    mutationFn: (values) =>
      updateCategoryApi({ id: category.id, data: values }),
    onSuccess: () => {
      notifications.show({
        title: "Success",
        message: "Category updated successfully!",
        position: "top-center",
        autoClose: 3000,
      });
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

  if (!category) return null;

  return (
    <Modal opened={opened} onClose={onClose} title="Edit Category" centered>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          <TextInput
            label="Category Name"
            placeholder="Enter category name"
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

export default CategoryEditModal;
