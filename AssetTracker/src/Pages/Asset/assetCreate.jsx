import React, { useState } from "react";
import {
  Box,
  Text,
  TextInput,
  Button,
  Stack,
  Paper,
  Select,
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

const AssetCreate = () => {
  const navigate = useNavigate();
  const [subcategories, setSubcategories] = useState([]);

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
      subcategoryId: "",
      brandId: "",
      vendorId: "",
      purchasePrice: "",
      purchaseDate: null,
      status: "in-stock",
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
    mutationFn: (values) =>
      createAssetApi({
        ...values,
        categoryId: Number(values.categoryId),
        subCategoryId: values.subcategoryId
          ? Number(values.subcategoryId)
          : null, // only send if subcategory selected
        brandId: Number(values.brandId),
        vendorId: Number(values.vendorId),
        purchasePrice: values.purchasePrice
          ? Number(values.purchasePrice)
          : null,
      }),
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
        message: error.response?.data?.message || "Something went wrong",
        color: "red",
      });
    },
  });

  /* -------------------- HANDLERS -------------------- */
  const handleCategoryChange = (value) => {
    form.setFieldValue("categoryId", value);
    form.setFieldValue("subcategoryId", "");

    const category = categories.find((c) => c.id.toString() === value);
    setSubcategories(category?.children || []);
  };


  return (
    <>
      <PageTop PAGE_TITLE="Create Asset" backBtn />

      <Box maw={600} mx="auto" >
        <Paper p="xl" shadow="md" radius="lg">
          <Text fw={700} size="xl" mb="md">
            Create New Asset
          </Text>

          <form onSubmit={form.onSubmit((v) => createMutation.mutate(v))}>
            <Stack>
              <TextInput
                label="Asset Name"
                withAsterisk
                {...form.getInputProps("name")}
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

              <TextInput label="Status" {...form.getInputProps("status")} />

              <TextInput label="Notes" {...form.getInputProps("notes")} />

              <Button type="submit" loading={createMutation.isLoading}>
                Create Asset
              </Button>
            </Stack>
          </form>
        </Paper>
      </Box>
    </>
  );
};

export default AssetCreate;
