import React, { useEffect, useState } from "react";
import {
  Badge,
  Button,
  Card,
  Flex,
  Stack,
  Text,
  TextInput,
  SimpleGrid,
  ScrollArea,
} from "@mantine/core";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import { IconSearch } from "@tabler/icons-react";

import MovableItem from "../../components/AssetMapping/MovableItem";
import EmployeeHeader from "../../components/AssetMapping/EmployeeHeader";
import EmployeeAssetsCard from "../../components/AssetMapping/EmployeeAssetsCard";
import { COLUMN_NAMES } from "./data";

import { getAllEmployeesApi } from "../../services/employee";
import {
  getUnassignedAssetsApi,
  assignAssetsToEmployeeApi,
  getAssetsByEmployeeApi,
} from "../../services/assetMapping";

const emptyBox = {
  padding: "16px",
  textAlign: "center",
  color: "#888",
  border: "1px dashed #ccc",
  borderRadius: "8px",
};

const AssetMapping = () => {
  const [items, setItems] = useState([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [assetSearch, setAssetSearch] = useState("");
  const queryClient = useQueryClient();
  const [employeeAssets, setEmployeeAssets] = useState([]);
  // ---------------- API CALLS ----------------
  const { data: empData } = useQuery({
    queryKey: ["employees"],
    queryFn: () => getAllEmployeesApi({ page: 1, perpage: 100 }),
  });

  const { data: assetData } = useQuery({
    queryKey: ["unassignedAssets", assetSearch],
    queryFn: () => getUnassignedAssetsApi({ search: assetSearch }),
  });

  const { data: employeeAssetData } = useQuery({
    queryKey: ["employeeAssets", selectedEmployeeId],
    queryFn: () => getAssetsByEmployeeApi(selectedEmployeeId),
    enabled: !!selectedEmployeeId,
  });

  const mutation = useMutation({
    mutationFn: assignAssetsToEmployeeApi,
    onSuccess: (_, vars) => {
      notifications.show({
        title: "Success",
        message: "Assets assigned",
        color: "green",
        position: "top-center",
      });
      setItems((prev) => prev.filter((i) => !vars.assetUnitIds.includes(i.id)));
      queryClient.invalidateQueries({
        queryKey: ["employeeAssets", String(vars.employeeId)],
      });
    },
  });

  // ---------------- DATA ----------------
  const employees = empData?.data?.employees || [];
  const assets = assetData?.data?.assetUnits || [];

  const employeesAssets = (employeeAssetData?.data ?? []).filter(
    (a) => !a.unassignedAt,
  );
  
  const handleAssignAssets = () => {
    if (!selectedEmployeeId) return;
    const selectedAssets = items.filter((i) => i.selected);
    if (selectedAssets.length === 0) return;

    // ---------------- Optimistic update ----------------
    setItems((prev) => prev.filter((i) => !selectedAssets.includes(i)));
    setEmployeeAssets((prev) => [...prev, ...selectedAssets]);

    // ---------------- Trigger backend call ----------------
    mutation.mutate({
      employeeId: Number(selectedEmployeeId),
      assetUnitIds: selectedAssets.map((i) => i.id),
    });
  };
  // ---------------- INIT ASSETS ----------------
  const mappedAssets = React.useMemo(() => {
    return (assets || []).map((a) => ({
      id: a.id,
      name: a.asset?.name || "",
      category: a.asset?.category?.name || null,
      subCategory: a.asset?.subCategory?.name || null,
      productId: a.productId,
      status: a.status,
      selected: false,
    }));
  }, [assets]);

  useEffect(() => {
    setItems((prev) => {
      const newItems = mappedAssets;
      if (JSON.stringify(prev) !== JSON.stringify(newItems)) return newItems;
      return prev;
    });
  }, [mappedAssets]);
  useEffect(() => {
    if (employeeAssetData?.data) {
      setEmployeeAssets(employeeAssetData.data.filter((a) => !a.unassignedAt));
    }
  }, [employeeAssetData]);
  // ---------------- Checkbox / Cross ----------------
  const handleCheck = (id) => {
    if (!selectedEmployeeId) {
      notifications.show({
        title: "Employee not selected",
        message: "Please select an employee first",
        color: "red",
        position: "top-center",
      });
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, selected: !i.selected } : i)),
    );
  };

  const selectedEmployee = employees.find(
    (e) => String(e.id) === String(selectedEmployeeId),
  );

  // ---------------- UI ----------------
  return (
    <div style={{ padding: 24, width: "100%" }}>
      {/* ================= TOP BAR ================= */}
      <Flex justify="space-between" align="center" mb="lg" gap="md">
        <TextInput
          placeholder="Search assets..."
          value={assetSearch}
          onChange={(e) => setAssetSearch(e.target.value)}
          icon={<IconSearch size={16} />}
          style={{ width:250 }}
        />

        <div style={{ width: 250 }}>
          <EmployeeHeader
            employees={employees}
            selectedEmployeeId={selectedEmployeeId}
            setSelectedEmployeeId={setSelectedEmployeeId}
          />
        </div>

        <Button
          size="md"
          radius="md"
          onClick={() => {
            if (!selectedEmployeeId) {
              notifications.show({
                title: "Employee not selected",
                message: "Please select an employee first",
                color: "red",
              });
              return;
            }

            const selectedAssets = items.filter((i) => i.selected);
            if (selectedAssets.length === 0) {
              notifications.show({
                title: "No assets selected",
                message: "Please select at least one asset",
                color: "orange",
              });
              return;
            }

            mutation.mutate({
              employeeId: Number(selectedEmployeeId),
              assetUnitIds: selectedAssets.map((i) => i.id),
            });
          }}
        >
          Assign Assets
        </Button>
      </Flex>

      {/* ================= EMPLOYEE ASSETS CARD ================= */}
      {/* <EmployeeAssetsCard
        selectedEmployee={selectedEmployee}
        employeesAssets={employeesAssets}
      /> */}
      <EmployeeAssetsCard
        selectedEmployee={selectedEmployee}
        employeesAssets={employeeAssets}
      />
      {/* ================= ASSET CARDS ================= */}
      <Text  weight={600} size="lg">UnAssign Assets</Text>
      <ScrollArea h={500} type="auto" offsetScrollbars>
        {items.length === 0 ? (
          <div style={emptyBox}>No assets found</div>
        ) : (
          <SimpleGrid cols={4} spacing="lg">
            {items.map((item) => (
              <MovableItem
                key={item.id}
                {...item}
                column={COLUMN_NAMES.ASSET}
                onCheck={() => handleCheck(item.id)}
              />
            ))}
          </SimpleGrid>
        )}
      </ScrollArea>
    </div>
  );
};

export default AssetMapping;
