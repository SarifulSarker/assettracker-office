// ---------------------- EmployeeAssetsModal.jsx ----------------------
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
  Flex,
} from "@mantine/core";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { modals } from "@mantine/modals";
import { getAssetsByEmployeeApi, unassignAssetApi } from "../../services/assetMapping.js";
import { notifications } from "@mantine/notifications";
import { usePermissions } from "../../hooks/useAuthPermissions.js";

const EmployeeAssetsModal = ({ opened, onClose, employee }) => {
  const [selectedAssets, setSelectedAssets] = useState([]);
  const queryClient = useQueryClient();
  const { hasPermission } = usePermissions();

  // Fetch assigned assets
  const { data: response, isLoading, isError } = useQuery({
    queryKey: ["employee-assets", employee?.id],
    queryFn: () => getAssetsByEmployeeApi(employee.id),
    enabled: opened && !!employee?.id,
  });

  // Filter active assignments
  const assignments = (response?.data ?? []).filter((a) => !a.unassignedAt);

  // Mutation for unassigning selected asset units
  const unassignMutation = useMutation({
    mutationFn: (assetUnitIds) => unassignAssetApi(assetUnitIds),
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
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

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
          Are you sure you want to unassign {selectedAssets.length} selected asset
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
        {isError && <Text color="red" ta="center">Failed to load assets</Text>}

        {!isLoading &&
          !isError &&
          assignments.length > 0 &&
          assignments.map((a) => {
            // Find the assigned assetUnit
            const unit = a.asset.assetUnits.find(u => u.id === a.assetUnitId);

            return (
              <Paper key={a.id} p="md" withBorder radius="md">
                <Flex align="center" justify="space-between" mb="xs">
                  <Group align="center">
                    {hasPermission("asset_assignment", "unassign") && (
                      <Checkbox
                        checked={selectedAssets.includes(unit.id)}
                        onChange={() => toggleSelectAsset(unit.id)}
                      />
                    )}
                    <Text fw={600}>{a.asset?.name || "Unknown Asset"}</Text>
                  </Group>

                  <Group spacing="xs">
                    <Badge color={unit?.status === "IN_USE" ? "green" : "gray"}>
                      {unit?.status || "Unknown"}
                    </Badge>
                    <Badge color="blue">{unit?.productId || "N/A"}</Badge>
                  </Group>
                </Flex>

                <Divider my="xs" />

                <Flex direction="column" gap="4px">
                  <Text size="sm">
                    <b>Specs:</b> {a.asset?.specs || "N/A"}
                  </Text>
                  <Text size="sm">
                    <b>Purchase Price:</b> {unit?.purchasePrice || "N/A"}
                  </Text>
                </Flex>
              </Paper>
            );
          })}

        {!isLoading && !isError && assignments.length === 0 && (
          <Text ta="center" color="dimmed">
            No assets assigned
          </Text>
        )}

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