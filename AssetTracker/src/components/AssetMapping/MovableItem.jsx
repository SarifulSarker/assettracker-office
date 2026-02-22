import React, { useState, useEffect } from "react";
import { Paper, Stack, Text, Badge, Group, Flex, Checkbox } from "@mantine/core";
import { COLUMN_NAMES } from "../../Pages/AssetMapping/data";

const MovableItem = ({
  id,
  name,
  column,
  category,
  subCategory,
  isReadOnly = false,
  onCheck,
  onCross,
}) => {
  const [checked, setChecked] = useState(false);

  // 🔥 Checkbox click handler
  const handleCheckChange = () => {
    setChecked(true); // tik mark dekha
    onCheck?.({ id }); // automatic move
  };

  return (
    <Paper
      p="md"
      mt="sm"
      withBorder
      radius="md"
      style={{
        backgroundColor: isReadOnly
          ? "#f8f9fa"
          : column === COLUMN_NAMES.ASSET
          ? "#e7f5ff"
          : "#fff0f6",
      }}
    >
      <Stack spacing={6}>
        <Flex justify="space-between" align="center" wrap="wrap" gap={6}>
          <Group spacing={6}>
            {/* ✅ Asset Checkbox */}
            {column === COLUMN_NAMES.ASSET && !isReadOnly && (
              <Checkbox
                checked={checked}
                onChange={handleCheckChange}
                size="lg"
                styles={{
                  input: {
                    width: 24,
                    height: 24,
                  },
                }}
              />
            )}

            {/* ❌ Employee Cross */}
            {column === COLUMN_NAMES.EMPLOYEE && !isReadOnly && (
              <button
                onClick={() => onCross?.({ id })}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "red",
                  cursor: "pointer",
                  fontWeight: "bold",
                  fontSize: 18,
                }}
              >
                ✕
              </button>
            )}

            {/* Name + Badges */}
            <div>
              <Text fw={600} fz="sm" lineClamp={1}>
                {name}
              </Text>
              <Group spacing={6}>
                {category && (
                  <Badge size="xs" variant="light" color="blue">
                    {category}
                  </Badge>
                )}
                {subCategory && (
                  <Badge size="xs" variant="light" color="gray">
                    {subCategory}
                  </Badge>
                )}
              </Group>
            </div>
          </Group>
        </Flex>
      </Stack>
    </Paper>
  );
};

export default MovableItem;