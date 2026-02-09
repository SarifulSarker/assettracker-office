import React from "react";
import { Flex, Button, TextInput, Select } from "@mantine/core";
import { IconRefresh, IconPlus } from "@tabler/icons-react";
import { usePermissions } from "../hooks/useAuthPermissions.js";
import useResponsive from "../utils/useResponsive.js";
const StandardFilters = ({
  searchKey,
  onSearchChange,
  onRefresh,
  onCreate,
  status,
  onStatusChange,
  extraFilters, // JSX for additional filters
  showCreate = true,
}) => {
  const { hasPermission } = usePermissions();
  const { isMobile } = useResponsive();

  // ---------------- MOBILE LAYOUT ----------------
  if (isMobile) {
    return (
      <Flex direction="column" gap="sm" mb="sm">
        {/* Row 1: Search + Status */}
        <Flex gap="sm">
          <TextInput
            placeholder="Search..."
            value={searchKey}
            onChange={onSearchChange}
            style={{ flex: 1 }}
          />
          {status !== undefined && onStatusChange && (
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
          )}
        </Flex>

        {/* Row 2: Refresh + Create */}
        <Flex gap="sm">
          <Button onClick={onRefresh} style={{ flex: 1 }}>
            <IconRefresh size={16} />
          </Button>

          {showCreate && hasPermission("user", "add") && (
            <Button
              leftSection={<IconPlus size={16} />}
              onClick={onCreate}
              style={{ flex: 3, backgroundColor: "#0f4794", color: "#fff" }}
            >
              Create
            </Button>
          )}
        </Flex>

        {/* Row 3: Extra Filters */}
        {extraFilters && <Flex gap="sm">{extraFilters}</Flex>}
      </Flex>
    );
  }

  // ---------------- DESKTOP LAYOUT ----------------
  return (
    <Flex justify="space-between" align="center" mb="sm">
      {/* Left: Search + Status */}
      <Flex gap="sm" align="center">
        <TextInput
          placeholder="Search..."
          value={searchKey}
          onChange={onSearchChange}
        />
        {status !== undefined && onStatusChange && (
          <Select
            placeholder="Status"
            value={status}
            onChange={onStatusChange}
            data={[
              { value: "active", label: "Active" },
              { value: "inactive", label: "Inactive" },
            ]}
          />
        )}
        <Button onClick={onRefresh}>
          <IconRefresh size={16} />
        </Button>
        {extraFilters && extraFilters}
      </Flex>

      {/* Right: Create button */}
      {showCreate && hasPermission("user", "add") && (
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={onCreate}
          style={{ backgroundColor: "#0f4794", color: "#fff" }}
        >
          Create
        </Button>
      )}
    </Flex>
  );
};

export default StandardFilters;
