import React, { useState, useEffect, useMemo } from "react";
import {
  Stack,
  Paper,
  Text,
  TextInput,
  Select,
  Button,
  Textarea,
  NumberInput,
  Group,
  Grid,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { useForm, yupResolver } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import * as Yup from "yup";
import PageTop from "../../components/global/PageTop.jsx";
import { createAssetApi } from "../../services/asset.js";
import { getAllBrandsApi } from "../../services/brand.js";
import { getAllVendorsApi } from "../../services/vendor.js";
import { getAllCategoriesApi } from "../../services/category.js";
import RichTextInput from "../../helpers/RichTextInput.jsx";
import FileUploadArea from "../../components/Asset/FileUploadArea.jsx";
import SelectWithAdd from "../../utils/SelectWithAdd.jsx";
import CategoryCreateModal from "../../components/Category/CategoryCreateModal.jsx";
import BrandCreateModal from "../../components/Brand/BrandCreateModal.jsx";
import VendorCreateModal from "../../components/Vendor/CreateVendorModal.jsx";
import SubCategoryCreateModal from "../../components/SubCategory/SubCategoryCreateModal.jsx";

const assetSchema = Yup.object().shape({
  name: Yup.string().required("Asset name is required"),
  categoryId: Yup.string().required("Category is required"),
  subCategoryId: Yup.string().nullable(),
  brandId: Yup.string().required("Brand is required"),
  vendorId: Yup.string().required("Vendor is required"),
  purchasePrice: Yup.number()
    .typeError("Purchase price must be a number")
    .positive("Price must be positive")
    .nullable(),
  purchaseDate: Yup.date().required("Purchase date is required"),
  specs: Yup.string().nullable(),

  notes: Yup.string().nullable(),
  units: Yup.number().min(1, "At least 1 unit required").required(),
 unitInputs: Yup.array().of(
  Yup.object().shape({
    productId: Yup.string().required("Product ID required"),
    status: Yup.string().required(),
    purchasePrice: Yup.number()
      .typeError("Unit price must be a number")
      .min(0, "Price cannot be negative")
      .required("Unit price required"),
  }),
),

});

const AssetCreate = () => {
  const navigate = useNavigate();
  const [subcategories, setSubcategories] = useState([]);
  const [images, setImages] = useState([]);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [brandModalOpen, setBrandModalOpen] = useState(false);
  const [vendorModalOpen, setVendorModalOpen] = useState(false);
  const [subCategoryModalOpen, setSubCategoryModalOpen] = useState(false);

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

  const categoryOptions = useMemo(
    () =>
      categories.map((c) => ({ value: c.id.toString(), label: c.name })) || [],
    [categories],
  );
  const brandOptions = useMemo(
    () => brands.map((b) => ({ value: b.id.toString(), label: b.name })) || [],
    [brands],
  );
  const vendorOptions = useMemo(
    () => vendors.map((v) => ({ value: v.id.toString(), label: v.name })) || [],
    [vendors],
  );

  /* -------------------- FORM -------------------- */
  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      name: "",
      categoryId: "",
      subCategoryId: "",
      brandId: "",
      vendorId: "",
    
      purchaseDate: null,
      specs: "",
      notes: "",
      units: 1,

      // ⭐ NEW
      unitInputs: [
        {
          productId: "",
          status: "IN_STOCK",
        },
      ],
    },

    validate: yupResolver(assetSchema),
  });

  /* -------------------- HANDLE UNIT INPUTS -------------------- */
  useEffect(() => {
    const totalUnits = Number(form.values.units) || 0;
    let arr = form.values.unitInputs || [];

    if (totalUnits > arr.length) {
      arr = [
        ...arr,
        ...Array(totalUnits - arr.length).fill({
          productId: "",
          status: "IN_STOCK",
           purchasePrice: "",
        }),
      ];
    } else if (totalUnits < arr.length) {
      arr = arr.slice(0, totalUnits);
    }

    form.setFieldValue("unitInputs", arr);
  }, [form.values.units]);

  /* -------------------- MUTATION -------------------- */
  const createMutation = useMutation({
    mutationFn: (values) => {
      const formData = new FormData();

      formData.append("name", values.name);
      formData.append("categoryId", Number(values.categoryId));
      formData.append(
        "subCategoryId",
        values.subCategoryId ? Number(values.subCategoryId) : "",
      );
      formData.append("brandId", Number(values.brandId));
      formData.append("vendorId", Number(values.vendorId));

      formData.append("specs", values.specs || "");
      formData.append("notes", values.notes || "");
      formData.append("units", Number(values.units));
      formData.append("status", values.status || "IN_STOCK"); // default

      // Ensure no empty productIds
      values.unitInputs.forEach((unit) => {
        if (unit.productId) formData.append("productIds[]", unit.productId);
        if (unit.purchasePrice !== undefined && unit.purchasePrice !== null)
          formData.append("unitPrices[]", Number(unit.purchasePrice));
      });

     

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

  useEffect(() => {
    form.setFieldValue("subCategoryId", "");
  }, [form.values.categoryId]);

  const handleCategoryChange = (value) => {
    form.setFieldValue("categoryId", value);
    form.setFieldValue("subCategoryId", ""); // reset subcategory
    const category = categories.find((c) => c.id.toString() === value);
    setSubcategories(category?.children || []);
  };

  /* -------------------- JSX -------------------- */
  return (
    <>
      <PageTop PAGE_TITLE="Create Asset" backBtn />

      <Stack maw={700} mt={10} mx="auto">
        <Paper p="xl" shadow="md" withBorder radius="lg">
          <Text fw={700} size="xl" mb="md">
            Create New Asset
          </Text>

          <form
            onSubmit={form.onSubmit((v) => {
              createMutation.mutate(v);
            })}
          >
            <Stack spacing="md">
              <TextInput
                label="Asset Name"
                withAsterisk
                {...form.getInputProps("name")}
              />
              {/* -------------------- UNITS SECTION -------------------- */}
              <NumberInput
                label="Total Units"
                min={1}
                step={1}
                value={form.values.units}
                onChange={(val) => form.setFieldValue("units", val || 0)}
              />

              <Text fw={500}>Product IDs for each unit:</Text>

              {form.values.unitInputs.map((unit, idx) => (
                <Grid key={idx} align="end" gutter="md">
                  {/* Product ID */}
                  <Grid.Col span={4}>
                    <TextInput
                      label={`Unit #${idx + 1} Product ID`}
                      placeholder={`e.g. MB-00${idx + 1}`}
                      {...form.getInputProps(`unitInputs.${idx}.productId`)}
                    />
                  </Grid.Col>

                  {/* Status */}
                  <Grid.Col span={3}>
                    <Select
                      label="Status"
                      data={[{ value: "IN_STOCK", label: "IN STOCK" }]}
                      value={form.values.unitInputs[idx].status}
                      disabled
                    />
                  </Grid.Col>

                  {/* Purchase Price */}
                  <Grid.Col span={5}>
                    <NumberInput
                      label="Unit Price"
                      min={0}
                      precision={2}
                      {...form.getInputProps(`unitInputs.${idx}.purchasePrice`)}
                    />
                  </Grid.Col>
                </Grid>
              ))}

              <Textarea
                resize="vertical"
                label="Specifications"
                placeholder="e.g. 8GB / Intel i5 / 512GB SSD"
                {...form.getInputProps("specs")}
              />

              <SelectWithAdd
                label="Category"
                value={form.values.categoryId}
                onChange={handleCategoryChange}
                data={categoryOptions}
                onAddClick={() => setCategoryModalOpen(true)}
                error={form.errors.categoryId}
              />
              <CategoryCreateModal
                opened={categoryModalOpen}
                onClose={() => setCategoryModalOpen(false)}
                onSuccess={(newCategory) => {
                  form.setFieldValue("categoryId", newCategory.id.toString());
                }}
              />

              <SelectWithAdd
                label="Subcategory"
                value={form.values.subCategoryId}
                onChange={(val) => form.setFieldValue("subCategoryId", val)}
                data={subcategories.map((sc) => ({
                  value: sc.id.toString(),
                  label: sc.name,
                }))}
                disabled={!form.values.categoryId || subcategories.length === 0}
                onAddClick={() => setSubCategoryModalOpen(true)}
              />
              <SubCategoryCreateModal
                opened={subCategoryModalOpen}
                onClose={() => setSubCategoryModalOpen(false)}
                categories={categories}
                onSuccess={(newSubcategory) => {
                  const updatedCategory = categories.find(
                    (c) => c.id.toString() === form.values.categoryId,
                  );
                  if (updatedCategory) {
                    setSubcategories([...subcategories, newSubcategory]);
                    form.setFieldValue(
                      "subCategoryId",
                      newSubcategory.id.toString(),
                    );
                  }
                }}
              />

              <SelectWithAdd
                label="Brand"
                value={form.values.brandId}
                onChange={(val) => form.setFieldValue("brandId", val)}
                data={brandOptions}
                onAddClick={() => setBrandModalOpen(true)}
              />
              <BrandCreateModal
                opened={brandModalOpen}
                onClose={() => setBrandModalOpen(false)}
                onSuccess={(newBrand) => {
                  form.setFieldValue("brandId", newBrand.id.toString());
                }}
              />

              <SelectWithAdd
                label="Vendor"
                value={form.values.vendorId}
                onChange={(val) => form.setFieldValue("vendorId", val)}
                data={vendorOptions}
                onAddClick={() => setVendorModalOpen(true)}
              />
              <VendorCreateModal
                opened={vendorModalOpen}
                onClose={() => setVendorModalOpen(false)}
                onSuccess={(newVendor) => {
                  form.setFieldValue("vendorId", newVendor.id.toString());
                }}
              />

         

              <DateInput
                label="Purchase Date"
                withAsterisk
                value={form.values.purchaseDate}
                onChange={(v) => form.setFieldValue("purchaseDate", v)}
                error={form.errors.purchaseDate}
              />

              <RichTextInput
                label="Notes"
                value={form.values.notes}
                onChange={(val) => form.setFieldValue("notes", val)}
                {...form.getInputProps("notes")}
              />

              <FileUploadArea images={images} setImages={setImages} />

              <Button type="submit" loading={createMutation.isLoading}>
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
