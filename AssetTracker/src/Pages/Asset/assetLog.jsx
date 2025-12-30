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
} from "@mantine/core";
import {
  getEmployeesByAssetApi,
  getAssetLogsApi,
} from "../../services/assetMapping";
import { getAssetByIdApi } from "../../services/asset";
import PageTop from "../../components/global/PageTop";
import { ASSET_LOG_CONTEXT } from "../../utils/ASSET_LOG_CONTEXT";
import AssetContextLogs from "../../components/Asset/AssetContextLogs"; // new component

const AssetLog = () => {
  const { uid } = useParams();
  const [context, setContext] = useState(""); // default: no context

  const { data: assetData } = useQuery({
    queryKey: ["asset", uid],
    queryFn: () => getAssetByIdApi(uid),
  });

  const assetName = assetData?.data?.name || "no name";
  const assetID = assetData?.data?.id;

  // Logs API
  const { data, isLoading, isError } = useQuery({
    queryKey: context ? ["asset-logs", uid, context] : ["asset-logs", uid],
    queryFn: () =>
      context
        ? getAssetLogsApi({ assetId: assetID, context }) // পুরো response পাঠানো হবে
        : getEmployeesByAssetApi(uid),
    enabled: !!uid,
  });

  let logs = [];
  if (context) {
    // getAssetLogsApi এর জন্য data?.data ব্যবহার
    logs = data ?? [];
  } else {
    // getEmployeesByAssetApi এর জন্য আগের মতো
    logs = data?.data ?? [];
  }
  const activeLog = logs.find((l) => !l.unassignedAt);

  return (
    <Stack spacing="sm" px="md">
      <PageTop PAGE_TITLE="Asset Logs" backBtn />

      {/* Context Select */}
      <Select
        label="Select context to show logs"
        placeholder="Pick value"
        data={["", ...Object.values(ASSET_LOG_CONTEXT)]}
        value={context}
        onChange={setContext}
        clearable
        maxDropdownHeight={150}
        style={{ width: 190 }}
      />

      {/* If context is selected, show AssetContextLogs only */}
      {context ? (
        <AssetContextLogs logs={logs} context={context} />
      ) : (
        <>
          {/* Asset Info */}
          <Paper
            withBorder
            radius="md"
            p="md"
            shadow="sm"
            style={{ background: "#fff" }}
          >
            <Group position="apart" align="flex-start">
              <Stack spacing={2}>
                <Text
                  fw={700}
                  size="md"
                  style={{ userSelect: "text" }}
                  component="div"
                >
                  Asset: {assetName}
                </Text>
                <Group align="flex">
                  <Text size="sm" c="dimmed" component="div">
                    Current Assignment Status
                  </Text>
                  <Badge
                    size="sm"
                    color={activeLog ? "green" : "gray"}
                    variant="light"
                  >
                    {activeLog ? "ASSIGNED" : "UNASSIGNED"}
                  </Badge>
                </Group>
              </Stack>
            </Group>

            {activeLog && (
              <>
                <Divider my="xs" />
                <Text component="div" size="sm" style={{ userSelect: "text" }}>
                  <b>Assigned To:</b>{" "}
                  {activeLog.employee?.fullName || "Unknown"}{" "}
                  <Badge
                    size="xs"
                    color="green"
                    variant="light"
                    style={{ marginLeft: 6 }}
                  >
                    Active
                  </Badge>
                </Text>
                <Text component="div" size="sm" style={{ userSelect: "text" }}>
                  <b>Assigned At:</b>{" "}
                  {new Date(activeLog.createdAt).toLocaleString()}
                </Text>
              </>
            )}
          </Paper>

          {/* Logs */}
          <Stack spacing="xs">
            {isLoading && <Text size="sm">Loading...</Text>}
            {isError && (
              <Text c="red" size="sm">
                Failed to fetch logs
              </Text>
            )}

            {!isLoading && logs.length === 0 && (
              <Text size="sm">No logs found</Text>
            )}
            {logs.map((log) => (
              <Paper key={log.id} p="sm" radius="sm" withBorder shadow="xs">
                <Group position="apart" spacing="sm" align="center">
                  <Text
                    component="div"
                    size="sm"
                    style={{ userSelect: "text" }}
                  >
                    <b>Assigned To:</b> {log.employee?.fullName || "Unknown"}{" "}
                    {!log.unassignedAt && (
                      <Badge
                        size="xs"
                        color="green"
                        variant="light"
                        style={{ marginLeft: 6 }}
                      >
                        Active
                      </Badge>
                    )}
                  </Text>
                  <Badge
                    size="xs"
                    color={log.unassignedAt ? "gray" : "green"}
                    variant="light"
                  >
                    {log.unassignedAt ? "Inactive" : "Active"}
                  </Badge>
                </Group>
                <Text component="div" size="sm" style={{ userSelect: "text" }}>
                  Assigned At: {new Date(log.createdAt).toLocaleString()}
                </Text>
                {log.unassignedAt && (
                  <Text
                    component="div"
                    size="sm"
                    style={{ userSelect: "text" }}
                  >
                    Unassigned At: {new Date(log.unassignedAt).toLocaleString()}
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
