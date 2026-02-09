import React, { useState } from "react";
import {
  Modal,
  Stack,
  Paper,
  Text,
  Group,
  Badge,
  Divider,
  Button,
  Checkbox,
} from "@mantine/core";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { modals } from "@mantine/modals";
import {
  getAssetsByEmployeeApi,
  unassignAssetApi,
} from "../../services/assetMapping.js";
import { notifications } from "@mantine/notifications";
import { usePermissions } from "../../hooks/useAuthPermissions.js";

const EmployeeAssetsModal = ({ opened, onClose, employee }) => {
  const [selectedAssets, setSelectedAssets] = useState([]);
  const queryClient = useQueryClient();
  const { hasPermission } = usePermissions();

  const {
    data: response,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["employee-assets", employee?.id],
    queryFn: () => getAssetsByEmployeeApi(employee.id),
    enabled: opened && !!employee?.id,
  });

  const assignments = (response?.data ?? []).filter((a) => !a.unassignedAt);

  // Mutation for bulk unassign
  const unassignMutation = useMutation({
    mutationFn: (assetIds) => unassignAssetApi(assetIds),
    onSuccess: () => {
      notifications.show({
        title: "Success",
        message: "Selected assets unassigned successfully",
        position: "top-center",
      });
      setSelectedAssets([]);
      queryClient.invalidateQueries(["employee-assets", employee?.id]);
    },
  });

  const toggleSelectAsset = (id) => {
    setSelectedAssets((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  // Open confirmation modal before bulk unassign
  const confirmUnassignSelected = () => {
    if (selectedAssets.length === 0) {
      notifications.show({
        title: "No assets selected",
        message: "Please select at least one asset",
        color: "orange",
        position: "top-center",
      });
      return;
    }

    modals.openConfirmModal({
      title: "Unassign Selected Assets",
      children: (
        <Text size="sm">
          Are you sure you want to unassign {selectedAssets.length} selected
          asset
          {selectedAssets.length > 1 ? "s" : ""}?
        </Text>
      ),
      labels: { confirm: "Yes, Unassign", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: () => unassignMutation.mutate(selectedAssets),
    });
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={`Assets assigned to ${employee?.fullName || ""}`}
      size="lg"
      centered
    >
      <Stack spacing="md">
        {isLoading && <Text>Loading...</Text>}
        {isError && (
          <Text color="red" ta="center">
            Failed to load assets
          </Text>
        )}

        {!isLoading &&
          !isError &&
          assignments.length > 0 &&
          assignments.map((a) => (
            <Paper key={a.id} p="md" withBorder radius="md">
              <Group align="flex-start">
                {hasPermission("asset_assignment", "unassign") && (
                  <Checkbox
                    checked={selectedAssets.includes(a.id)}
                    onChange={() => toggleSelectAsset(a.id)}
                  />
                )}

                <Text fw={600}>{a.asset?.name || "Unknown Asset"}</Text>

                <Group spacing="xs" ml="auto">
                  <Badge color={a.asset?.is_active ? "green" : "gray"}>
                    {a.asset?.is_active ? "Active" : "Inactive"}
                  </Badge>
                </Group>
              </Group>

              <Divider my="xs" />

              <Text
                size="sm"
                style={{ whiteSpace: "pre-wrap", lineHeight: 1.5 }}
              >
                <b>Specs:</b>{" "}
                {a.asset?.specs
                  ? a.asset.specs
                      .split("\n")
                      .map((line, idx) => (idx === 0 ? line : "       " + line))
                      .join("\n")
                  : "N/A"}
              </Text>
            </Paper>
          ))}

        {!isLoading && !isError && assignments.length === 0 && (
          <Text ta="center" color="dimmed">
            No assets assigned
          </Text>
        )}

        {/* Bulk unassign button */}

        {assignments.length > 0 && hasPermission("asset_assignment", "unassign") && (
          <Button color="red" onClick={confirmUnassignSelected}>
            Select & Unassign
          </Button>
        )}
      </Stack>
    </Modal>
  );
};

export default EmployeeAssetsModal;
