import React, { useEffect } from "react";
import { Modal, TextInput, Button, Stack, Select } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import { updateCategoryApi } from "../../services/category";

const SubCategoryEditModal = ({ opened, onClose, subcategory, categories }) => {
  const queryClient = useQueryClient();

  const form = useForm({
    initialValues: {
      name: "",
      parentId: "",
    },
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
