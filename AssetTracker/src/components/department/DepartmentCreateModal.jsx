import React, { useEffect, useState } from "react";
import { Modal, TextInput, Button, Stack } from "@mantine/core";
import { useForm, yupResolver } from "@mantine/form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import * as Yup from "yup";
import { getCookie } from "../../helpers/Cookie";
import { createDepartmentApi } from "../../services/department.js"; // ✅ import API helper

// Validation schema
const schema = Yup.object().shape({
  name: Yup.string().required("Department name is required"),
});

const DepartmentCreateModal = ({ opened, onClose, page }) => {
 
  const queryClient = useQueryClient();

 
  const form = useForm({
    initialValues: { name: "" },
    validate: yupResolver(schema),
  });

  // Use mutation with the API helper
const createMutation = useMutation({
  mutationFn: (values) => createDepartmentApi(values),
 onSuccess: (res) => {
       // Axios wraps the response inside res.data
       const response = res?.success;
     //  console.log(response)
      
       if (response) {
         // Success case
         notifications.show({
           title: "Success",
           message: res.message || "Department created successfully default",
           position: "top-center",
           autoClose: 3000,
         });
 
         form.reset();
         onClose();
         queryClient.invalidateQueries(["department"]);
         if (onSuccess) onSuccess();
       } 
       else{
        
         notifications.show({
           title: "Failed",
           message: res.message || "Department already exits, default",
           position: "top-center",
         
         });
 
       
        
         queryClient.invalidateQueries(["department"]);
      //   if (onSuccess) onSuccess();
       }
     },
     onError: (error) => {
    //   console.log("error============================", error);
       notifications.show({
         title: "Error",
         message: res.message || "Something went wrong",
         position: "top-center",
         autoClose: 3000,
       });
     },
});


  const handleSubmit = (values) => createMutation.mutate(values);

  return (
    <Modal opened={opened} onClose={onClose} title="Create Department" centered>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          <TextInput
            label="Department Name"
            placeholder="Enter department name"
            withAsterisk
            {...form.getInputProps("name")}
          />
          <Button type="submit" loading={createMutation.isLoading}>
            Create
          </Button>
        </Stack>
      </form>
    </Modal>
  );
};

export default DepartmentCreateModal;
