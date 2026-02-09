import React from "react";
import { Flex, Button, TextInput, Select } from "@mantine/core";
import { IconRefresh, IconPlus } from "@tabler/icons-react";
import { usePermissions } from "../../hooks/useAuthPermissions.js";

const DesignationFilters = ({
  searchKey,
  onSearchChange,
  status,
  onStatusChange,
  onRefresh,
  onCreate,
}) => {
  const { hasPermission } = usePermissions();

  return (
    <Flex justify="space-between" align="center" mb="sm">
      {/* Left: Search + Status + Refresh */}
      <Flex gap="sm" align="center">
        <TextInput
          placeholder="Search designation..."
          value={searchKey}
          onChange={onSearchChange}
        />

        <Select
          placeholder="Select Status"
          value={status}
          onChange={onStatusChange}
          data={[
            { value: "active", label: "Active" },
            { value: "inactive", label: "Inactive" },
          ]}
          allowDeselect={false}
        />

        <Button onClick={onRefresh}>
          <IconRefresh size={16} />
        </Button>
      </Flex>

      {/* Right: Create Designation */}
      {hasPermission("designation", "add") && (
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={onCreate}
          style={{ backgroundColor: "#0f4794", color: "#fff", borderRadius: 8 }}
        >
          Create Designation
        </Button>
      )}
    </Flex>
  );
};

export default DesignationFilters;
