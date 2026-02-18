import { Paper, Text } from "@mantine/core";
import { useDrop } from "react-dnd";

const ITEM_TYPE = "TASK";
const Column = ({
  title,
  children,
  onDropItem,
  allowedDropFrom = [],
  style,
}) => {
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: ITEM_TYPE,

    // 🔥 DROP ALLOWED kina check
    canDrop: (item) => {
      return allowedDropFrom.includes(item.column);
    },

    drop: (item) => {
      if (!allowedDropFrom.includes(item.column)) return;
      onDropItem?.(item, title);
    },

    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  // const getBg = () => {
  //   if (isOver) return canDrop ? "#b2f2bb" : "#ff8787";
  //   return "#f8f9fa";
  // };

  return (
    <Paper
      ref={onDropItem ? drop : null} // 🔥 no drop zone if no handler
      p="lg"
      shadow="sm"
      radius="md"
      withBorder
      style={{
        height: 750,
       
        overflowY: "auto",
        ...style,
      }}
    >
      <Text fw={700} align="center" mb="md">
        {title}
      </Text>
      {children}
    </Paper>
  );
};

export default Column;
