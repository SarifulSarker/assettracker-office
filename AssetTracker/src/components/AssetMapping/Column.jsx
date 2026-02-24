import { Paper, Text } from "@mantine/core";

const Column = ({ title, children, style }) => {
  return (
    <Paper
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
