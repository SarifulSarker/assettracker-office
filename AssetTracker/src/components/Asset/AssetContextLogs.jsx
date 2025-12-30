// AssetContextLogs.jsx
import React from "react";
import { Stack, Paper, Text, Badge, Group } from "@mantine/core";
import { ASSET_LOG_CONTEXT } from "../../utils/ASSET_LOG_CONTEXT";
const AssetContextLogs = ({ logs , context }) => {
 
  if (!logs.length) return <Text size="sm">No context logs found</Text>;

  return (
    <Stack spacing="xs">
      {logs.map((log) => (
        <Paper key={log.id} p="sm" radius="sm" withBorder shadow="xs">
          {/* context by log.issuer */}
          <Text component="div" size="sm">
            {context} by: {log.issuer}
          </Text>
        </Paper>
      ))}
    </Stack>
  );
};

export default AssetContextLogs;
