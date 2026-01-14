import React, { useEffect } from "react";
import { Modal, Button, TextInput, Stack, Select } from "@mantine/core";
import { useForm, yupResolver } from "@mantine/form";
import * as Yup from "yup";
import { notifications } from "@mantine/notifications";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { updateEmployeeApi } from "../../services/employee.js";
import { getAllDepartmentsApi } from "../../services/department.js";
import { getAllDesignationsApi } from "../../services/designation.js";

const schema = Yup.object().shape({
  fullName: Yup.string().required("Full name is required"),
  email: Yup.string().email("Invalid email").nullable(),
  phone: Yup.string().nullable(),
  designationId: Yup.string().nullable(),
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
  const { data: designationData } = useQuery({
    queryKey: ["designations", 1],
    queryFn: () =>
      getAllDesignationsApi({
        page: 1,
        pageSize: 1000,
        search: "",
      }),
  });

  const designations = designationData?.data?.designations || [];
  const departments = deptData?.data?.departments || [];

  // Form setup
  const form = useForm({
    initialValues: {
      fullName: "",
      email: "",
      phone: "",
      designationId: null,

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
        designationId: employee.designationId
          ? employee.designationId.toString()
          : null,
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
          designationId: values.designationId
            ? Number(values.designationId)
            : null,
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

          <Select
            allowDeselect={false}
            label="Designation"
            placeholder="Select designation"
            data={designations.map((d) => ({
              value: d.id.toString(),
              label: d.name,
            }))}
            {...form.getInputProps("designationId")}
          />

          <Select
            allowDeselect={false}
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
