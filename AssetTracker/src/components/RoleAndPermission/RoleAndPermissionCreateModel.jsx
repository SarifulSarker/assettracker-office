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
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { MODULES } from "../../constants/modules.js";
import { createRoleAndPermissionApi } from "../../services/roleandPermission.js";
import { notifications } from "@mantine/notifications";

const BODY_HEIGHT = 500;

const RoleAndPermissionCreateModel = ({ opened, onClose, onSuccess }) => {
  const [activeModule, setActiveModule] = useState(MODULES[0]);
  const [permissions, setPermissions] = useState({});
  const [roleName, setRoleName] = useState("");

  // --- REACT QUERY MUTATION ---
  const mutation = useMutation({
    mutationFn: (payload) => createRoleAndPermissionApi(payload),
    onSuccess: (response) => {
      if (response?.success) {
        notifications.show({
          message: "Role created successfully",
          color: "green",
          position:"top-center"
        });
        onSuccess?.(response.data || {}); // callback to parent
        onClose();
      } else {
        notifications.show({
          message: response?.message || "Error creating role",
          color: "red",
          position:"top-center"
        });
      }
    },
    onError: (error) => {
      console.error("API Error:", error);
      notifications.show({ message: "Internal server error", color: "red" });
    },
  });

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

  const handleCreate = () => {
    if (!roleName.trim()) {
      notifications.show({ message: "Role name is required", color: "red" });
      return;
    }

    const payload = {
      role: roleName,
      permissions,
    };

    mutation.mutate(payload); // ✅ trigger API call
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Create Role"
      size="80%"
      centered
      styles={{ body: { overflow: "hidden" } }}
    >
      {/* MAIN LAYOUT */}
      <Box style={{ display: "flex", height: BODY_HEIGHT }}>
        {/* LEFT */}
        <Box
          style={{
            width: 260,
            borderRight: "1px solid #e9ecef",
            height: "100%",
          }}
        >
          <ScrollArea h={BODY_HEIGHT} offsetScrollbars type="always">
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
                    whiteSpace: "nowrap",
                  }}
                  onClick={() => setActiveModule(module)}
                >
                  <Text fw={500} truncate>
                    {module.label}
                  </Text>
                </Box>
              ))}
            </Stack>
          </ScrollArea>
        </Box>

        {/* RIGHT */}
        <Box style={{ flex: 1, paddingLeft: 16 }}>
          <Stack>
            <TextInput
              placeholder="Enter role name"
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              required
              w={200}
            />
            <Group justify="space-between">
              <Text fw={600}>{activeModule.label} Permissions</Text>
              <Group gap="xs">
                <Button
                  style={{
                    backgroundColor: "#0f4794",
                    color: "#fff",
                    borderRadius: 8,
                  }}
                  onClick={() => selectAllPermissions(activeModule)}
                >
                  Select All
                </Button>
                <Button
                  style={{
                    backgroundColor: "#0f4794",
                    color: "#fff",
                    borderRadius: 8,
                  }}
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
        <Button
          style={{ backgroundColor: "#0f4794", color: "#fff", borderRadius: 8 }}
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button
          style={{ backgroundColor: "#0f4794", color: "#fff", borderRadius: 8 }}
          onClick={handleCreate}
          loading={mutation.isLoading}
        >
          Create
        </Button>
      </Group>
    </Modal>
  );
};

export default RoleAndPermissionCreateModel;
