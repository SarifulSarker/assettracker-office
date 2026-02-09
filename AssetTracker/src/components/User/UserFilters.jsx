import React from "react";
import { Flex, Button, TextInput, Select, Group } from "@mantine/core";
import { IconRefresh, IconPlus, IconUserShield } from "@tabler/icons-react";
import { usePermissions } from "../../hooks/useAuthPermissions.js";

const UserFilters = ({
  searchKey,
  onSearchChange,
  onRefresh,
  onCreate,
  status,
  onStatusChange,
}) => {
  const { hasPermission } = usePermissions();

  return (
    <Flex justify="space-between" align="center" mb="sm">
      {/* Left: Search + Status + Refresh */}
      <Flex gap="sm" align="center">
        <TextInput
          placeholder="Search by name or email..."
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

      {/* Right: Create User Button */}
      <Group>
        {hasPermission("user", "add") && (
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
        )}
      </Group>
    </Flex>
  );
};

export default UserFilters;
