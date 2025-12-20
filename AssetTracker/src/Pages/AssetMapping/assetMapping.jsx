// AssetMapping.jsx
import React, { useEffect, useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Group, Stack, Button } from "@mantine/core";
import { useQuery, useMutation } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";

import Column from "../../components/AssetMapping/Column";
import MovableItem from "../../components/AssetMapping/MovableItem";
import EmployeeHeader from "../../components/AssetMapping/EmployeeHeader";
import { COLUMN_NAMES } from "./data.js";

import { getAllEmployeesApi } from "../../services/employee";
import { getAllAssetsApi } from "../../services/asset";
import { assignAssetsToEmployeeApi } from "../../services/assetMapping";
import { useNavigate } from "react-router-dom";

const AssetMapping = () => {
  const [items, setItems] = useState([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const navigate = useNavigate();

  // Fetch employees
  const { data: empData } = useQuery({
    queryKey: ["employees"],
    queryFn: () => getAllEmployeesApi({ page: 1, perpage: 100 }),
  });

  // Fetch assets
  const { data: assetData } = useQuery({
    queryKey: ["assets"],
    queryFn: () => getAllAssetsApi({ page: 1, pageSize: 100 }),
  });

  // Assign mutation
  const mutation = useMutation({
    mutationFn: assignAssetsToEmployeeApi,
    onSuccess: () => {
      notifications.show({
        title: "Success",
        message: "Assets assigned successfully",
        color: "green",
        position: "top-center",
      });

      window.location.reload();
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
  //  console.log(assets.assetAssingmentEmployees);
  useEffect(() => {
    if (assets.length) {
      const formattedAssets = assets
        .filter(
          (a) =>
            !a.assetAssingmentEmployees ||
            a.assetAssingmentEmployees.every((ae) => ae.unassignedAt !== null) // only fully unassigned
        )
        .map((a) => ({
          id: a.id,
          name: a.name,
          column: COLUMN_NAMES.ASSET,
          employeeId: null,
        }));
      setItems(formattedAssets);
    }
  }, [assets]);

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
      notifications.show({ message: "Select employee first" });
      return;
    }

    setItems((prev) =>
      prev.map((i) => {
        if (i.id !== item.id) return i;

        if (column === COLUMN_NAMES.EMPLOYEE) {
          return { ...i, column, employeeId: selectedEmployeeId };
        } else {
          // drop back to asset column → unassigned
          return { ...i, column: COLUMN_NAMES.ASSET, employeeId: null };
        }
      })
    );
  };

  // Render items by column
  const renderItems = (column) =>
    items
      .filter((i) => i.column === column) // Asset column → just unassigned
      .map((item, index) => (
        <MovableItem
          key={item.id}
          {...item}
          index={index}
          moveCardHandler={moveCardHandler}
        />
      ));

  return (
    <DndProvider backend={HTML5Backend}>
      <Group align="flex-start" spacing="xl" position="center">
        {/* Asset column (only unassigned assets) */}
        <Column title={COLUMN_NAMES.ASSET} onDropItem={handleDropToColumn}>
          {renderItems(COLUMN_NAMES.ASSET)}
        </Column>

        <Stack>
          {/* Employee assigned assets */}
          <Column title={COLUMN_NAMES.EMPLOYEE} onDropItem={handleDropToColumn}>
            <div style={{ marginBottom: 10 }}>
              <EmployeeHeader
                employees={employees}
                selectedEmployeeId={selectedEmployeeId}
                setSelectedEmployeeId={setSelectedEmployeeId}
              />
            </div>
            {renderItems(COLUMN_NAMES.EMPLOYEE)}
          </Column>

          <Button
            mt="sm"
            color="blue"
            onClick={() =>
              mutation.mutate({
                employeeId: Number(selectedEmployeeId),
                assetIds: items
                  .filter((i) => i.column === COLUMN_NAMES.EMPLOYEE)
                  .map((i) => i.id),
              })
            }
            loading={mutation.isLoading}
          >
            Assign Assets
          </Button>
        </Stack>
      </Group>
    </DndProvider>
  );
};

export default AssetMapping;
