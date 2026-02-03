import {
  Modal,
  Box,
  Group,
  Text,
  ScrollArea,
  Stack,
  Checkbox,
  Button,
  Divider,
  TextInput,
} from "@mantine/core";
import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { MODULES } from "../../constants/modules";
import { updateRoleAndPermissionApi } from "../../services/roleandPermission";
import { notifications } from "@mantine/notifications";

const BODY_HEIGHT = 500;

const RoleAndPermissionEditModel = ({ opened, onClose, roles, onSuccess }) => {
  const [activeModule, setActiveModule] = useState(MODULES[0]);
  const [roleName, setRoleName] = useState("");
  const [permissions, setPermissions] = useState({});

  /* ---------------- PREFILL DATA ---------------- */
  useEffect(() => {
    if (roles) {
      setRoleName(roles.role || "");
      setPermissions(roles.permission?.modules || {});
    }
  }, [roles]);

  /* ---------------- MUTATION ---------------- */
  const mutation = useMutation({
    mutationFn: (payload) => updateRoleAndPermissionApi(roles.id, payload),
    onSuccess: (response) => {
      if (response?.success) {
        notifications.show({
          message: "Role updated successfully",
          color: "green",
          position: "top-center",
        });
        onSuccess?.();
        onClose();
      } else {
        notifications.show({
          message: response?.message || "Update failed",
          color: "red",
        });
      }
    },
    onError: () => {
      notifications.show({
        message: "Internal server error",
        color: "red",
      });
    },
  });

  /* ---------------- HANDLERS ---------------- */
  const togglePermission = (moduleKey, perm) => {
    setPermissions((prev) => ({
      ...prev,
      [moduleKey]: {
        ...prev[moduleKey],
        [perm]: !prev?.[moduleKey]?.[perm],
      },
    }));
  };

  const selectAllPermissions = (module) => {
    const perms = {};
    module.permissions.forEach((p) => (perms[p] = true));
    setPermissions((prev) => ({ ...prev, [module.key]: perms }));
  };

  const deselectAllPermissions = (module) => {
    const perms = {};
    module.permissions.forEach((p) => (perms[p] = false));
    setPermissions((prev) => ({ ...prev, [module.key]: perms }));
  };

  const handleUpdate = () => {
    if (!roleName.trim()) {
      notifications.show({
        message: "Role name is required",
        color: "red",
      });
      return;
    }

    mutation.mutate({
      role: roleName,
      permissions,
    });
  };

  /* ---------------- UI ---------------- */
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Edit Role & Permission"
      size="80%"
      centered
      styles={{ body: { overflow: "hidden" } }}
    >
      <Box style={{ display: "flex", height: BODY_HEIGHT }}>
        {/* LEFT MODULE LIST */}
        <Box
          style={{
            width: 260,
            borderRight: "1px solid #e9ecef",
          }}
        >
          <ScrollArea h={BODY_HEIGHT} type="always">
            <Stack gap={4} pr="sm">
              {MODULES.map((module) => (
                <Box
                  key={module.key}
                  px="sm"
                  py={12}
                  style={{
                    cursor: "pointer",
                    borderRadius: 6,
                    backgroundColor:
                      activeModule.key === module.key
                        ? "#FFE8CC"
                        : "transparent",
                  }}
                  onClick={() => setActiveModule(module)}
                >
                  <Text fw={500}>{module.label}</Text>
                </Box>
              ))}
            </Stack>
          </ScrollArea>
        </Box>

        {/* RIGHT PERMISSIONS */}
        <Box style={{ flex: 1, paddingLeft: 16 }}>
          <Stack>
            <TextInput
              label="Role Name"
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              required
              w={200}
            />

            <Group justify="space-between">
              <Text fw={600}>{activeModule.label} Permissions</Text>
              <Group gap="xs">
                <Button
                  size="xs"
                  onClick={() => selectAllPermissions(activeModule)}
                >
                  Select All
                </Button>
                <Button
                  size="xs"
                  onClick={() => deselectAllPermissions(activeModule)}
                >
                  Deselect All
                </Button>
              </Group>
            </Group>

            <Divider />

            <Stack>
              {activeModule.permissions.map((perm) => (
                <Checkbox
                  key={perm}
                  label={perm.toUpperCase()}
                  checked={permissions?.[activeModule.key]?.[perm] || false}
                  onChange={() => togglePermission(activeModule.key, perm)}
                />
              ))}
            </Stack>
          </Stack>
        </Box>
      </Box>

      {/* FOOTER */}
      <Group justify="flex-end" mt="lg">
        <Button variant="default" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleUpdate} loading={mutation.isLoading}>
          Update
        </Button>
      </Group>
    </Modal>
  );
};

export default RoleAndPermissionEditModel;
