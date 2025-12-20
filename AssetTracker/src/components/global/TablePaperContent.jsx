import { Paper, Stack } from "@mantine/core";
import React from "react";

const TablePaperContent = ({
  filters,
  filterBadges,
  exportAndPagination,
  table,
}) => {
  return (
    <Paper
      // shadow="xs"
      p="md"
      // mt="20px"
      style={{
        height: "calc(100vh - 130px)",
      }}
    >
      <Stack
        style={{
          height: "100%",
        }}
        justify="space-between"
        gap={0}
      >
        <Stack>{filters}</Stack>
        <Stack>{filterBadges}</Stack>
        <Stack
          style={{
            flex: 1,
          }}
        >
          {table}
        </Stack>
        <Stack>{exportAndPagination}</Stack>
      </Stack>
    </Paper>
  );
};

export default TablePaperContent;
