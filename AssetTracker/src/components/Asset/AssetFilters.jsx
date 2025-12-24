import React from "react";
import { Flex, Button, TextInput, Select } from "@mantine/core";
import { IconRefresh, IconPlus } from "@tabler/icons-react";

const AssetFilters = ({ searchKey, onSearchChange, status, onStatusChange, onRefresh, onCreate }) => {
  return (
    <Flex justify="space-between" align="center" mb="sm">
      {/* Left: Search + Status + Refresh */}
      <Flex gap="sm" align="center">
        <TextInput
          placeholder="Search by asset name..."
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
        />

        <Button onClick={onRefresh}>
          <IconRefresh size={16} />
        </Button>
      </Flex>

      {/* Right: Create Asset */}
      <Button
        leftSection={<IconPlus size={16} />}
        onClick={onCreate}
        style={{ backgroundColor: "#0f4794", color: "#fff", borderRadius: 8 }}
      >
        Create Asset
      </Button>
    </Flex>
  );
};

export default AssetFilters;
