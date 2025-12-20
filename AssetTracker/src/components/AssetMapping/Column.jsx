import { Paper, Text } from "@mantine/core";
import { useDrop } from "react-dnd";

const ITEM_TYPE = "TASK";

const Column = ({ title, children, onDropItem, isActive }) => {
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: ITEM_TYPE,
    drop: (item) => onDropItem(item, title),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  const getBg = () => {
    if (isOver) return canDrop ? "#b2f2bb" : "#ff8787";
    return isActive ? "#ffd8a8" : "#f8f9fa";
  };

  return (
    <Paper
      ref={drop}
      p="lg"
      shadow="xl"
      radius="md"
      withBorder
      style={{
        width: 350,
        height: 600,
        backgroundColor: getBg(),
        overflowY: "auto",
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
