import React from "react";
import { Modal, TextInput, Button, Stack, Select } from "@mantine/core";
import { useForm, yupResolver } from "@mantine/form";
import * as Yup from "yup";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import { createCategoryApi, getAllCategoriesApi } from "../../services/category";

// Validation schema
const schema = Yup.object().shape({
  parentId: Yup.string().required("Category is required"),
  name: Yup.string().required("Subcategory name is required"),
});

const SubCategoryCreateModal = ({ opened, onClose, onSuccess }) => {
  const queryClient = useQueryClient();

  // Load existing categories
  const { data } = useQuery({
    queryKey: ["categories_for_sub"],
    queryFn: getAllCategoriesApi,
  });

// Make sure categories is always an array
const categories = data?.data?.categories || []; // ✅

  const categoryOptions =
    categories?.map((cat) => ({
      label: cat.name,
      value: cat.id.toString(),
    })) || [];

  const form = useForm({
    initialValues: {
      parentId: "",
      name: "",
    },
    validate: yupResolver(schema),
  });

  const mutation = useMutation({
    mutationFn: (values) =>
      createCategoryApi({
        name: values.name,
        parentId: Number(values.parentId), // important
      }),
    onSuccess: () => {
      notifications.show({
        title: "Success",
        message: "Subcategory created successfully!",
        position: "top-center",
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
    <Modal opened={opened} onClose={onClose} title="Create Subcategory" centered>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          {/* Select Category */}
          <Select
            label="Select Category"
            placeholder="Choose category"
            data={categoryOptions}
            {...form.getInputProps("parentId")}
          />

          {/* Subcategory name */}
          <TextInput
            label="Subcategory Name"
            placeholder="Enter subcategory name"
            {...form.getInputProps("name")}
          />

          <Button type="submit" loading={mutation.isLoading}>
            Create
          </Button>
        </Stack>
      </form>
    </Modal>
  );
};

export default SubCategoryCreateModal;
