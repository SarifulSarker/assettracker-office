import React from "react";
import { Flex, Button, TextInput } from "@mantine/core";
import { IconRefresh, IconPlus } from "@tabler/icons-react";

const VendorFilters = ({ searchKey, onSearchChange, onRefresh, onCreate }) => {
  return (
    <Flex justify="space-between" align="center" mb="sm">
      <Flex gap="sm" align="center">
        <TextInput
          placeholder="Search by vendor name..."
          value={searchKey}
          onChange={onSearchChange}
        />
        <Button onClick={onRefresh}>
          <IconRefresh size={16} />
        </Button>
      </Flex>

      <Button
        leftSection={<IconPlus size={16} />}
        onClick={onCreate}
        style={{ backgroundColor: "#0f4794", color: "#fff", borderRadius: 8 }}
      >
        Create Vendor
      </Button>
    </Flex>
  );
};

export default VendorFilters;
