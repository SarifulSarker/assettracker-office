import React, { useEffect, useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Group, Stack, Button, TextInput } from "@mantine/core";
import { useQuery, useMutation } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import { IconSearch } from "@tabler/icons-react";

import Column from "../../components/AssetMapping/Column";
import MovableItem from "../../components/AssetMapping/MovableItem";
import EmployeeHeader from "../../components/AssetMapping/EmployeeHeader";
import { COLUMN_NAMES } from "./data.js";

import { getAllEmployeesApi } from "../../services/employee";
import {
  getUnassignedAssetsApi,
  assignAssetsToEmployeeApi,
} from "../../services/assetMapping";
import { useNavigate } from "react-router-dom";

const AssetMapping = () => {
  const [items, setItems] = useState([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [assetSearch, setAssetSearch] = useState(""); // <-- search state
  const navigate = useNavigate();

  // Fetch employees
  const { data: empData } = useQuery({
    queryKey: ["employees"],
    queryFn: () => getAllEmployeesApi({ page: 1, perpage: 100 }),
  });

  // Fetch unassigned assets (searchable)
  const { data: assetData } = useQuery({
    queryKey: ["unassignedAssets", assetSearch],
    queryFn: () => getUnassignedAssetsApi({ search: assetSearch }),
    refetchOnWindowFocus: false,
    keepPreviousData: true,
  });

  // Assign mutation
  const mutation = useMutation({
    mutationFn: assignAssetsToEmployeeApi,
    onSuccess: (_, variables) => {
      notifications.show({
        title: "Success",
        message: "Assets assigned successfully",
        color: "green",
        position: "top-center",
      });

      const assignedIds = variables.assetIds;

      setItems((prev) => prev.filter((item) => !assignedIds.includes(item.id)));

    
    },

    onError: (err) =>
      notifications.show({
        title: "Error",
        message: err.message || "Assignment failed",
        color: "red",
        position: "top-center",
      }),
  });

  const employees = empData?.data?.employees || [];
  const assets = assetData?.data?.assets || [];

  // Format unassigned assets for DnD
  useEffect(() => {
    if (!assets?.length) return;

    setItems(
      assets.map((a) => ({
        id: a.id,
        name: a.name,
        column: COLUMN_NAMES.ASSET,
        employeeId: null,
        vendor: a.vendor?.name,
        brand: a.brand?.name,
        subCategory: a.subCategory?.name,
        specs: a.specs,
      }))
    );
  }, [assetData]); // 🔥 assets না, assetData

  // Reorder items within column
  const moveCardHandler = (fromIndex, toIndex, column) => {
    setItems((prev) => {
      const newItems = [...prev];
      const colItems = newItems.filter((i) => i.column === column);
      const dragItem = colItems[fromIndex];
      if (!dragItem) return prev;

      colItems.splice(fromIndex, 1);
      colItems.splice(toIndex, 0, dragItem);

      let colIndex = 0;
      return newItems.map((i) =>
        i.column === column ? colItems[colIndex++] : i
      );
    });
  };

  // Drop item to column
  const handleDropToColumn = (item, column) => {
    if (column === COLUMN_NAMES.EMPLOYEE && !selectedEmployeeId) {
      notifications.show({
        message: "Select employee first",
        color: "red",
        position: "top-center",
      });
      return;
    }

    setItems((prev) =>
      prev.map((i) => {
        if (i.id !== item.id) return i;

        if (column === COLUMN_NAMES.EMPLOYEE) {
          return { ...i, column, employeeId: selectedEmployeeId };
        } else {
          return { ...i, column: COLUMN_NAMES.ASSET, employeeId: null };
        }
      })
    );
  };

  // Render items by column
  const renderItems = (column) =>
    items
      .filter((i) => i.column === column)
      .map((item, index) => (
        <MovableItem
          key={item.id}
          {...item}
          index={index}
          moveCardHandler={moveCardHandler}
        />
      ));

  const employeeItems = items.filter(
    (i) =>
      i.column === COLUMN_NAMES.EMPLOYEE && i.employeeId === selectedEmployeeId
  );

  const assetItems = items.filter((i) => i.column === COLUMN_NAMES.ASSET);

  return (
    <DndProvider backend={HTML5Backend}>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "24px",
          width: "100%",
          minHeight: "80vh",
          padding: "20px",
        }}
      >
        {/* Asset column */}
        <Column
          title={COLUMN_NAMES.ASSET}
          onDropItem={handleDropToColumn}
          style={{ flex: 1, maxWidth: 400 }}
        >
          <TextInput
            placeholder="Search assets..."
            value={assetSearch}
            onChange={(e) => setAssetSearch(e.target.value)}
            mb="sm"
            icon={<IconSearch size={16} />}
          />

          {/*  No assets available */}
          {assetItems.length === 0 && (
            <div
              style={{
                padding: "16px",
                textAlign: "center",
                color: "#888",
                border: "1px dashed #ccc",
                borderRadius: "8px",
              }}
            >
              No available assets
            </div>
          )}

          {renderItems(COLUMN_NAMES.ASSET)}
        </Column>

        {/* Employee column */}
        <div
          style={{
            flex: 1,
            maxWidth: 400,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Column title={COLUMN_NAMES.EMPLOYEE} onDropItem={handleDropToColumn}>
            <div style={{ marginBottom: 10 }}>
              <EmployeeHeader
                employees={employees}
                selectedEmployeeId={selectedEmployeeId}
                setSelectedEmployeeId={setSelectedEmployeeId}
              />
            </div>

            {/* No employee selected */}
            {!selectedEmployeeId && (
              <div
                style={{
                  padding: "16px",
                  textAlign: "center",
                  color: "#888",
                  border: "1px dashed #ccc",
                  borderRadius: "8px",
                }}
              >
                Select an employee first
              </div>
            )}

            {/*  Employee selected but no assets */}
            {selectedEmployeeId && employeeItems.length === 0 && (
              <div
                style={{
                  padding: "16px",
                  textAlign: "center",
                  color: "#888",
                  border: "1px dashed #ccc",
                  borderRadius: "8px",
                }}
              >
                Drop asset here
              </div>
            )}

            {renderItems(COLUMN_NAMES.EMPLOYEE)}
          </Column>

          <Button
            mt="sm"
            color="blue"
            onClick={() => {
              const selectedAssets = items.filter(
                (i) => i.column === COLUMN_NAMES.EMPLOYEE
              );

              if (!selectedEmployeeId) {
                notifications.show({
                  title: "Alert",
                  message: "Please select an employee first",
                  color: "red",
                  position: "top-center",
                });
                return;
              }

              if (selectedAssets.length === 0) {
                notifications.show({
                  title: "Alert",
                  message: "No assets selected to assign",
                  color: "red",
                  position: "top-center",
                });
                return;
              }

              // If all good, call mutation
              mutation.mutate({
                employeeId: Number(selectedEmployeeId),
                assetIds: selectedAssets.map((i) => i.id),
              });
            }}
            loading={mutation.isPending}
            style={{ marginTop: "12px" }}
          >
            Assign Assets
          </Button>
        </div>
      </div>
    </DndProvider>
  );
};

export default AssetMapping;
