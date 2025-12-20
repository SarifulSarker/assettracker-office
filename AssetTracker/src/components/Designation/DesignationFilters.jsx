import React from "react";
import { Flex, Button, TextInput } from "@mantine/core";
import { IconRefresh, IconPlus } from "@tabler/icons-react";

const DesignationFilters = ({
  searchKey,
  onSearchChange,
  onRefresh,
  onCreate,
}) => {
  return (
    <Flex justify="space-between" align="center" mb="sm">
      <Flex gap="sm">
        <TextInput
          placeholder="Search designation..."
          value={searchKey}
          onChange={onSearchChange}
        />
        <Button onClick={onRefresh}>
          <IconRefresh size={16} />
        </Button>
      </Flex>

      <Button leftSection={<IconPlus size={16} />} onClick={onCreate}>
        Create Designation
      </Button>
    </Flex>
  );
};

export default DesignationFilters;
