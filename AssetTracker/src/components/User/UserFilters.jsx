import React from "react";
import { Flex, Button, TextInput } from "@mantine/core";
import { IconRefresh, IconPlus } from "@tabler/icons-react";

const UserFilters = ({ searchKey, onSearchChange, onRefresh, onCreate }) => {
  console.log("Search from userFiler key:", searchKey);

  return (
    <Flex justify="space-between" align="center" mb="sm">
      {/* Left: Search + Refresh */}
      <Flex gap="sm" align="center">
        <TextInput
          placeholder="Search by name or email..."
          value={searchKey}
          onChange={onSearchChange}
        />

        <Button onClick={onRefresh}>
          <IconRefresh size={16} />
        </Button>
      </Flex>

      {/* Right: Create User Button */}
      <Button
        leftSection={<IconPlus size={16} />}
        onClick={onCreate}
        style={{
          backgroundColor: "#0f4794",
          color: "#fff",
          borderRadius: 8,
        }}
      >
        Create User
      </Button>
    </Flex>
  );
};

export default UserFilters;
