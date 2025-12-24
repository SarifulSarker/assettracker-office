import React, { useRef } from "react";
import { useDrag, useDrop } from "react-dnd";
import { Paper, Stack, Text, Badge, Group } from "@mantine/core";
import { COLUMN_NAMES } from "../../Pages/AssetMapping/data.js";

const ITEM_TYPE = "TASK";

const MovableItem = ({
  id,
  name,
  index,
  column,
  moveCardHandler,
  vendor,
  specs,
  brand,
  subCategory,
}) => {
  const ref = useRef(null);

  const [{ isOverCurrent }, drop] = useDrop({
    accept: ITEM_TYPE,
    collect: (monitor) => ({
      isOverCurrent: monitor.isOver({ shallow: true }),
    }),
    hover(item, monitor) {
      if (!ref.current || item.id === id) return;

      const dragIndex = item.index;
      const hoverIndex = index;

      const hoverRect = ref.current.getBoundingClientRect();
      const hoverMiddleY = (hoverRect.bottom - hoverRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset.y - hoverRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;

      moveCardHandler(dragIndex, hoverIndex, item.column);
      item.index = hoverIndex;
      item.column = column;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: ITEM_TYPE,
    item: { id, index, column },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  drag(drop(ref));

  return (
    <Paper
      ref={ref}
      p="md"
      mb="sm"
      withBorder
      shadow="sm"
      radius="md"
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: "grab",
        backgroundColor: column === COLUMN_NAMES.ASSET ? "#e7f5ff" : "#fff0f6",
        transition: "box-shadow 0.2s ease",
      }}
      sx={(theme) => ({
        "&:hover": {
          boxShadow: theme.shadows.md,
        },
      })}
    >
      <Stack spacing={6}>
        {/* Asset Name */}
        <Text fw={600} fz="sm" lineClamp={1}>
          {name}
        </Text>

        {/* Info row */}
        <Group spacing={4} wrap="wrap">
          {/* {vendor && (
            <Badge color="gray" variant="light" size="xs">
              Vendor: {vendor}
            </Badge>
          )}
          {brand && (
            <Badge color="gray" variant="light" size="xs">
              Brand: {brand}
            </Badge>
          )}
          {subCategory && (
            <Badge color="gray" variant="light" size="xs">
              Subcat: {subCategory}
            </Badge>
          )} */}

          {specs && (
            <Badge color="gray" variant="light" size="xs">
              Specs: {specs}
            </Badge>
          )}
        </Group>
      </Stack>
    </Paper>
  );
};

export default MovableItem;
