import React from "react";
import { Paper, Stack, Text, Badge, Group, Flex, Checkbox } from "@mantine/core";

const AssetItem = ({ id, name, category, subCategory, selected, onCheck, onCross, isReadOnly }) => {
  return (
    <Paper
      p="md"
      mt="sm"
      withBorder
      radius="md"
      style={{
        backgroundColor: isReadOnly ? "#f8f9fa" : "#e7f5ff",
      }}
    >
      <Stack spacing={6}>
        <Flex justify="space-between" align="center" wrap="wrap" gap={6}>
          <Group spacing={6}>
            {/* Checkbox for assets only */}
            {!isReadOnly && (
              <Checkbox
                checked={selected}
                onChange={() => onCheck?.(id)}
                size="lg"
                styles={{
                  input: { width: 24, height: 24 },
                }}
              />
            )}

            {/* Name + Badges */}
            <div>
              <Text fw={600} fz="sm" lineClamp={1}>
                {name}
              </Text>
              <Group spacing={6}>
                {category && <Badge size="xs" variant="light" color="blue">{category}</Badge>}
                {subCategory && <Badge size="xs" variant="light" color="gray">{subCategory}</Badge>}
              </Group>
            </div>
          </Group>

          {/* Cross button for employee assigned assets */}
          {isReadOnly && onCross && (
            <button
              onClick={() => onCross?.(id)}
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
        </Flex>
      </Stack>
    </Paper>
  );
};

export default AssetItem;