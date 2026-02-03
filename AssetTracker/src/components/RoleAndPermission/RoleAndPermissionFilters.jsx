import React from "react";
import { Flex, Button, TextInput, Select, Group } from "@mantine/core";
import { IconRefresh, IconPlus, IconUserShield } from "@tabler/icons-react";

const RoleAndPermissionFilters = ({
  searchKey,
  onSearchChange,
  onRefresh,
  onCreate,
}) => {
  return (
    <>
      {/* Right: Create User Button */}
      <Group>
        <Button onClick={onRefresh}>
          <IconRefresh size={16} />
        </Button>
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={onCreate}
          style={{
            backgroundColor: "#0f4794",
            color: "#fff",
            borderRadius: 8,
          }}
        >
          Create Role
        </Button>
      </Group>
    </>
  );
};

export default RoleAndPermissionFilters;
