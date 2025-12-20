import React from "react";
import { Modal, Button, TextInput, Stack, Switch } from "@mantine/core";
import { useForm, yupResolver } from "@mantine/form";
import * as Yup from "yup";
import { notifications } from "@mantine/notifications";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createDesignationApi } from "../../services/designation.js";

const schema = Yup.object({
  name: Yup.string().required("Name is required"),
  description: Yup.string().nullable(),
});

const DesignationCreateModal = ({ opened, onClose }) => {
  const queryClient = useQueryClient();

  const form = useForm({
    initialValues: {
      name: "",
      description: "",
      is_active: true,
    },
    validate: yupResolver(schema),
  });

  const mutation = useMutation({
    mutationFn: createDesignationApi,
    onSuccess: (res) => {
      if (res.success) {
        notifications.show({
          title: "Success",
          message: res.message,
          position: "top-center",
        });
        queryClient.invalidateQueries(["designations"]);
        form.reset();
        onClose();
      }
    },
  });

  return (
    <Modal opened={opened} onClose={onClose} title="Create Designation" centered>
      <form onSubmit={form.onSubmit((v) => mutation.mutate(v))}>
        <Stack>
          <TextInput label="Name" {...form.getInputProps("name")} />
          <TextInput
            label="Description"
            {...form.getInputProps("description")}
          />
          {/* <Switch
            label="Active"
            checked={form.values.is_active}
            {...form.getInputProps("is_active")}
          /> */}
          <Button type="submit" loading={mutation.isPending}>
            Create
          </Button>
        </Stack>
      </form>
    </Modal>
  );
};

export default DesignationCreateModal;
