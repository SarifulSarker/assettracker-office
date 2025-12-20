import React, { useState } from "react";
import { Flex, Button, Text, Group } from "@mantine/core";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";

import PageTop from "../../components/global/PageTop.jsx";
import TablePaperContent from "../../components/global/TablePaperContent";
import CustomTable from "../../components/global/CustomTable";
import CustomPagination from "../../components/global/CustomPagination";
import CategoryFilters from "../../components/Category/CategoryFilters";
import { closeAllModals, modals } from "@mantine/modals";
import {
  getAllCategoriesApi,

  deleteCategoryApi,
} from "../../services/category.js";
import { notifications } from "@mantine/notifications";
import CategoryCreateModal from "../../components/Category/CategoryCreateModal";
import CategoryEditModal from "../../components/Category/CategoryEditModal";
import { IconEdit, IconTrash } from "@tabler/icons-react";
import SubCategoryCreateModal from "../../components/SubCategory/SubCategoryCreateModal.jsx";
import useDebounce from "../../hooks/useDebounce.js";

const PAGE_SIZE = 10;

const CategoryPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [selectedType, setSelectedType] = useState("category");
  const [searchKey, setSearchKey] = useState("");
  const [page, setPage] = useState(1);

  const [createModalOpened, setCreateModalOpened] = useState(false);
  const [CreateSubCategoryOpened, setCreateSubCategoryOpened] = useState(false);
  const [editModalOpened, setEditModalOpened] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  
  const debouncedSearch = useDebounce(searchKey, 2000); // 2 sec

  // fetch categories
  const { data, isPending, isLoading, isRefetching } = useQuery({
    queryKey: ["categories", page, debouncedSearch],
    queryFn: () =>
      getAllCategoriesApi({ page, perpage: PAGE_SIZE, search: debouncedSearch }),
    keepPreviousData: true,
  });

  const categories = data?.data?.categories || [];
  const total = data?.data?.total || 0;

  // reset page 1 when search changes
  const handleSearch = (e) => {
    setSearchKey(e.currentTarget.value);
    setPage(1); // search e page reset
  };

  // Table data
  const tableData = categories.flatMap((c) => {
    const mainCategory = {
      id: c.id,
      name: c.name,
      type: "category",
      category: null,
      createdAt: c.createdAt,
    };
    const subCategories = c.children.map((sc) => ({
      id: sc.id,
      name: sc.name,
      type: "subcategory",
      category: c.name,
      createdAt: sc.createdAt,
    }));
    return [mainCategory, ...subCategories];
  });

  const filteredData = tableData
    .filter((item) => (selectedType ? item.type === selectedType : true))
    .filter((item) =>
      searchKey
        ? item.name.toLowerCase().includes(searchKey.toLowerCase())
        : true
    );

  // Open edit modal
  const openEditModal = (category) => {
    setSelectedCategory(category);
    setEditModalOpened(true);
  };

  // Delete category
  const deleteMutation = useMutation({
    mutationFn: (id) => deleteCategoryApi(id),
    onSuccess: () => {
      notifications.show({
        title: "Deleted",
        message: "Deleted successfully",
        position: "top-center",
      });
      queryClient.invalidateQueries(["categories"]);
    },
    onError: (error) => {
      const msg = error.response?.data?.message || "Something went wrong";
      notifications.show({
        title: "Error",
        message: msg,
        position: "top-center",
      });
    },
  });

  const openDeleteModal = (id) => {
    modals.openConfirmModal({
      title: "Are you sure?",
      children: <Text size="sm">Do you want to delete this item?</Text>,
      labels: { confirm: "Confirm", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: () => deleteMutation.mutate(id),
    });
  };

  // Table headers
  const tableHeaders = [
    { key: "id", headerTitle: "ID" },
    { key: "name", headerTitle: "Name" },
    selectedType === "subcategory"
      ? { key: "category", headerTitle: "Category" }
      : null,
    {
      key: "createdAt",
      headerTitle: "Created At",
      row: (keyData) => dayjs(keyData).format("DD-MM-YYYY HH:mm"),
    },
    {
      key: "action",
      headerTitle: "Actions",
      row: (v, row) => (
        <Group spacing="xs">
          <Button
            size="xs"
            onClick={() => openEditModal(row)}
            style={{ backgroundColor: "#3b82f6", color: "#fff" }}
          >
            <IconEdit size={14} />
          </Button>

          <Button
            size="xs"
            onClick={() => openDeleteModal(row.id)}
            style={{ backgroundColor: "#ef4444", color: "#fff" }}
          >
            <IconTrash size={14} />
          </Button>
        </Group>
      ),
    },
  ].filter(Boolean);

  const handleRefresh = () => {
    setSearchKey("");
    setSelectedType("category");
    setPage(1);
    refetch();
  };

  if (isLoading) return <Text>Loading...</Text>;

  return (
    <div>
      <PageTop PAGE_TITLE="Category & Subcategory Management" backBtn={false} />

      <TablePaperContent
        filters={
          <CategoryFilters
            searchKey={searchKey}
            onSearch={handleSearch} // ✅ add this
            selectedType={selectedType}
            setSelectedType={setSelectedType}
            onRefresh={handleRefresh}
            onCreateCategory={() => setCreateModalOpened(true)}
            onCreateSubCategory={() => setCreateSubCategoryOpened(true)}
          />
        }
        filterBadges={null}
        exportAndPagination={
          <Flex justify="flex-end" align="center">
            <CustomPagination
              page={page}
              setPage={setPage}
              total={total}
              pageSize={PAGE_SIZE}
            />
          </Flex>
        }
        table={
          <CustomTable
            tableHeaders={tableHeaders}
            data={filteredData}
            isFetching={isPending || isLoading || isRefetching}
          />
        }
      />

      <CategoryCreateModal
        opened={createModalOpened}
        onClose={() => setCreateModalOpened(false)}
        onSuccess={() => queryClient.invalidateQueries(["categories"])}
      />

      <CategoryEditModal
        opened={editModalOpened}
        onClose={() => setEditModalOpened(false)}
        category={selectedCategory}
        onSuccess={() => queryClient.invalidateQueries(["categories"])}
      />

      <SubCategoryCreateModal
        opened={CreateSubCategoryOpened}
        onClose={() => setCreateSubCategoryOpened(false)}
        categories={categories} // ✅ পাঠাতে পারো যদি চাই
        onSuccess={() => queryClient.invalidateQueries(["categories"])}
      />
    </div>
  );
};

export default CategoryPage;
