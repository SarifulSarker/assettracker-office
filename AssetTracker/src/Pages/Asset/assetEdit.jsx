import React, { useEffect, useState } from "react";
import {
  Box,
  Text,
  TextInput,
  Button,
  Stack,
  Paper,
  Textarea,
  Select,
  Group,
  ActionIcon,
  Image,
  Loader,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { IconX } from "@tabler/icons-react";

import PageTop from "../../components/global/PageTop.jsx";
import { getAssetByIdApi, updateAssetApi } from "../../services/asset.js";
import { getAllBrandsApi } from "../../services/brand.js";
import { getAllVendorsApi } from "../../services/vendor.js";
import { getAllCategoriesApi } from "../../services/category.js";
import RichTextInput from "../../helpers/RichTextInput.jsx";

const AssetEdit = () => {
  const navigate = useNavigate();
  const { uid } = useParams();

  const [subcategories, setSubcategories] = useState([]);
  const [images, setImages] = useState([]);
  // string = existing image
  // File = new image

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
      subcategoryId: "",
      brandId: "",
      vendorId: "",
      purchasePrice: "",
      purchaseDate: null,
      status: "",
      notes: "",
    },
    validate: {
      name: (v) => (!v ? "Asset name is required" : null),
      categoryId: (v) => (!v ? "Category is required" : null),
      brandId: (v) => (!v ? "Brand is required" : null),
      vendorId: (v) => (!v ? "Vendor is required" : null),
      purchasePrice: (v) => (!v ? "Purchase price is required" : null),
      purchaseDate: (v) => (!v ? "Purchase date is required" : null),
    },
  });

  /* -------------------- LOAD DATA -------------------- */
  useEffect(() => {
    if (asset && categories.length) {
      form.setValues({
        name: asset.name || "",
        specs: asset.specs || "",
        categoryId: asset.categoryId?.toString() || "",
        subcategoryId: asset.subCategory?.id?.toString() || "",
        brandId: asset.brandId?.toString() || "",
        vendorId: asset.vendorId?.toString() || "",
        purchasePrice: asset.purchasePrice || "",
        purchaseDate: asset.purchaseDate ? new Date(asset.purchaseDate) : null,
        status: asset.status || "",
        notes: asset.notes || "",
      });

      const parent = categories.find((c) => c.id === asset.categoryId);
      setSubcategories(parent?.children || []);

      // ✅ existing images load
      setImages(asset.images || []);
    }
  }, [asset, categories]);

  /* -------------------- MUTATION -------------------- */
  const updateMutation = useMutation({
    mutationFn: async (values) => {
      const formData = new FormData();

      formData.append("name", values.name);
      formData.append("specs", values.specs || "");
      formData.append("status", values.status);
      formData.append("notes", values.notes || "");
      formData.append("categoryId", values.categoryId);
      formData.append("subCategoryId", values.subcategoryId || "");
      formData.append("brandId", values.brandId);
      formData.append("vendorId", values.vendorId);
      formData.append("purchasePrice", values.purchasePrice);
      formData.append(
        "purchaseDate",
        new Date(values.purchaseDate).toISOString(),
      );

      images.forEach((img) => {
        if (img instanceof File) {
          formData.append("images", img); // new
        } else {
          formData.append("existingImages", img); // old
        }
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

  /* -------------------- HANDLERS -------------------- */
  const handleCategoryChange = (value) => {
    form.setFieldValue("categoryId", value);
    form.setFieldValue("subcategoryId", "");
    const cat = categories.find((c) => c.id.toString() === value);
    setSubcategories(cat?.children || []);
  };

  const handleRemoveImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddImages = (e) => {
    const files = Array.from(e.target.files);
    const all = [...images, ...files];

    if (all.length > 5) {
      notifications.show({
        title: "Limit exceeded",
        message: "Maximum 5 images allowed",
        color: "red",
      });
      return;
    }

    setImages(all);
  };

  /* -------------------- UI -------------------- */
  if (isLoading) {
    return (
      <Box mt={100} ta="center">
        <Loader />
      </Box>
    );
  }

  return (
    <>
      <PageTop PAGE_TITLE="Edit Asset" backBtn />

      <Box maw={600} mx="auto">
        <Paper p="xl" withBorder radius="lg">
          <form onSubmit={form.onSubmit((v) => updateMutation.mutate(v))}>
            <Stack>
              <Text fw={700}>Asset Images (max 5)</Text>

              <Group>
                {images.map((img, index) => (
                  <div key={index} style={{ position: "relative" }}>
                    <Image
                      src={
                        img instanceof File
                          ? URL.createObjectURL(img)
                          : `${import.meta.env.VITE_APP_BACKEND_BASE_URL}${img}`
                      }
                      width={80}
                      height={80}
                      radius="sm"
                      fit="cover"
                    />
                    <ActionIcon
                      color="red"
                      size="sm"
                      style={{ position: "absolute", top: -8, right: -8 }}
                      onClick={() => handleRemoveImage(index)}
                    >
                      <IconX size={14} />
                    </ActionIcon>
                  </div>
                ))}

                {images.length < 5 && (
                  <Button
                    component="label"
                    size="xs"
                    variant="outline"
                    style={{ height: 80 }}
                  >
                    + Add
                    <input
                      hidden
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleAddImages}
                    />
                  </Button>
                )}
              </Group>

              <TextInput
                label="Asset Name"
                withAsterisk
                {...form.getInputProps("name")}
              />
              <Textarea label="Specs" {...form.getInputProps("specs")} />

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
                disabled={!subcategories.length}
                data={subcategories.map((s) => ({
                  value: s.id.toString(),
                  label: s.name,
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
                withAsterisk
                {...form.getInputProps("purchasePrice")}
              />

              <DateInput
                label="Purchase Date"
                value={form.values.purchaseDate}
                onChange={(v) => form.setFieldValue("purchaseDate", v)}
              />

              <Select
                label="Status"
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
                onChange={(v) => form.setFieldValue("notes", v)}
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
