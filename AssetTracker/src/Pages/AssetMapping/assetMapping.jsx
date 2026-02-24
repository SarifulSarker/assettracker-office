import React, { useEffect, useState } from "react";
import { Button, Flex, TextInput } from "@mantine/core";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import { IconSearch } from "@tabler/icons-react";

import Column from "../../components/AssetMapping/Column";
import MovableItem from "../../components/AssetMapping/MovableItem";
import EmployeeHeader from "../../components/AssetMapping/EmployeeHeader";
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

  // ---------------- API CALLS ----------------
  const { data: empData } = useQuery({
    queryKey: ["employees"],
    queryFn: () => getAllEmployeesApi({ page: 1, perpage: 100 }),
  });

  const { data: assetData } = useQuery({
    queryKey: ["unassignedAssets", assetSearch],
    queryFn: () => getUnassignedAssetsApi({ search: assetSearch }),
  });

  const { data: employeeAssetData, isLoading } = useQuery({
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
      setItems((prev) => prev.filter((i) => !vars.assetIds.includes(i.id)));
      queryClient.invalidateQueries({
        queryKey: ["employeeAssets", String(vars.employeeId)],
      });
    },
  });

  // ---------------- DATA ----------------
  const employees = empData?.data?.employees || [];
  const assets = assetData?.data?.assetUnits || [];
 
  const employeeAssets = (employeeAssetData?.data ?? []).filter(
    (a) => !a.unassignedAt
  );

  // ---------------- INIT ASSETS ----------------
  useEffect(() => {
    setItems(
      assets.map((a) => ({
        id: a.id,
        name: a.name,
        category: a.category?.name || null,
        subCategory: a.subCategory?.name || null,
        selected: false, // ✅ for checkbox
      }))
    );
  }, [assetData]);

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
      prev.map((i) =>
        i.id === id ? { ...i, selected: !i.selected } : i
      )
    );
  };

  const selectedEmployee = employees.find(
    (e) => String(e.id) === String(selectedEmployeeId)
  );

  // ---------------- UI ----------------
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "3fr 2fr", // 3/5 assets, 2/5 employee info
        gap: 24,
        padding: 24,
        width: "100%",
      }}
    >
      {/* ASSETS COLUMN */}
      <Column title="Assets">
        <Flex direction="row" gap="sm">
          <TextInput
            placeholder="Search assets..."
            value={assetSearch}
            onChange={(e) => setAssetSearch(e.target.value)}
            mb="sm"
            icon={<IconSearch size={16} />}
          />
          <EmployeeHeader
            employees={employees}
            selectedEmployeeId={selectedEmployeeId}
            setSelectedEmployeeId={setSelectedEmployeeId}
          />
        </Flex>
        {items.length === 0 && <div style={emptyBox}>No assets found</div>}
        {items.map((item) => (
          <MovableItem
            key={item.id}
            {...item}
            column={COLUMN_NAMES.ASSET}
            onCheck={() => handleCheck(item.id)}
          />
        ))}
      </Column>

      {/* EMPLOYEE INFO COLUMN */}
      <Column title="Employee Info">
        {selectedEmployee ? (
          <>
            <div
              style={{
                padding: "12px",
                marginBottom: "12px",
                borderRadius: "8px",
                background: "#f8f9fa",
                border: "1px solid #e9ecef",
              }}
            >
              <div style={{ fontWeight: 600 }}>Name: {selectedEmployee.fullName}</div>
              <div style={{ fontSize: 13 }}>
                Designation: {selectedEmployee.designation.name}
              </div>
              <div style={{ fontSize: 13 }}>
                Department: {selectedEmployee.department.name}
              </div>
            </div>

            {isLoading && <div style={emptyBox}>Loading employee assets...</div>}
            {!isLoading && employeeAssets.length === 0 && (
              <div style={emptyBox}>This employee does not have any assigned assets</div>
            )}
            {!isLoading &&
              employeeAssets.map((a) => (
                <MovableItem
                  key={a.asset.id}
                  id={a.asset.id}
                  name={a.asset.name}
                  category={a.asset.category?.name}
                  subCategory={a.asset.subCategory?.name}
                  isReadOnly
                />
              ))}
          </>
        ) : (
          <div style={emptyBox}>Please select an employee</div>
        )}

        <Button
          size="md"
          radius="md"
          fullWidth
          mt="md"
          onClick={() => {
            if (!selectedEmployeeId) {
              notifications.show({
                title: "Employee not selected",
                message: "Please select an employee first",
                color: "red",
                position: "top-center",
              });
              return;
            }

            const selectedAssets = items.filter((i) => i.selected);
            if (selectedAssets.length === 0) {
              notifications.show({
                title: "No assets selected",
                message: "Please select at least one asset",
                color: "orange",
                position: "top-center",
              });
              return;
            }

            mutation.mutate({
              employeeId: Number(selectedEmployeeId),
              assetIds: selectedAssets.map((i) => i.id),
            });
          }}
        >
          Assign Assets
        </Button>
      </Column>
    </div>
  );
};

export default AssetMapping;