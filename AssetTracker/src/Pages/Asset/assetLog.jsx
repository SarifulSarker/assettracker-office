import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Text,
  Stack,
  Paper,
  Divider,
  Badge,
  Group,
  Select,
  Loader,
  Center,
} from "@mantine/core";

import {
  getEmployeesByAssetApi,
  getAssetLogsApi,
} from "../../services/assetMapping";
import { getAssetByIdApi } from "../../services/asset";
import PageTop from "../../components/global/PageTop";
import { ASSET_LOG_CONTEXT } from "../../utils/ASSET_LOG_CONTEXT";
import AssetContextLogs from "../../components/Asset/AssetContextLogs";

const AssetLog = () => {
  const { uid } = useParams();
  const [context, setContext] = useState(null);

  /* ---------------- Asset Info ---------------- */
  const { data: assetData, isLoading: assetLoading } = useQuery({
    queryKey: ["asset", uid],
    queryFn: () => getAssetByIdApi(uid),
    enabled: !!uid,
  });

  const asset = assetData?.data;
  const assetID = asset?.id;

  /* ---------------- Logs ---------------- */
  const {
    data: logData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["asset-logs", uid, context],
    queryFn: () =>
      context
        ? getAssetLogsApi({ assetId: assetID, context })
        : getEmployeesByAssetApi(uid),
    enabled: !!assetID,
  });

  const logs = context ? logData ?? [] : logData?.data ?? [];
  const activeLog = logs.find((l) => !l.unassignedAt);

  /* ---------------- UI ---------------- */
  return (
    <Stack spacing="md" px="md">
      <PageTop PAGE_TITLE="Asset Logs" backBtn />

      {/* Filter */}
      <Group justify="space-between">
        <Select
          label="Log Context"
          placeholder="All logs"
          data={Object.values(ASSET_LOG_CONTEXT)}
          value={context}
          onChange={setContext}
          clearable
          w={220}
        />
      </Group>

      {/* Context based view */}
      {context ? (
        <AssetContextLogs logs={logs} context={context} />
      ) : (
        <>
          {/* Asset Summary */}
          <Paper withBorder radius="md" p="md">
            {assetLoading ? (
              <Center>
                <Loader size="sm" />
              </Center>
            ) : (
              <Stack spacing={4}>
                <Text fw={600}>Asset: {asset?.name || "N/A"}</Text>

                <Group spacing="xs">
                  <Text size="sm" c="dimmed">
                    Current Status
                  </Text>
                  <Badge
                    color={activeLog ? "green" : "gray"}
                    variant="light"
                  >
                    {activeLog ? "ASSIGNED" : "UNASSIGNED"}
                  </Badge>
                </Group>

                {activeLog && (
                  <>
                    <Divider my="xs" />
                    <Text size="sm">
                      <b>Assigned To:</b>{" "}
                      {activeLog.employee?.fullName || "Unknown"}
                    </Text>
                    <Text size="sm">
                      <b>Assigned At:</b>{" "}
                      {new Date(activeLog.createdAt).toLocaleString()}
                    </Text>
                  </>
                )}
              </Stack>
            )}
          </Paper>

          {/* Logs */}
          <Stack spacing="sm">
            {isLoading && (
              <Center>
                <Loader size="sm" />
              </Center>
            )}

            {isError && (
              <Text c="red" size="sm">
                Failed to load logs
              </Text>
            )}

            {!isLoading && logs.length === 0 && (
              <Text size="sm" c="dimmed">
                No logs found
              </Text>
            )}

            {logs.map((log) => (
              <Paper key={log.id} withBorder radius="sm" p="sm">
                <Group justify="space-between">
                  <Text size="sm">
                    <b>{log.employee?.fullName || "Unknown"}</b>
                  </Text>
                  <Badge
                    size="xs"
                    color={log.unassignedAt ? "gray" : "green"}
                    variant="light"
                  >
                    {log.unassignedAt ? "Inactive" : "Active"}
                  </Badge>
                </Group>

                <Text size="xs" c="dimmed">
                  Assigned: {new Date(log.createdAt).toLocaleString()}
                </Text>

                {log.unassignedAt && (
                  <Text size="xs" c="dimmed">
                    Unassigned:{" "}
                    {new Date(log.unassignedAt).toLocaleString()}
                  </Text>
                )}
              </Paper>
            ))}
          </Stack>
        </>
      )}
    </Stack>
  );
};

export default AssetLog;
