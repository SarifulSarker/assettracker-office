import React from "react";
import { Select, ActionIcon, Tooltip, Flex, Text } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";

const SelectWithAdd = ({
  label,
  value,
  onChange,
  data,
  disabled = false,
  onAddClick,
  error,
  placeholder,
}) => {
  return (
    <div style={{ width: "100%" }}>
      {/* Label + Icon in same row */}
      <Flex justify="space-between" align="center" mb={4}>
        <Text style={{ fontSize: "18px", fontWeight: 500 }}>{label}</Text>
        {onAddClick && (
          <Tooltip label={`Add ${label}`} withArrow position="top">
            <ActionIcon
              size="sm"
              variant="light"
              color="blue"
              onClick={(e) => {
                e.stopPropagation(); // prevent dropdown open
                onAddClick();
              }}
            >
              <IconPlus size={16} />
            </ActionIcon>
          </Tooltip>
        )}
      </Flex>

      {/* Select */}
      <Select
        placeholder={placeholder || `Select ${label}`}
        value={value}
        onChange={onChange}
        data={data}
        disabled={disabled}
        error={error}
      />
    </div>
  );
};

export default SelectWithAdd;
