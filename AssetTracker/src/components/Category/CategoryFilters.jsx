import React from "react";
import { Flex, Button, Select, TextInput } from "@mantine/core";
import { IconRefresh, IconPlus } from "@tabler/icons-react";
import { usePermissions } from "../../hooks/useAuthPermissions.js";
import useResponsive from "../../utils/useResponsive.js";

const CategoryFilters = ({
  searchKey,
  onSearch, 
  selectedType,
  setSelectedType,
  status,
  onStatusChange,
  onRefresh,
  onCreateCategory,
  onCreateSubCategory,
}) => {
  const { hasPermission } = usePermissions();
  const { isMobile } = useResponsive();

  if (isMobile) {
    // --------- MOBILE LAYOUT ---------
    return (
      <Flex direction="column" gap="sm" mb="sm">
        {/* Row 1: Search + Status */}
        <Flex gap="sm">
          <TextInput
            placeholder="Search by name..."
            value={searchKey}
            onChange={onSearch}
            style={{ flex: 1 }}
          />
          <Select
            placeholder="Status"
            value={status}
            onChange={onStatusChange}
            data={[
              { value: "active", label: "Active" },
              { value: "inactive", label: "Inactive" },
            ]}
            style={{ flex: 1 }}
          />
        </Flex>

        {/* Row 2: Refresh + Type */}
        <Flex gap="sm" mr={10}>
          <Button onClick={onRefresh} sx={{ flex: 1 }}>
            <IconRefresh size={16} />
          </Button>

          <Select
            placeholder="Pick type"
            value={selectedType}
            onChange={setSelectedType}
            data={[
              { label: "Category", value: "category" },
              { label: "Subcategory", value: "subcategory" },
            ]}
            style={{ flex: 1 }}
          />
        </Flex>

        {/* Row 3: Create buttons */}
        <Flex gap="sm">
          {hasPermission("category", "add") && (
            <Button
              leftSection={<IconPlus size={16} />}
              onClick={onCreateCategory}
              style={{ flex: 1 }}
            >
              Create Category
            </Button>
          )}
          {hasPermission("subcategory", "add") && (
            <Button
              leftSection={<IconPlus size={16} />}
              onClick={onCreateSubCategory}
              style={{ flex: 1 }}
            >
              Create Subcategory
            </Button>
          )}
        </Flex>
      </Flex>
    );
  }

  // --------- DESKTOP LAYOUT ---------
  return (
    <Flex justify="space-between" align="center" mb="sm">
      {/* Left: Search + Status + Refresh */}
      <Flex gap="sm" align="center">
        <TextInput
          placeholder="Search by name..."
          value={searchKey}
          onChange={onSearch}
        />
        <Select
          placeholder="Status"
          value={status}
          onChange={onStatusChange}
          data={[
            { value: "active", label: "Active" },
            { value: "inactive", label: "Inactive" },
          ]}
        />
        <Button onClick={onRefresh}>
          <IconRefresh size={16} />
        </Button>
        <Select
          placeholder="Pick type"
          value={selectedType}
          onChange={setSelectedType}
          data={[
            { label: "Category", value: "category" },
            { label: "Subcategory", value: "subcategory" },
          ]}
        />
      </Flex>

      {/* Right: Create buttons */}
      <Flex gap="sm">
        {hasPermission("category", "add") && (
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={onCreateCategory}
          >
            Create Category
          </Button>
        )}
        {hasPermission("subcategory", "add") && (
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={onCreateSubCategory}
          >
            Create Subcategory
          </Button>
        )}
      </Flex>
    </Flex>
  );
};

export default CategoryFilters;
