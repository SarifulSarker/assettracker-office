import React, { useEffect, useRef, useState, useMemo } from "react";
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
  Modal,
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
import ImagePreviewList from "../../components/Asset/ImagePreviewList.jsx";
const AssetEdit = () => {
  const navigate = useNavigate();
  const { uid } = useParams();

  //const [subcategories, setSubcategories] = useState([]);
  const [images, setImages] = useState([]);

  const [uploadOpened, setUploadOpened] = useState(false);

  const cameraRef = useRef(null);
  const galleryRef = useRef(null);

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

  const categoryOptions = useMemo(() => {
    return categories.map((c) => ({
      value: c.id.toString(),
      label: c.name,
    }));
  }, [categories]);

  const brandOptions = useMemo(() => {
    return brands.map((b) => ({
      value: b.id.toString(),
      label: b.name,
    }));
  }, [brands]);

  const vendorOptions = useMemo(() => {
    return vendors.map((v) => ({
      value: v.id.toString(),
      label: v.name,
    }));
  }, [vendors]);
  
  const selectedCategory = useMemo(() => {
    return categories.find((c) => c.id.toString() === form.values.categoryId);
  }, [categories, form.values.categoryId]);

  const subCategoryOptions = useMemo(() => {
    if (!selectedCategory) return [];

    return (
      selectedCategory.children?.map((s) => ({
        value: s.id.toString(),
        label: s.name,
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
        subcategoryId: asset.subCategory?.id?.toString() || "",
        brandId: asset.brandId?.toString() || "",
        vendorId: asset.vendorId?.toString() || "",
        purchasePrice: asset.purchasePrice || "",
        purchaseDate: asset.purchaseDate ? new Date(asset.purchaseDate) : null,
        status: asset.status || "",
        notes: asset.notes || "",
      });

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
  };

  const handleRemoveImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddImages = (e) => {
    const files = Array.from(e.target.files);
    const all = [...images, ...files];

    if (all.length >= 5) {
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
  {
    /* Camera input */
  }

  return (
    <>
      <input
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        ref={cameraRef}
        style={{ display: "none" }}
        onChange={handleAddImages}
      />

      <input
        type="file"
        accept="image/*"
        multiple
        ref={galleryRef}
        style={{ display: "none" }}
        onChange={handleAddImages}
      />

      <PageTop PAGE_TITLE="Edit Asset" backBtn />
      <Box maw={600} mt={10} mx="auto">
        <Paper p="xl" withBorder radius="lg">
          <form onSubmit={form.onSubmit((v) => updateMutation.mutate(v))}>
            <Stack>
              <Text fw={700}>Asset Images (max 5)</Text>
              <Modal
                opened={uploadOpened}
                onClose={() => setUploadOpened(false)}
                title="Upload Image"
                centered
              >
                <Stack>
                  <Button onClick={() => cameraRef.current.click()}>
                    📷 Take Photo
                  </Button>

                  <Button
                    variant="light"
                    onClick={() => galleryRef.current.click()}
                  >
                    🖼️ Choose from Gallery
                  </Button>
                </Stack>
              </Modal>

              <Group>
                <ImagePreviewList
                  images={images}
                  onRemove={handleRemoveImage}
                />

                {images.length < 5 && (
                  <Button
                    size="xs"
                    variant="outline"
                    style={{ height: 80 }}
                    onClick={() => setUploadOpened(true)}
                  >
                    + Add
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
                data={categoryOptions}
                value={form.values.categoryId}
                onChange={handleCategoryChange}
              />

              <Select
                label="Subcategory"
                disabled={!subCategoryOptions.length}
                data={subCategoryOptions}
                {...form.getInputProps("subcategoryId")}
              />

              <Select
                label="Brand"
                withAsterisk
                data={brandOptions}
                {...form.getInputProps("brandId")}
              />

              <Select
                label="Vendor"
                withAsterisk
                data={vendorOptions}
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
