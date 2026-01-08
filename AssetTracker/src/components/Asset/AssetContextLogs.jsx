import React from "react";
import { Stack, Paper, Text, Badge, Group, Divider } from "@mantine/core";
import { ASSET_LOG_CONTEXT } from "../../utils/ASSET_LOG_CONTEXT";

/* ---------------- helpers ---------------- */
const stripHtml = (html = "") => {
  return html.replace(/<[^>]*>/g, "").trim();
};

// UPDATE log parser (JSON only)
const extractChanges = (description = "") => {
  if (!description) return null;

  try {
    // 1. HTML remove
    const plainText = stripHtml(description);

    // 2. "Updated fields:" থাকলে remove
    const cleanedText = plainText.includes("Updated fields:")
      ? plainText.replace("Updated fields:", "").trim()
      : plainText;

    // 3. JSON object extract ( { ... } )
    const match = cleanedText.match(/{[\s\S]*}/);
    if (!match) return null;

    return JSON.parse(match[0]);
  } catch (e) {
    console.error("Failed to parse update log", e);
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

// SAFE value formatter
const formatValue = (value) => {
  if (value === null || value === undefined) return "N/A";

  // only ISO date string → date
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
    return new Date(value).toLocaleString();
  }

  return String(value);
};

/* ---------------- component ---------------- */

const AssetContextLogs = ({ logs, context }) => {
  if (!logs?.length) {
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
                {Object.entries(updateChanges).map(([field, value]) => {
                  // 🔹 SPECS: old → new (multiline, Group only)
                  if (field === "specs") {
                    const formatSpecs = (text) =>
                      text
                        ? text
                            .split("\n")
                            .map((line, i) =>
                              i === 0 ? line : "            " + line
                            )
                            .join("\n")
                        : "N/A";

                    return (
                      <Group key={field} align="flex-start" spacing="sm">
                        <Text size="sm" fw={500} style={{ minWidth: 60 }}>
                          Specs:
                        </Text>

                        <Text
                          size="sm"
                          component="div"
                          c="dimmed"
                          style={{
                            whiteSpace: "pre-wrap",
                            lineHeight: 1.5,
                            flex: 1,
                          }}
                        >
                          {formatSpecs(value?.from)}
                        </Text>

                        <Text size="sm" fw={500}>
                          →
                        </Text>

                        <Text
                          size="sm"
                          component="div"
                          fw={500}
                          style={{
                            whiteSpace: "pre-wrap",
                            lineHeight: 1.5,
                            flex: 1,
                          }}
                        >
                          {formatSpecs(value?.to)}
                        </Text>
                      </Group>
                    );
                  }

                  // 🔹 DEFAULT: normal fields
                  return (
                    <Group key={field} spacing="xs" align="center">
                      <Text size="sm" fw={500}>
                        {field}:
                      </Text>
                      <Text size="sm" c="dimmed">
                        {formatValue(value?.from)}
                      </Text>
                      <Text size="sm">→</Text>
                      <Text size="sm" fw={500}>
                        {formatValue(value?.to)}
                      </Text>
                    </Group>
                  );
                })}
              </>
            )}

            {/* ---------- ASSIGN ---------- */}
            {assignInfo && (
              <>
                <Divider my="xs" />
                <Stack spacing={4}>
                  <Text fw={500}>Assigned To</Text>
                  <Text size="sm">Name: {assignInfo.name}</Text>
                  <Text size="sm" c="dimmed">
                    Email: {assignInfo.email}
                  </Text>
                  <Text size="sm">Department: {assignInfo.department}</Text>
                  <Text size="sm">Designation: {assignInfo.designation}</Text>

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
