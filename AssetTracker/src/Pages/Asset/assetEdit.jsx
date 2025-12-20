import React, { useEffect, useState } from "react";
import {
  Box,
  Text,
  TextInput,
  Button,
  Stack,
  Paper,
  Select,
  Loader,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";

import PageTop from "../../components/global/PageTop.jsx";
import { getAssetByIdApi, updateAssetApi } from "../../services/asset.js";
import { getAllBrandsApi } from "../../services/brand.js";
import { getAllVendorsApi } from "../../services/vendor.js";
import { getAllCategoriesApi } from "../../services/category.js";

const assetEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [subcategories, setSubcategories] = useState([]);

  /* -------------------- QUERIES -------------------- */

  const { data: assetData, isLoading: assetLoading } = useQuery({
    queryKey: ["asset", id],
    queryFn: () => getAssetByIdApi(id),
    enabled: !!id,
  });

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

  const asset = assetData?.data;

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
      status: "",
      notes: "",
    },
  });

  /* -------------------- LOAD EXISTING DATA -------------------- */

  useEffect(() => {
    if (asset && categories.length) {
      form.setValues({
        name: asset.name || "",
        categoryId: asset.categoryId?.toString() || "",
        // subcategoryId: asset.subCategoryId?.toString() || "",
        subcategoryId: asset.subCategory?.id?.toString() || "",

        brandId: asset.brandId?.toString() || "",
        vendorId: asset.vendorId?.toString() || "",
        purchasePrice: asset.purchasePrice || "",
        purchaseDate: asset.purchaseDate ? new Date(asset.purchaseDate) : null,
        status: asset.status || "",
        notes: asset.notes || "",
      });

      // load subcategories
      const parent = categories.find((c) => c.id === asset.categoryId);
      setSubcategories(parent?.children || []);
    }
  }, [asset, categories]);

  /* -------------------- MUTATION -------------------- */

  const updateMutation = useMutation({
    mutationFn: (values) =>
      updateAssetApi(id, {
        name: values.name,
        status: values.status,
        notes: values.notes,

        categoryId: values.categoryId ? Number(values.categoryId) : undefined,

        subCategoryId: values.subcategoryId
          ? Number(values.subcategoryId)
          : undefined,

        brandId: values.brandId ? Number(values.brandId) : undefined,

        vendorId: values.vendorId ? Number(values.vendorId) : undefined,

        purchasePrice: values.purchasePrice
          ? Number(values.purchasePrice)
          : null,

        purchaseDate: values.purchaseDate ?? null,
      }),
    onSuccess: () => {
      notifications.show({
        title: "Updated",
        message: "Asset updated successfully",
        color: "green",
        position: "top-center",
      });
      navigate("/assets");
    },
    onError: (error) => {
      console.log("AXIOS ERROR:", error);
      console.log("RESPONSE:", error.response);
      notifications.show({
        title: "Error",
        message: error.response?.data?.message || "Something went wrong",
        position: "top-center",
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

  /* -------------------- UI -------------------- */

  if (assetLoading) {
    return (
      <Box mt={100} style={{ textAlign: "center" }}>
        <Loader />
      </Box>
    );
  }

  return (
    <>
      <PageTop PAGE_TITLE="Edit Asset" backBtn />

      <Box maw={600} mx="auto" >
        <Paper p="xl" shadow="md" radius="lg">
          <Text fw={700} size="xl" mb="md">
            Edit Asset
          </Text>

          <form onSubmit={form.onSubmit((v) => updateMutation.mutate(v))}>
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
                value={form.values.purchaseDate}
                onChange={(v) => form.setFieldValue("purchaseDate", v)}
              />

              <TextInput label="Status" {...form.getInputProps("status")} />

              <TextInput label="Notes" {...form.getInputProps("notes")} />

              <Button type="submit" loading={updateMutation.isLoading}>
                Update Asset
              </Button>
            </Stack>
          </form>
        </Paper>
      </Box>
    </>
  );
};

export default assetEdit;
