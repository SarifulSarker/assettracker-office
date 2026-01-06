import React, { useEffect, useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Button, TextInput } from "@mantine/core";
import { useQuery, useMutation } from "@tanstack/react-query";
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

  /* ---------------- API CALLS ---------------- */

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
    },
  });

  /* ---------------- DATA ---------------- */

  const employees = empData?.data?.employees || [];
  const assets = assetData?.data?.assets || [];
  const employeeAssets = (employeeAssetData?.data ?? []).filter(
    (a) => !a.unassignedAt
  );

  /* ------------ ---- INIT ASSETS ---------------- */

  useEffect(() => {
    setItems(
      assets.map((a) => ({
        id: a.id,
        name: a.name,
        specs: a.specs,
        column: COLUMN_NAMES.ASSET,
        employeeId: null,
      }))
    );
  }, [assetData]);

  /* ---------------- DND LOGIC ---------------- */

  const moveCardHandler = (from, to, column) => {
    setItems((prev) => {
      const list = prev.filter((i) => i.column === column);
      const dragged = list[from];
      if (!dragged) return prev;

      list.splice(from, 1);
      list.splice(to, 0, dragged);

      let idx = 0;
      return prev.map((i) => (i.column === column ? list[idx++] : i));
    });
  };

  const handleDropToColumn = (item, column) => {
    if (column === COLUMN_NAMES.EMPLOYEE && !selectedEmployeeId) {
      notifications.show({ message: "Select employee first", color: "red" });
      return;
    }

    setItems((prev) =>
      prev.map((i) =>
        i.id === item.id
          ? {
              ...i,
              column,
              employeeId:
                column === COLUMN_NAMES.EMPLOYEE ? selectedEmployeeId : null,
            }
          : i
      )
    );
  };

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

  /* ---------------- UI ---------------- */

  return (
    <DndProvider backend={HTML5Backend}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)", // 🔥 equal width
          gap: 24,
          padding: 24,
          width: "100%",
          //minHeight: "85vh", // 🔥 more vertical space
        }}
      >
        {/* ASSET */}
        <Column title="Asset" onDropItem={handleDropToColumn}>
          <TextInput
            placeholder="Search assets..."
            value={assetSearch}
            onChange={(e) => setAssetSearch(e.target.value)}
            mb="sm"
            icon={<IconSearch size={16} />}
          />
          {renderItems(COLUMN_NAMES.ASSET)}
        </Column>

        {/* EMPLOYEE */}
        <Column title="Employee" onDropItem={handleDropToColumn}>
          <EmployeeHeader
            employees={employees}
            selectedEmployeeId={selectedEmployeeId}
            setSelectedEmployeeId={setSelectedEmployeeId}
          />
          {renderItems(COLUMN_NAMES.EMPLOYEE)}
        </Column>

        {/* EMPLOYEE ASSETS */}
        <Column title="Employee Assets">
          {!selectedEmployeeId && (
            <div style={emptyBox}>Please select an employee</div>
          )}

          {isLoading && <div style={emptyBox}>Loading employee assets...</div>}

          {!isLoading && selectedEmployeeId && employeeAssets.length === 0 && (
            <div style={emptyBox}>
              This employee does not have any assigned assets
            </div>
          )}

          {employeeAssets.map((a) => (
            <MovableItem
              key={a.asset?.id}
              id={a.asset?.id}
              name={a.asset?.name}
              column={COLUMN_NAMES.EMPLOYEE_ASSETS}
              isReadOnly
            />
          ))}
        </Column>
      </div>

      <div style={{ display: "flex", justifyContent: "center", marginTop: 16 }}>
        <Button
          size="md"
          radius="md"
          onClick={() => {
            // 1️⃣ employee selected কিনা
            if (!selectedEmployeeId) {
              notifications.show({
                title: "Employee not selected",
                message: "Please select an employee first",
                color: "red",
                position: "top-center",
              });
              return;
            }

            // 2️⃣ dragged assets আছে কিনা
            const selectedAssets = items.filter(
              (i) => i.column === COLUMN_NAMES.EMPLOYEE
            );

            if (selectedAssets.length === 0) {
              notifications.show({
                title: "No assets selected",
                message: "Please drag at least one asset to assign",
                color: "orange",
                position: "top-center",
              });
              return;
            }

            // 3️⃣ valid → mutation call
            mutation.mutate({
              employeeId: Number(selectedEmployeeId),
              assetIds: selectedAssets.map((i) => i.id),
            });
          }}
        >
          Assign Assets
        </Button>
      </div>
    </DndProvider>
  );
};

export default AssetMapping;
