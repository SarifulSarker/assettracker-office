import React, { useEffect } from "react";
import { Modal, TextInput, Button, Stack } from "@mantine/core";
import { useForm, yupResolver } from "@mantine/form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import * as Yup from "yup";
import { updateDepartmentApi } from "../../services/department";

// Validation schema
const schema = Yup.object().shape({
  name: Yup.string().required("Department name is required"),
});

const DepartmentEditModal = ({ opened, onClose, department, onSuccess }) => {
  const queryClient = useQueryClient();

  // Form setup
  const form = useForm({
    initialValues: { name: department?.name || "" },
    validate: yupResolver(schema),
  });

  // Update form values when department changes
  useEffect(() => {
    if (department) {
      form.setValues({ name: department.name });
    }
  }, [department]);

  // Mutation
  const editMutation = useMutation({
    mutationFn: (values) =>
      updateDepartmentApi({ id: department.id, data: values }),
    onSuccess: (res) => {
      if (res.success) {
        notifications.show({
          title: "Success",
          message: res.message || "Department updated successfully!",
          position: "top-center",
          autoClose: 3000,
        });
        queryClient.invalidateQueries(["departments"]); // invalidate query so data refreshes
        onClose();
        if (onSuccess) onSuccess();
      } else {
        notifications.show({
          title: "Failed",
          message: res.error || "Update failed",
          position: "top-center",
        });
      }
    },
    onError: (err) => {
      notifications.show({
        title: "Error",
        message: err.response?.data?.error || "Something went wrong",
        position: "top-center",
      });
    },
  });

  // Submit handler
  const handleSubmit = (values) => editMutation.mutate(values);


  return (
    <Modal opened={opened} onClose={onClose} title="Edit Department" centered>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          <TextInput
            label="Department Name"
            placeholder="Enter department name"
            withAsterisk
            {...form.getInputProps("name")}
          />

          <Button type="submit" loading={editMutation.isPending}>
          
            {editMutation.isPending ? "Saving..." : "Update"}
          </Button>
        </Stack>
      </form>
    </Modal>
  );
};

export default DepartmentEditModal;
