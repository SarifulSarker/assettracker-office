import React from "react";
import { Stack, Paper, Text, Badge, Group, Divider } from "@mantine/core";
import { ASSET_LOG_CONTEXT } from "../../utils/ASSET_LOG_CONTEXT";

/* ---------------- helpers ---------------- */

// UPDATE log parser
const extractChanges = (description = "") => {
  try {
    if (description.startsWith("{")) {
      return JSON.parse(description);
    }
    const jsonPart = description.replace("Updated fields:", "").trim();
    return JSON.parse(jsonPart);
  } catch {
    return null;
  }
};

// ASSIGN log parser
const extractAssignInfo = (description = "") => {
  try {
    if (!description) return null;

    const parsed =
      typeof description === "string" ? JSON.parse(description) : description;

    if (parsed.action !== "ASSIGN") return null;

    const emp = parsed.employee || {};

    return {
      name: emp.name || "N/A",
      email: emp.email || "N/A",
      department: emp.department?.name || "N/A",
      designation: emp.designation?.name || "N/A",
      assignedAt: parsed.assignedAt || null,
    };
  } catch (err) {
    console.error("Failed to parse assign info", err);
    return null;
  }
};

// Value formatter
const formatValue = (value) => {
  if (value === null || value === undefined) return "N/A";

  const date = new Date(value);
  if (!isNaN(date.getTime()) && typeof value !== "number") {
    return date.toLocaleDateString();
  }

  return String(value);
};

/* ---------------- component ---------------- */

const AssetContextLogs = ({ logs, context }) => {
  if (!logs.length) {
    return (
      <Text size="sm" c="dimmed">
        No context logs found
      </Text>
    );
  }

  return (
    <Stack spacing="sm">
      {logs.map((log) => {
        const updateChanges =
          context === ASSET_LOG_CONTEXT.UPDATE
            ? extractChanges(log.description)
            : null;

        const assignInfo =
          context === ASSET_LOG_CONTEXT.ASSIGN
            ? extractAssignInfo(log.description)
            : null;

        console.log(assignInfo);

        return (
          <Paper key={log.id} withBorder radius="md" p="md">
            {/* ---------- Header ---------- */}
            <Group justify="space-between">
              <Group spacing="xs">
                <Badge size="xs" variant="light">
                  {context}
                </Badge>
                <Text size="sm" fw={500}>
                  by {log.issuer}
                </Text>
              </Group>

              <Text size="xs" c="dimmed">
                {new Date(log.createdAt).toLocaleString()}
              </Text>
            </Group>

            {/* ---------- UPDATE ---------- */}
            {updateChanges && (
              <>
                <Divider my="xs" />
                <Stack spacing={6}>
                  {Object.entries(updateChanges).map(([field, value]) => (
                    <Group key={field} spacing="xs" align="flex-start">
                      <Text size="sm" fw={500}>
                        {field}:
                      </Text>
                      <Text size="sm" c="dimmed">
                        {formatValue(value.from)}
                      </Text>
                      <Text size="sm">→</Text>
                      <Text size="sm" fw={500}>
                        {formatValue(value.to)}
                      </Text>
                    </Group>
                  ))}
                </Stack>
              </>
            )}

            {/* ---------- ASSIGN ---------- */}
            {assignInfo && (
              <>
                <Divider my="xs" />
                <Stack spacing={4}>
                  {assignInfo && (
                    <Stack spacing={4}>
                      <Text>Assign To:</Text>
                      <Text>Name: {assignInfo.name}</Text>
                      <Text size="sm" c="dimmed">
                       email: {assignInfo.email}
                      </Text>
                      <Text size="sm">Department: {assignInfo.department}</Text>
                      <Text size="sm">Designation: {assignInfo.designation}</Text>
                    </Stack>
                  )}

                  {assignInfo.assignedAt && (
                    <Text size="xs" c="dimmed">
                      Assigned At:{" "}
                      {new Date(assignInfo.assignedAt).toLocaleString()}
                    </Text>
                  )}
                </Stack>
              </>
            )}
          </Paper>
        );
      })}
    </Stack>
  );
};

export default AssetContextLogs;
