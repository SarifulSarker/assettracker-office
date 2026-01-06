import React from "react";
import { Flex, Button, TextInput, Select } from "@mantine/core";
import { IconRefresh, IconPlus } from "@tabler/icons-react";

const EmployeeFilters = ({
  searchKey,
  onSearchChange,
  status,
  onStatusChange,
  onRefresh,
  onCreate,
}) => {
  return (
    <Flex justify="space-between" align="center" mb="sm">
      {/* Left: Search + Status + Refresh */}
      <Flex gap="sm" align="center">
        <TextInput
          placeholder="Search by name, email or phone..."
          value={searchKey}
          onChange={onSearchChange}
        />

        <Select
         allowDeselect={false}
          placeholder="Select Status"
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
      </Flex>

      {/* Right: Create Employee */}
      <Button
        leftSection={<IconPlus size={16} />}
        onClick={onCreate}
        style={{ backgroundColor: "#0f4794", color: "#fff", borderRadius: 8 }}
      >
        Create Employee
      </Button>
    </Flex>
  );
};

export default EmployeeFilters;
