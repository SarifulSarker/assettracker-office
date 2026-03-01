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

  const [images, setImages] = useState([]); // main asset images
  const [unitImages, setUnitImages] = useState([]); // array of arrays per unit
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
      unitInputs: [{ productId: "", purchasePrice: "", status: "IN_STOCK" }],
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

      // on asset load
      setUnitImages(
        asset.assetUnits?.map((u) =>
          (u.images || []).map((url) => ({ url, isNew: false })),
        ) || [[]],
      );
      setSubcategories(selectedCategory?.children || []);
    }
  }, [asset, categories]);

  /* -------------------- HANDLE UNIT INPUTS -------------------- */
  useEffect(() => {
    if (!asset) return;
    const actualUnits = asset.assetUnits?.length || 0;
    let totalUnits = Number(form.values.units) || actualUnits;
    if (totalUnits < actualUnits) totalUnits = actualUnits;

    const existingData =
      asset.assetUnits?.map((u) => ({
        productId: u.productId,
        purchasePrice: u.purchasePrice,
        status: u.status,
      })) || [];

    const newUnitsCount = totalUnits - actualUnits;
    const newUnits =
      newUnitsCount > 0
        ? Array(newUnitsCount).fill({
            productId: "",
            purchasePrice: "",
            status: "IN_STOCK",
          })
        : [];

    form.setFieldValue("unitInputs", [...existingData, ...newUnits]);
    form.setFieldValue("units", totalUnits);

    // Ensure unitImages array matches total units
    setUnitImages((prev) => {
      const updated = [...prev];
      while (updated.length < totalUnits) updated.push([]);
      return updated;
    });
  }, [form.values.units, asset]);

  /* -------------------- MUTATION -------------------- */
  // Inside your updateMutation
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
      formData.append("units", Number(values.units));

      // inside your mutation
      values.unitInputs.forEach((unit, idx) => {
        formData.append("productIds[]", unit.productId);
        formData.append("unitPrices[]", unit.purchasePrice || 0);
        formData.append("unitStatuses[]", unit.status);

        (unitImages[idx] || []).forEach((img) => {
          if (img.isNew) {
            formData.append(`unitImages[${idx}][]`, img.file);
          } else {
            formData.append(`existingUnitImages[${idx}][]`, img.url);
          }
        });
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
                <div key={idx}>
                  <Grid align="end" gutter="md">
                    <Grid.Col span={4}>
                      <TextInput
                        label={`Unit #${idx + 1} Product ID`}
                        {...form.getInputProps(`unitInputs.${idx}.productId`)}
                        // readOnly={idx < (asset?.assetUnits?.length || 0)}
                      />
                    </Grid.Col>

                    <Grid.Col span={3}>
                      <Select
                        label="Status"
                        data={[
                          { value: "IN_STOCK", label: "IN STOCK" },
                          { value: "IN_USE", label: "IN USE" },
                          { value: "SOLD", label: "SOLD" },
                          { value: "DAMAGED", label: "DAMAGED" },
                          { value: "LOST", label: "LOST" },
                          { value: "MAINTENANCE", label: "MAINTENANCE" },
                        ]}
                        {...form.getInputProps(`unitInputs.${idx}.status`)}
                      />
                    </Grid.Col>

                    <Grid.Col span={5}>
                      <NumberInput
                        label="Unit Price"
                        min={0}
                        precision={2}
                        {...form.getInputProps(
                          `unitInputs.${idx}.purchasePrice`,
                        )}
                      />
                    </Grid.Col>
                  </Grid>

                  {/* Unit Images */}
                  <ImagePreviewList
                    images={unitImages[idx] || []}
                    unitIndex={idx}
                    onRemove={(unitIdx, imgIdx) => {
                      setUnitImages((prev) => {
                        const updated = [...prev];
                        updated[unitIdx] = updated[unitIdx].filter(
                          (_, i) => i !== imgIdx,
                        );
                        return updated;
                      });
                    }}
                    onAdd={(unitIdx, file) => {
                      setUnitImages((prev) => {
                        const updated = [...prev];
                        const currentImages = updated[unitIdx] || [];

                        if (currentImages.length >= 5) {
                          notifications.show({
                            title: "Limit exceeded",
                            message: "Maximum 5 images allowed per unit",
                            color: "red",
                            position: "top-center",
                          });
                          return prev; // ❌ don't update
                        }

                        updated[unitIdx] = [...currentImages, file];
                        return updated;
                      });
                    }}
                  />
                </div>
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
