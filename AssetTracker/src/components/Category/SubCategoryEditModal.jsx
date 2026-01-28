import React, { useEffect } from "react";
import { Modal, TextInput, Button, Stack, Select } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import { updateCategoryApi } from "../../services/category";
import {  yupResolver } from "@mantine/form";
import * as Yup from "yup";

const schema = Yup.object().shape({
  parentId: Yup.string().required("Category is required"),
  name: Yup.string()
    .required("Subcategory name is required")
    .required("Department name is required")
    .min(2, "Designation must be at least 2 characters")
    .max(80, "Designation cannot exceed 50 characters")
    .matches(/^[A-Za-z\s]+$/, "Name can only contain letters and spaces"),
});
const SubCategoryEditModal = ({ opened, onClose, subcategory, categories }) => {
  const queryClient = useQueryClient();

  const form = useForm({
    initialValues: {
      name: "",
      parentId: "",
    },
    validate: yupResolver(schema),
  });

  useEffect(() => {
    if (subcategory) {
      form.setValues({
        name: subcategory.name,
        parentId: String(subcategory.parentId), // ✅ string
      });
    }
  }, [subcategory]);

  const mutation = useMutation({
    mutationFn: (values) =>
      updateCategoryApi({
        id: subcategory.id,
        data: {
          name: values.name,
          parentId: Number(values.parentId), // ✅ back to number
        },
      }),

    onSuccess: () => {
      notifications.show({
        title: "Updated",
        message: "Subcategory updated successfully",
        position: "top-center",
      });
      onClose();
      queryClient.invalidateQueries(["categories"]);
    },
  });

  if (!subcategory) return null;

  return (
    <Modal opened={opened} onClose={onClose} title="Edit Subcategory" centered>
      <form onSubmit={form.onSubmit((v) => mutation.mutate(v))}>
        <Stack>
          <TextInput label="Subcategory Name" {...form.getInputProps("name")} />

          <Select
            label="Parent Category"
            data={categories.map((c) => ({
              value: String(c.id), // ✅ must be string
              label: c.name,
            }))}
            {...form.getInputProps("parentId")}
          />

          <Button type="submit" loading={mutation.isPending}>
            Update
          </Button>
        </Stack>
      </form>
    </Modal>
  );
};

export default SubCategoryEditModal;
