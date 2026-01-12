import React, { useRef } from "react";
import { useDrag, useDrop } from "react-dnd";
import { Paper, Stack, Text, Badge, Group, Flex } from "@mantine/core";
import { COLUMN_NAMES } from "../../Pages/AssetMapping/data";

const ITEM_TYPE = "TASK";

const MovableItem = ({
  id,
  name,
  index,
  column,
  moveCardHandler,
  category,
  subCategory,
  isReadOnly = false,
}) => {
  const ref = useRef(null);

  const [, drop] = useDrop({
    accept: ITEM_TYPE,
    canDrop: () => !isReadOnly,
    hover(item) {
      if (isReadOnly) return;
      if (!ref.current || item.id === id) return;
      if (index === undefined || !moveCardHandler) return;

      moveCardHandler(item.index, index, item.column);
      item.index = index;
      item.column = column;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: ITEM_TYPE,
    item: isReadOnly ? {} : { id, index, column },
    canDrag: !isReadOnly,
  });

  if (!isReadOnly) drag(drop(ref));

  return (
    <Paper
      ref={ref}
      p="md"
      mb="sm"
      withBorder
      radius="md"
      shadow="sm"
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: isReadOnly ? "default" : "grab",
        backgroundColor: isReadOnly
          ? "#f8f9fa"
          : column === COLUMN_NAMES.ASSET
          ? "#e7f5ff"
          : "#fff0f6",
      }}
    >
      <Stack spacing={6}>
        {/* 🔥 Name + Category + SubCategory */}
        <Flex
          justify="space-between"
          align="center"
          wrap="wrap"
          gap={6}
        >
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
        </Flex>
      </Stack>
    </Paper>
  );
};

export default MovableItem;
