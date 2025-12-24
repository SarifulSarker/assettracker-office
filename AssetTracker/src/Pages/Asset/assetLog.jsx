// AssetLog.jsx
import React from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Text, Stack, Paper, Divider, Badge, ScrollArea } from "@mantine/core";
import { getEmployeesByAssetApi } from "../../services/assetMapping";
import PageTop from "../../components/global/PageTop";

const AssetLog = () => {
  const { id } = useParams(); // asset ID from route
  const { data, isLoading, isError } = useQuery({
    queryKey: ["asset-logs", id],
    queryFn: () => getEmployeesByAssetApi(id),
    enabled: !!id,
  });

  const logs = data?.data ?? [];

  return (
    <>
    
      <PageTop PAGE_TITLE="Asset Logs" backBtn />
      <ScrollArea style={{ height: "80vh" }} px="md" py="md">
        <Stack spacing="md">
          <Text fw={700} size="lg">
            Asset Logs
          </Text>

          {isLoading && <Text>Loading...</Text>}
          {isError && <Text color="red">Failed to fetch logs</Text>}
          {!isLoading && logs.length === 0 && <Text>No logs found</Text>}

          {logs.map((log) => (
            <Paper key={log.id} p="md" shadow="sm" withBorder>
              <Stack spacing={4}>
                <Text>
                  <b>Employee:</b> {log.employee?.fullName || "Unknown"}
                </Text>
                <Text>
                  <b>Assigned At:</b> {new Date(log.createdAt).toLocaleString()}
                </Text>
                <Text>
                  <b>Unassigned At:</b>{" "}
                  {log.unassignedAt
                    ? new Date(log.unassignedAt).toLocaleString()
                    : "-"}
                </Text>
                <Badge color={log.unassignedAt ? "gray" : "green"}>
                  {log.unassignedAt ? "Inactive" : "Active"}
                </Badge>
              </Stack>
            </Paper>
          ))}
        </Stack>
      </ScrollArea>
    </>
  );
};

export default AssetLog;
