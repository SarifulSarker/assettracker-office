import React, { useEffect } from "react";
import {
  Modal,
  Button,
  TextInput,
  Select,
  Stack,
  NumberInput,
  Textarea,
} from "@mantine/core";
import { useForm, yupResolver } from "@mantine/form";
import * as Yup from "yup";
import { notifications } from "@mantine/notifications";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { updateAssetApi } from "../../services/asset.js";
import { getAllCategoriesApi } from "../../services/category.js";
import { getAllBrandsApi } from "../../services/brand.js";
import { getAllVendorsApi } from "../../services/vendor.js";
import { DatePicker } from "@mantine/dates";

const schema = Yup.object().shape({
  name: Yup.string().required("Asset name is required"),
  categoryId: Yup.string().nullable(),
  brandId: Yup.string().nullable(),
  vendorId: Yup.string().nullable(),
  purchasePrice: Yup.number().nullable(),
  purchaseDate: Yup.date().nullable(),
  status: Yup.string().required("Status is required"),
  notes: Yup.string().nullable(),
});

const AssetEditModal = ({ opened, onClose, asset, onSuccess }) => {
  const queryClient = useQueryClient();

  const { data: categoryData } = useQuery({
    queryKey: ["categories", 1],
    queryFn: () => getAllCategoriesApi({ page: 1, perpage: 1000, search: "" }),
  });
  const { data: brandData } = useQuery({
    queryKey: ["brands", 1],
    queryFn: () => getAllBrandsApi({ page: 1, perpage: 1000, search: "" }),
  });
  const { data: vendorData } = useQuery({
    queryKey: ["vendors", 1],
    queryFn: () => getAllVendorsApi({ page: 1, perpage: 1000, search: "" }),
  });

  const categories = categoryData?.data?.categories || [];
  const brands = brandData?.data?.brands || [];
  const vendors = vendorData?.data?.vendors || [];

  const form = useForm({
    initialValues: {
      name: "",
      categoryId: null,
      brandId: null,
      vendorId: null,
      purchasePrice: null,
      purchaseDate: null,
      status: "in-stock",
      notes: "",
    },
    validate: yupResolver(schema),
  });

  useEffect(() => {
    if (asset) {
      form.setValues({
        name: asset.name || "",
        categoryId: asset.categoryId?.toString() || null,
        brandId: asset.brandId?.toString() || null,
        vendorId: asset.vendorId?.toString() || null,
        purchasePrice: asset.purchasePrice || null,
        purchaseDate: asset.purchaseDate ? new Date(asset.purchaseDate) : null,
        status: asset.status || "in-stock",
        notes: asset.notes || "",
      });
    }
  }, [asset]);

  const mutation = useMutation({
    mutationFn: (values) => updateAssetApi({ id: asset.id, data: values }),
    onSuccess: (res) => {
      if (res?.success) {
        notifications.show({
          title: "Success",
          message: res.message || "Asset updated",
          position: "top-center",
        });
        onClose();
        queryClient.invalidateQueries(["assets"]);
        onSuccess?.();
      } else {
        notifications.show({
          title: "Failed",
          message: res?.message || "Update failed",
          position: "top-center",
        });
      }
    },
    onError: (err) =>
      notifications.show({
        title: "Error",
        message: err?.message || "Something went wrong",
        position: "top-center",
      }),
  });

  const handleSubmit = (values) => {
    const payload = {
      ...values,
      purchaseDate: values.purchaseDate
        ? dayjs(values.purchaseDate).toISOString()
        : null,
    };
    mutation.mutate(payload);
  };
  return (
    <Modal opened={opened} onClose={onClose} title="Edit Asset" centered>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          <TextInput
            label="Asset Name"
            withAsterisk
            {...form.getInputProps("name")}
          />

          <Select
            label="Category"
            placeholder="Select Category"
            data={categories.map((c) => ({
              value: c.id.toString(),
              label: c.name,
            }))}
            {...form.getInputProps("categoryId")}
          />

          <Select
            label="Brand"
            placeholder="Select Brand"
            data={brands.map((b) => ({
              value: b.id.toString(),
              label: b.name,
            }))}
            {...form.getInputProps("brandId")}
          />

          <Select
            label="Vendor"
            placeholder="Select Vendor"
            data={vendors.map((v) => ({
              value: v.id.toString(),
              label: v.name,
            }))}
            {...form.getInputProps("vendorId")}
          />

          <NumberInput
            label="Purchase Price"
            {...form.getInputProps("purchasePrice")}
            min={0}
          />
          <DatePicker
            label="Purchase Date"
            placeholder="Pick a date"
            value={
              form.values.purchaseDate
                ? new Date(form.values.purchaseDate)
                : null
            }
            onChange={(date) => form.setFieldValue("purchaseDate", date)}
          />

          <Select
            label="Status"
            placeholder="Select status"
            data={[
              { value: "in-stock", label: "In Stock" },
              { value: "assigned", label: "Assigned" },
              { value: "broken", label: "Broken" },
            ]}
            {...form.getInputProps("status")}
          />

          <Textarea label="Notes" {...form.getInputProps("notes")} />

          <Button type="submit" loading={mutation.isPending}>
            {mutation.isPending ? "Saving..." : "Update"}
          </Button>
        </Stack>
      </form>
    </Modal>
  );
};

export default AssetEditModal;
