import React, { useRef } from "react";
import { useDrag, useDrop } from "react-dnd";
import { Paper } from "@mantine/core";
import { COLUMN_NAMES } from "../../Pages/AssetMapping/data.js";

const ITEM_TYPE = "TASK";

const MovableItem = ({ id, name, index, column, moveCardHandler }) => {
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
      shadow="md"
      radius="md"
      className={`movable-item ${isOverCurrent ? "glow" : ""}`}
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: "grab",
        backgroundColor:
          column === COLUMN_NAMES.ASSET ? "#d0ebff" : "#ffe3e3",
      }}
    >
      {name}
    </Paper>
  );
};

export default MovableItem;
