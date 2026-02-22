import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  Text,
  TextInput,
  Button,
  Stack,
  Paper,
  Textarea,
  Select,
  Grid,
  NumberInput,
  Group,
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
import RichTextInput from "../../helpers/RichTextInput.jsx";
import ImagePreviewList from "../../components/Asset/ImagePreviewList.jsx";

const AssetEdit = () => {
  const navigate = useNavigate();
  const { uid } = useParams();

  const [images, setImages] = useState([]);
  const [subcategories, setSubcategories] = useState([]);

  /* -------------------- QUERIES -------------------- */
  const { data: assetData, isLoading } = useQuery({
    queryKey: ["asset", uid],
    queryFn: () => getAssetByIdApi(uid),
    enabled: !!uid,
  });

  const { data: CategoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: () => getAllCategoriesApi({ page: 1, perpage: 1000 }),
  });

  const { data: BrandsData } = useQuery({
    queryKey: ["brands"],
    queryFn: () => getAllBrandsApi({ page: 1, pageSize: 1000 }),
  });

  const { data: VendorsData } = useQuery({
    queryKey: ["vendors"],
    queryFn: () => getAllVendorsApi({ page: 1, perpage: 1000 }),
  });

  const categories = CategoriesData?.data?.categories || [];
  const brands = BrandsData?.data?.brands || [];
  const vendors = VendorsData?.data?.vendors || [];
  const asset = assetData?.data;

  /* -------------------- FORM -------------------- */
  const form = useForm({
    initialValues: {
      name: "",
      specs: "",
      categoryId: "",
      subCategoryId: "",
      brandId: "",
      vendorId: "",

      purchaseDate: null,

      notes: "",
      units: 1,
      unitInputs: [
        {
          productId: "",
          purchasePrice: "",
          status: "IN_STOCK",
        },
      ],
    },
    validate: {
      name: (v) => (!v ? "Asset name is required" : null),
      categoryId: (v) => (!v ? "Category is required" : null),
      brandId: (v) => (!v ? "Brand is required" : null),
      vendorId: (v) => (!v ? "Vendor is required" : null),

      purchaseDate: (v) => (!v ? "Purchase date is required" : null),
    },
  });

  /* -------------------- MEMO OPTIONS -------------------- */
  const categoryOptions = useMemo(
    () => categories.map((c) => ({ value: c.id.toString(), label: c.name })),
    [categories],
  );
  const brandOptions = useMemo(
    () => brands.map((b) => ({ value: b.id.toString(), label: b.name })),
    [brands],
  );
  const vendorOptions = useMemo(
    () => vendors.map((v) => ({ value: v.id.toString(), label: v.name })),
    [vendors],
  );

  const selectedCategory = useMemo(
    () => categories.find((c) => c.id.toString() === form.values.categoryId),
    [categories, form.values.categoryId],
  );

  const subCategoryOptions = useMemo(() => {
    return (
      selectedCategory?.children?.map((sc) => ({
        value: sc.id.toString(),
        label: sc.name,
      })) || []
    );
  }, [selectedCategory]);
  
  /* -------------------- LOAD DATA -------------------- */
  useEffect(() => {
    if (asset && categories.length) {
      form.setValues({
        name: asset.name || "",
        specs: asset.specs || "",
        categoryId: asset.categoryId?.toString() || "",
        subCategoryId: asset.subCategory?.id?.toString() || "",
        brandId: asset.brandId?.toString() || "",
        vendorId: asset.vendorId?.toString() || "",

        purchaseDate: asset.purchaseDate ? new Date(asset.purchaseDate) : null,
       
        notes: asset.notes || "",
        units: asset.assetUnits?.length || 1,
        unitInputs: asset.assetUnits?.map((u) => ({
          productId: u.productId,
          purchasePrice: u.purchasePrice,
          status: u.status,
        })) || [{ productId: "", purchasePrice: "", status: "IN_STOCK" }],
      });

      setImages(asset.images || []);
      setSubcategories(
        selectedCategory?.children ? selectedCategory.children : [],
      );
    }
  }, [asset, categories]);

  /* -------------------- HANDLE UNIT INPUTS -------------------- */
  useEffect(() => {
    if (!asset) return;

    const actualUnits = asset.assetUnits?.length || 0; // existing units in DB
    let totalUnits = Number(form.values.units) || actualUnits;

    // cannot go below actual units
    if (totalUnits < actualUnits) totalUnits = actualUnits;

    // preserve existing units from asset data
    const existingData =
      asset.assetUnits?.map((u) => ({
        productId: u.productId,
        purchasePrice: u.purchasePrice,
        status: u.status,
      })) || [];

    // create new empty units if user increased
    const newUnitsCount = totalUnits - actualUnits;
    const newUnits =
      newUnitsCount > 0
        ? Array(newUnitsCount).fill({
            productId: "",
            purchasePrice: "",
            status: "IN_STOCK",
          })
        : [];

    const updatedUnitInputs = [...existingData, ...newUnits];

    form.setFieldValue("unitInputs", updatedUnitInputs);
    form.setFieldValue("units", totalUnits);
  }, [form.values.units, asset]);

  /* -------------------- MUTATION -------------------- */
  const updateMutation = useMutation({
    mutationFn: async (values) => {
      const formData = new FormData();

      formData.append("name", values.name);
      formData.append("specs", values.specs || "");
     
      formData.append("notes", values.notes || "");
      formData.append("categoryId", values.categoryId);
      formData.append("subCategoryId", values.subCategoryId || "");
      formData.append("brandId", values.brandId);
      formData.append("vendorId", values.vendorId);
     
      formData.append(
        "purchaseDate",
        new Date(values.purchaseDate).toISOString(),
      );
      formData.append("units",Number(values.units) );

      // Unit Inputs
      values.unitInputs.forEach((unit) => {
        formData.append("productIds[]", unit.productId);
        formData.append(
          "unitPrices[]",
          unit.purchasePrice ? Number(unit.purchasePrice) : 0,
        );
      });

      // Images
      images.forEach((img) => {
        if (img instanceof File) formData.append("images", img);
        else formData.append("existingImages", img);
      });

      return updateAssetApi(uid, formData);
    },
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
      notifications.show({
        title: "Error",
        message: error.response?.data?.message || "Something went wrong",
        color: "red",
        position: "top-center",
      });
    },
  });

  const handleCategoryChange = (value) => {
    form.setFieldValue("categoryId", value);
    form.setFieldValue("subCategoryId", "");
    const cat = categories.find((c) => c.id.toString() === value);
    setSubcategories(cat?.children || []);
  };

  /* -------------------- RENDER -------------------- */
  if (isLoading)
    return (
      <Box mt={100} ta="center">
        Loading...
      </Box>
    );

  return (
    <>
      <PageTop PAGE_TITLE="Edit Asset" backBtn />
      <Box maw={700} mt={10} mx="auto">
        <Paper p="xl" shadow="md" radius="lg">
          <form onSubmit={form.onSubmit((v) => updateMutation.mutate(v))}>
            <Stack spacing="md">
              <TextInput
                label="Asset Name"
                withAsterisk
                {...form.getInputProps("name")}
              />
              <Text fw={500}>Total Units</Text>
              <NumberInput
                min={1}
                value={form.values.units}
                onChange={(val) => form.setFieldValue("units", val || 1)}
              />

              {form.values.unitInputs.map((unit, idx) => (
                <Grid key={idx} align="end" gutter="md">
                  {/* Product ID */}
                  <Grid.Col span={4}>
                    <TextInput
                      label={`Unit #${idx + 1} Product ID`}
                      {...form.getInputProps(`unitInputs.${idx}.productId`)}
                      readOnly={idx < (asset?.assetUnits?.length || 0)}
                    />
                  </Grid.Col>

                  {/* Status */}
                  <Grid.Col span={3}>
                    <Select
                      label="Status"
                      data={[
                        { value: "IN_STOCK", label: "IN STOCK" },
                        { value: "IN_USE", label: "IN USE" },
                        { value: "SOLD", label: "SOLD" },
                        { value: "DAMAGED", label: "DAMAGED" },
                        { value: "LOST", label: "LOST" },
                      ]}
                      {...form.getInputProps(`unitInputs.${idx}.status`)}
                      // disabled={idx < (asset?.assetUnits?.length || 0)} // old units cannot change status
                    />
                  </Grid.Col>

                  {/* Purchase Price */}
                  <Grid.Col span={5}>
                    <NumberInput
                      label="Unit Price"
                      min={0}
                      precision={2}
                      {...form.getInputProps(`unitInputs.${idx}.purchasePrice`)}
                      readOnly={idx < (asset?.assetUnits?.length || 0)}
                    />
                  </Grid.Col>
                </Grid>
              ))}

              <Textarea
                label="Specifications"
                placeholder="e.g. 8GB / Intel i5 / 512GB SSD"
                {...form.getInputProps("specs")}
              />

              <Select
                label="Category"
                withAsterisk
                value={form.values.categoryId}
                onChange={handleCategoryChange}
                data={categoryOptions}
              />

              <Select
                label="Subcategory"
                value={form.values.subCategoryId}
                onChange={(val) => form.setFieldValue("subCategoryId", val)}
                data={subCategoryOptions}
                disabled={!subCategoryOptions.length}
              />

              <Select
                label="Brand"
                withAsterisk
                {...form.getInputProps("brandId")}
                data={brandOptions}
              />

              <Select
                label="Vendor"
                withAsterisk
                {...form.getInputProps("vendorId")}
                data={vendorOptions}
              />

              <DateInput
                label="Purchase Date"
                value={form.values.purchaseDate}
                onChange={(v) => form.setFieldValue("purchaseDate", v)}
              />

              <RichTextInput
                label="Notes"
                value={form.values.notes}
                onChange={(val) => form.setFieldValue("notes", val)}
              />

              <ImagePreviewList
                images={images}
                onRemove={(i) =>
                  setImages((prev) => prev.filter((_, idx) => idx !== i))
                }
              />

              <Button type="submit" loading={updateMutation.isPending}>
                Update Asset
              </Button>
            </Stack>
          </form>
        </Paper>
      </Box>
    </>
  );
};

export default AssetEdit;
