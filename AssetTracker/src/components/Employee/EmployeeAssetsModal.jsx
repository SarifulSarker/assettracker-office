import React from "react";
import {
  Modal,
  Stack,
  Paper,
  Text,
  Group,
  Badge,
  Divider,
  Button,
} from "@mantine/core";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAssetsByEmployeeApi } from "../../services/assetMapping.js";
import { IconBan } from "@tabler/icons-react";
import { unassignAssetApi } from "../../services/assetMapping";
import { notifications } from "@mantine/notifications";
import { modals } from "@mantine/modals";
const EmployeeAssetsModal = ({ opened, onClose, employee }) => {
  const {
    data: response,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["employee-assets", employee?.id],
    queryFn: () => getAssetsByEmployeeApi(employee.id),
    enabled: opened && !!employee?.id,
  });

  const queryClient = useQueryClient();

  const unassignMutation = useMutation({
    mutationFn: unassignAssetApi,
    onSuccess: () => {
      notifications.show({
        title: "Success",
        message: "Asset unassigned successfully",
        position: "top-center",
      });

      queryClient.invalidateQueries(["employee-assets", employee?.id]);
    },
  });
  const openUnassignModal = (assignmentId) => {
    modals.openConfirmModal({
      title: "Unassign Asset",
      children: (
        <Text size="sm">Are you sure you want to unassign this asset?</Text>
      ),
      labels: { confirm: "Yes", cancel: "No" },
      confirmProps: { color: "red" },
      onConfirm: () => unassignMutation.mutate(assignmentId),
    });
  };

  const assignments = (response?.data ?? []).filter((a) => !a.unassignedAt);

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
              <Group position="apart">
                <Text fw={600}>{a.asset?.name || "Unknown Asset"}</Text>

                <Group spacing="xs">
                  <Badge color={a.asset?.is_active ? "green" : "gray"}>
                    {a.asset?.is_active ? "Active" : "Inactive"}
                  </Badge>

                  {/* ❌ Unassign button */}
                  <Button
                    size="xs"
                    color="red"
                    variant="light"
                    onClick={() => openUnassignModal(a.id)}
                  >
                    <IconBan size={14} />
                  </Button>
                </Group>
              </Group>

              <Divider my="xs" />

              <Text size="sm" color="dimmed">
                <b>Specs:</b> {a.asset?.specs ?? "No specs available"}
              </Text>

              <Text size="sm" color="dimmed">
                <b>Status:</b> {a.asset?.status}
              </Text>
            </Paper>
          ))}

        {!isLoading && !isError && assignments.length === 0 && (
          <Text ta="center" color="dimmed">
            No assets assigned
          </Text>
        )}
      </Stack>
    </Modal>
  );
};

export default EmployeeAssetsModal;
