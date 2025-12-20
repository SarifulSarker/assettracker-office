import React, { useEffect } from "react";
import { Modal, Button, TextInput, Stack, Select } from "@mantine/core";
import { useForm, yupResolver } from "@mantine/form";
import * as Yup from "yup";
import { notifications } from "@mantine/notifications";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { updateEmployeeApi } from "../../services/employee.js";
import { getAllDepartmentsApi } from "../../services/department.js";

const schema = Yup.object().shape({
  fullName: Yup.string().required("Full name is required"),
  email: Yup.string().email("Invalid email").nullable(),
  phone: Yup.string().nullable(),
  designation: Yup.string().nullable(),
  departmentId: Yup.string().nullable(),
});

const EmployeeEditModal = ({ opened, onClose, employee, onSuccess }) => {
  const queryClient = useQueryClient();

  // Load departments (React Query v5)
  const { data: deptData } = useQuery({
    queryKey: ["departments", 1],
    queryFn: () =>
      getAllDepartmentsApi({
        page: 1,
        pageSize: 1000,
        search: "",
      }),
  });

  const departments = deptData?.data?.departments || [];

  // Form setup
  const form = useForm({
    initialValues: {
      fullName: "",
      email: "",
      phone: "",
      designation: "",
      departmentId: null,
    },
    validate: yupResolver(schema),
  });

  // Fill form when modal opens
  useEffect(() => {
    if (employee) {
      form.setValues({
        fullName: employee.fullName || "",
        email: employee.email || "",
        phone: employee.phone || "",
        designation: employee.designation || "",
        departmentId: employee.departmentId
          ? employee.departmentId.toString()
          : null,
      });
    }
  }, [employee]);

  // Mutation
  const mutation = useMutation({
    mutationFn: (values) =>
      updateEmployeeApi({
        id: employee.id,
        data: {
          ...values,
          departmentId: values.departmentId
            ? Number(values.departmentId)
            : null,
        },
      }),

    onSuccess: (res) => {
      if (res?.success) {
        notifications.show({
          title: "Success",
          message: res.message || "Employee updated successfully",
          position: "top-center",
        });

        queryClient.invalidateQueries(["employees"]);
        onClose();
        if (onSuccess) onSuccess();
      } else {
        notifications.show({
          title: "Failed",
          message: res?.message || "Update failed",
          position: "top-center",
        });
      }
    },

    onError: (err) => {
      notifications.show({
        title: "Error",
        message: err?.response?.data?.message || "Something went wrong",
        position: "top-center",
      });
    },
  });

  const handleSubmit = (values) => mutation.mutate(values);

  return (
    <Modal opened={opened} onClose={onClose} title="Edit Employee" centered>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          <TextInput
            label="Full Name"
            withAsterisk
            {...form.getInputProps("fullName")}
          />

          <TextInput label="Email" {...form.getInputProps("email")} />

          <TextInput label="Phone" {...form.getInputProps("phone")} />

          <TextInput label="Designation" {...form.getInputProps("designation")} />

          <Select
            label="Department"
            placeholder="Select department"
            data={departments.map((d) => ({
              value: d.id.toString(),
              label: d.name,
            }))}
            {...form.getInputProps("departmentId")}
          />

          <Button type="submit" loading={mutation.isPending}>
            {mutation.isPending ? "Saving..." : "Update"}
          </Button>
        </Stack>
      </form>
    </Modal>
  );
};

export default EmployeeEditModal;
