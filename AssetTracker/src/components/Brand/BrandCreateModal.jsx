import React from "react";
import { Modal, Button, TextInput, Stack } from "@mantine/core";
import { useForm, yupResolver } from "@mantine/form";
import * as Yup from "yup";
import { notifications } from "@mantine/notifications";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createBrandApi } from "../../services/brand.js";

const schema = Yup.object().shape({
  name: Yup.string().required("Brand name is required"),
});

const BrandCreateModal = ({ opened, onClose, onSuccess }) => {
  const queryClient = useQueryClient();

  const form = useForm({
    initialValues: { name: "" },
    validate: yupResolver(schema),
  });

  const mutation = useMutation({
    mutationFn: (values) => createBrandApi(values),
    onSuccess: (res) => {
      // Axios wraps the response inside res.data
      const response = res?.success;
     
     
      if (response) {
        // Success case
        notifications.show({
          title: "Success",
          message: res.message || "Brand created successfully default",
          position: "top-center",
          autoClose: 3000,
        });

        form.reset();
        onClose();
        queryClient.invalidateQueries(["brands"]);
        if (onSuccess) onSuccess();
      } 
      else{
       
        notifications.show({
          title: "Failed",
          message: res.message || "Brand already exits, default",
          position: "top-center",
        
        });

      
       
        queryClient.invalidateQueries(["brands"]);
     //   if (onSuccess) onSuccess();
      }
    },
    onError: (error) => {
      console.log("error============================", error);
      notifications.show({
        title: "Error",
        message: res.message || "Something went wrong",
        position: "top-center",
        autoClose: 3000,
      });
    },
  });

  const handleSubmit = (values) => {
    mutation.mutate(values);
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Create Brand" centered>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          <TextInput
            label="Brand Name"
            placeholder="Brand Name"
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

export default BrandCreateModal;
