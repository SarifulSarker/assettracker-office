import React, { useState } from "react";
import {
  Stack,
  Paper,
  Text,
  TextInput,
  Select,
  Button,
  Textarea,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import PageTop from "../../components/global/PageTop.jsx";
import { createAssetApi } from "../../services/asset.js";
import { getAllBrandsApi } from "../../services/brand.js";
import { getAllVendorsApi } from "../../services/vendor.js";
import { getAllCategoriesApi } from "../../services/category.js";
import RichTextInput from "../../helpers/RichTextInput.jsx";
import FileUploadArea from "../../components/Asset/FileUploadArea.jsx";

const AssetCreate = () => {
  const navigate = useNavigate();
  const [subcategories, setSubcategories] = useState([]);
  const [images, setImages] = useState([]);

  /* -------------------- QUERIES -------------------- */
  const { data: CategoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: () => getAllCategoriesApi({ page: 1, perpage: 1000, search: "" }),
  });

  const { data: BrandsData } = useQuery({
    queryKey: ["brands"],
    queryFn: () => getAllBrandsApi({ page: 1, pageSize: 1000, search: "" }),
  });

  const { data: VendorsData } = useQuery({
    queryKey: ["vendors"],
    queryFn: () => getAllVendorsApi({ page: 1, perpage: 1000, search: "" }),
  });

  const categories = CategoriesData?.data?.categories || [];
  const brands = BrandsData?.data?.brands || [];
  const vendors = VendorsData?.data?.vendors || [];

  /* -------------------- FORM -------------------- */
  const form = useForm({
    initialValues: {
      name: "",
      categoryId: "",
      subCategoryId: "",
      brandId: "",
      vendorId: "",
      purchasePrice: "",
      purchaseDate: null,
      specs: "",
      status: "instock",
      notes: "",
    },
    validate: {
      name: (v) => (!v ? "Asset name is required" : null),
      categoryId: (v) => (!v ? "Category is required" : null),
      brandId: (v) => (!v ? "Brand is required" : null),
      vendorId: (v) => (!v ? "Vendor is required" : null),
      purchaseDate: (v) => (!v ? "Purchase date is required" : null),
    },
  });

  /* -------------------- MUTATION -------------------- */
  const createMutation = useMutation({
    mutationFn: (values) => {
      const formData = new FormData();

      formData.append("name", values.name);
      formData.append("categoryId", Number(values.categoryId));
      formData.append(
        "subCategoryId",
        values.subcategoryId ? Number(values.subcategoryId) : "",
      );
      formData.append("brandId", Number(values.brandId));
      formData.append("vendorId", Number(values.vendorId));
      formData.append("status", values.status);
      formData.append("specs", values.specs || "");
      formData.append("notes", values.notes || "");

      if (values.purchasePrice)
        formData.append("purchasePrice", values.purchasePrice);

      if (values.purchaseDate) {
        const date =
          values.purchaseDate instanceof Date
            ? values.purchaseDate
            : new Date(values.purchaseDate);
        formData.append("purchaseDate", date.toISOString());
      }

      images.forEach((file) => formData.append("images", file));

      return createAssetApi(formData);
    },
    onSuccess: () => {
      notifications.show({
        title: "Success",
        message: "Asset created successfully",
        color: "green",
        position: "top-center",
      });
      navigate("/assets");
    },
    onError: (error) => {
      notifications.show({
        title: "Error",
        message: error?.response?.data?.message || "Something went wrong",
        color: "red",
        position: "top-center",
      });
    },
  });

  /* -------------------- HANDLERS -------------------- */
  const handleCategoryChange = (value) => {
    form.setFieldValue("categoryId", value);
    form.setFieldValue("subcategoryId", ""); // reset subcategory
    const category = categories.find((c) => c.id.toString() === value);
    setSubcategories(category?.children || []);
  };

  return (
    <>
      <PageTop PAGE_TITLE="Create Asset" backBtn />

      <Stack maw={600} mx="auto">
        <Paper p="xl" shadow="md" withBorder radius="lg">
          <Text fw={700} size="xl" mb="md">
            Create New Asset
          </Text>

          <form onSubmit={form.onSubmit((v) => createMutation.mutate(v))}>
            <Stack spacing="md">
              <FileUploadArea images={images} setImages={setImages} />

              <TextInput
                label="Asset Name"
                withAsterisk
                {...form.getInputProps("name")}
              />

              <Textarea
                resize="vertical"
                label="Specifications"
                placeholder="e.g. 8GB / Intel i5 / 512GB SSD"
                {...form.getInputProps("specs")}
              />

              <Select
                label="Category"
                withAsterisk
                data={categories.map((c) => ({
                  value: c.id.toString(),
                  label: c.name,
                }))}
                value={form.values.categoryId}
                onChange={handleCategoryChange}
                error={form.errors.categoryId}
              />

              <Select
                allowDeselect={false}
                label="Subcategory"
                disabled={!form.values.categoryId || subcategories.length === 0}
                data={subcategories.map((sc) => ({
                  value: sc.id.toString(),
                  label: sc.name,
                }))}
                {...form.getInputProps("subcategoryId")}
              />

              <Select
                label="Brand"
                withAsterisk
                data={brands.map((b) => ({
                  value: b.id.toString(),
                  label: b.name,
                }))}
                {...form.getInputProps("brandId")}
              />

              <Select
                label="Vendor"
                withAsterisk
                data={vendors.map((v) => ({
                  value: v.id.toString(),
                  label: v.name,
                }))}
                {...form.getInputProps("vendorId")}
              />

              <TextInput
                label="Purchase Price"
                type="number"
                {...form.getInputProps("purchasePrice")}
              />

              <DateInput
                label="Purchase Date"
                withAsterisk
                value={form.values.purchaseDate}
                onChange={(v) => form.setFieldValue("purchaseDate", v)}
                error={form.errors.purchaseDate}
              />

              <Select
                label="Asset Status"
                data={[
                  { value: "inuse", label: "In Use" },
                  { value: "instock", label: "In Stock" },
                  { value: "maintenance", label: "Maintenance" },
                  { value: "damaged", label: "Damaged" },
                  { value: "lost", label: "Lost" },
                ]}
                {...form.getInputProps("status")}
              />

              <RichTextInput
                label="Notes"
                value={form.values.notes}
                onChange={(val) => form.setFieldValue("notes", val)}
                {...form.getInputProps("notes")}
              />

              <Button type="submit" loading={createMutation.isPending}>
                Create Asset
              </Button>
            </Stack>
          </form>
        </Paper>
      </Stack>
    </>
  );
};

export default AssetCreate;
