import React, { useEffect } from "react";
import { Modal, Button, TextInput, Stack, Switch } from "@mantine/core";
import { useForm, yupResolver } from "@mantine/form";
import * as Yup from "yup";
import { notifications } from "@mantine/notifications";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateDesignationApi } from "../../services/designation.js";

const schema = Yup.object({
  name: Yup.string().required(),
});

const DesignationEditModal = ({ opened, onClose, designation }) => {
  const queryClient = useQueryClient();

  const form = useForm({
    initialValues: {
      name: "",
      description: "",
      is_active: true,
    },
    validate: yupResolver(schema),
  });

  useEffect(() => {
    if (designation) {
      form.setValues({
        name: designation.name,
        description: designation.description || "",
        is_active: designation.is_active,
      });
    }
  }, [designation]);

  const mutation = useMutation({
    mutationFn: (values) =>
      updateDesignationApi({ id: designation.id, data: values }),
    onSuccess: (res) => {
      if (res.success) {
        notifications.show({
          title: "Updated",
          message: res.message,
          position: "top-center",
        });
        queryClient.invalidateQueries(["designations"]);
        onClose();
      }
    },
  });

  return (
    <Modal opened={opened} onClose={onClose} title="Edit Designation" centered>
      <form onSubmit={form.onSubmit((v) => mutation.mutate(v))}>
        <Stack>
          <TextInput label="Name" {...form.getInputProps("name")} />
          <TextInput
            label="Description"
            {...form.getInputProps("description")}
          />
          <Switch
            label="Active"
            checked={form.values.is_active}
            {...form.getInputProps("is_active")}
          />
          <Button type="submit" loading={mutation.isPending}>
            Update
          </Button>
        </Stack>
      </form>
    </Modal>
  );
};

export default DesignationEditModal;
