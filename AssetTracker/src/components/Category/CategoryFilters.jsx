import React from "react";
import { Flex, Button, Select, TextInput } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { IconRefresh, IconPlus } from "@tabler/icons-react";

const CategoryFilters = ({
  searchKey,
  onSearch, // ✅ receive onSearch instead of setSearchKey
  selectedType,
  setSelectedType,
  onRefresh,
  onCreateCategory,
  onCreateSubCategory,
}) => {

  return (
    <Flex justify="space-between" align="center" mb="s">
      {/* Left: Search + Refresh */}
      <Flex gap="sm" align="center">
        <TextInput
          placeholder="Search by name..."
          value={searchKey}
          onChange={onSearch} // ✅ use onSearch here
        />
       
        

        <Button onClick={onRefresh}>
          <IconRefresh size={16} />
        </Button>
      </Flex>

      {/* Right: Type filter + create buttons */}
      <Flex gap="sm" align="center">
        <Select
          placeholder="Pick type"
          value={selectedType}
          onChange={setSelectedType}
          data={[
            { label: "Category", value: "category" },
            { label: "Subcategory", value: "subcategory" },
          ]}
        />
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={onCreateCategory} // <-- use the prop
        >
          Create Category
        </Button>
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={onCreateSubCategory}
        >
          Create Subcategory
        </Button>
      </Flex>
    </Flex>
  );
};

export default CategoryFilters;
