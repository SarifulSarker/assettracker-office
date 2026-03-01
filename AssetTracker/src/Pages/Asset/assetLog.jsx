// assetLog.jsx
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Text,
  Stack,
  Paper,
  Divider,
  Badge,
  Group,
  Select,
  Loader,
  Center,
  Flex,
  Modal,
  Box,
  Overlay,
  Grid,
} from "@mantine/core";
import { Image as MantineImage } from "@mantine/core";
import {
  getEmployeesByAssetApi,
  getAssetLogsByContextApi,
} from "../../services/assetMapping";
import { getAssetByIdApi } from "../../services/asset";
import PageTop from "../../components/global/PageTop";
import { ASSET_LOG_CONTEXT } from "../../utils/ASSET_LOG_CONTEXT";
import AssetContextLogs from "../../components/Asset/AssetContextLogs";
import { IconCurrencyTaka } from "@tabler/icons-react";
import { Carousel } from "@mantine/carousel";

const AssetLog = () => {
  const { uid } = useParams();
  const [context, setContext] = useState(null);
  const [opened, setOpened] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedUnit, setSelectedUnit] = useState(null);
  /* ---------------- Asset Info ---------------- */
  const { data: assetData, isLoading: assetLoading } = useQuery({
    queryKey: ["asset", uid],
    queryFn: () => getAssetByIdApi(uid),
    enabled: !!uid,
  });

  const asset = assetData?.data;

  const assetUID = uid;

  // console.log(asset?.images);
  /* ---------------- Logs ---------------- */
  const {
    data: AssignlogData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["asset-logs", uid, context],
    queryFn: () =>
      context
        ? getAssetLogsByContextApi({ assetUId: assetUID, context })
        : getEmployeesByAssetApi(uid),
    enabled: !!assetUID,
  });
  const totalPrice = asset?.assetUnits?.reduce(
    (sum, unit) => sum + (unit.purchasePrice || 0),
    0,
  );

  const formattedTotal = totalPrice?.toLocaleString("en-BD");

  const unitPrices = asset?.assetUnits?.map((u) => u.purchasePrice)?.join(", ");
  const logs = context ? (AssignlogData ?? []) : (AssignlogData?.data ?? []);
  const activeLog = logs.find((l) => !l.unassignedAt);
 console.log(logs)

  /* ---------------- UI ---------------- */
  return (
    <Stack spacing="md" px="md">
      <PageTop PAGE_TITLE="Asset Logs" backBtn />

      {/* Filter */}
      <Group justify="space-between">
        <Select
          label="Log Context"
          placeholder="All logs"
          data={Object.values(ASSET_LOG_CONTEXT)}
          value={context}
          onChange={setContext}
          clearable
          w={220}
        />
      </Group>

      {/* Context based view */}
      {context ? (
        <AssetContextLogs logs={logs} context={context} />
      ) : (
        <>
          {/* Asset Summary */}
          <Paper withBorder radius="md" p="md">
            {assetLoading ? (
              <Center>
                <Loader size="sm" />
              </Center>
            ) : (
              <Stack spacing="sm">
                {/* Asset basic info */}

                <Text fw={600} component="div">
                  Asset: {asset?.name || "N/A"}
                </Text>
                <Text component="div">Units: {asset?.units || "N/A"}</Text>
                <Text size="sm" component="div">
                  <b>UID:</b> {asset?.uid || "N/A"}
                </Text>
                {/* <Text size="sm" component="div">
                  <b>Asset Status:</b> {asset?.status || "N/A"}
                </Text> */}
                <Text size="sm" component="div">
                  <b>Status:</b>{" "}
                  <Badge
                    color={asset?.is_active ? "green" : "gray"}
                    variant="light"
                  >
                    {asset?.is_active ? "Active" : "Inactive"}
                  </Badge>
                </Text>

                {/* Specs */}
                <Text
                  size="sm"
                  style={{ whiteSpace: "pre-wrap", lineHeight: 1.5 }}
                  component="div"
                >
                  <b>Specs:</b>{" "}
                  {asset?.specs
                    ? asset.specs
                        .split("\n")
                        .map((line, index) =>
                          index === 0 ? line : "            " + line,
                        )
                        .join("\n")
                    : "N/A"}
                </Text>

                {/* Notes (rich text) */}
                {asset?.notes && (
                  <div>
                    <Text size="sm" fw={500} component="div">
                      Notes:
                    </Text>
                    <div
                      style={{
                        border: "1px solid #e0e0e0",
                        padding: "8px",
                        borderRadius: "4px",
                      }}
                      dangerouslySetInnerHTML={{ __html: asset.notes }}
                    />
                  </div>
                )}

                {/* Vendor */}
                <Text size="sm" component="div">
                  <b>Vendor:</b> {asset?.vendor?.name || "N/A"}
                </Text>

                {/* Brand */}
                <Text size="sm" component="div">
                  <b>Brand:</b> {asset?.brand?.name || "N/A"}
                </Text>

                {/* Category */}
                <Text size="sm" component="div">
                  <b>Category:</b> {asset?.category?.name || "N/A"}
                </Text>

                {/* Subcategory */}
                {asset?.subCategory && (
                  <Text size="sm" component="div">
                    <b>Subcategory:</b> {asset.subCategory.name}
                  </Text>
                )}

                {/* Purchase info */}
                <Text size="sm" component="div">
                  <b>Purchase Date:</b>{" "}
                  {asset?.purchaseDate
                    ? new Date(asset.purchaseDate).toLocaleDateString()
                    : "N/A"}
                </Text>

                {/* Unit Cards Grid */}
                <Stack spacing="sm" mt="md">
                  <Text fw={600}>Units</Text>
                  <Grid>
                    {asset?.assetUnits?.map((unit) => (
                      <Grid.Col key={unit.id} span={3}>
                        <Paper
                          shadow="sm"
                          p="sm"
                          radius="md"
                          style={{
                            cursor:
                              unit.images.length > 0 ? "pointer" : "default",
                          }}
                          onClick={() => {
                            setSelectedUnit(unit); // store the clicked unit
                            setOpened(true);
                          }}
                        >
                          {unit.images.length > 0 ? (
                            <Box style={{ position: "relative" }}>
                              <MantineImage
                                src={`${import.meta.env.VITE_APP_BACKEND_BASE_URL}${unit.images[0]}`}
                                height={120}
                                fit="cover"
                                radius="md"
                              />
                              {unit.images.length > 1 && (
                                <Overlay
                                  opacity={0.4}
                                  color="#000"
                                  radius="md"
                                  style={{
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    color: "white",
                                    fontWeight: 600,
                                    fontSize: "0.8rem",
                                  }}
                                >
                                  +{unit.images.length} images
                                </Overlay>
                              )}
                            </Box>
                          ) : (
                            <Box
                              style={{
                                height: 120,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                backgroundColor: "#f0f0f0",
                                borderRadius: 8,
                                color: "#777",
                                fontWeight: 500,
                              }}
                            >
                              No Image
                            </Box>
                          )}

                          <Text size="sm" fw={500} mt="xs">
                            Product ID: {unit.productId}
                          </Text>
                          <Flex align="center" gap={4}>
                            <IconCurrencyTaka size={14} />
                            <Text size="sm">{unit.purchasePrice ?? "N/A"}</Text>
                          </Flex>
                          <Badge
                            color={
                              unit.status === "IN_STOCK" ? "green" : "gray"
                            }
                            variant="light"
                            mt="xs"
                          >
                            {unit.status}
                          </Badge>
                        </Paper>
                      </Grid.Col>
                    ))}
                  </Grid>
                </Stack>

                {/* Modal Full-Unit Gallery */}
                <Modal
                  opened={opened}
                  onClose={() => setOpened(false)}
                  size="70%"
                  centered
                  padding={10}
                  lockScroll
                  withCloseButton
                >
                  {selectedUnit && selectedUnit.images.length > 0 ? (
                    <Carousel withIndicators loop>
                      {selectedUnit.images.map((img, i) => (
                        <Carousel.Slide key={i}>
                          <img
                            src={`${import.meta.env.VITE_APP_BACKEND_BASE_URL}${img}`}
                            style={{
                              width: "98%",
                              objectFit: "contain",
                              marginBottom: "40px",
                            }}
                          />
                        </Carousel.Slide>
                      ))}
                    </Carousel>
                  ) : (
                    <Text c="dimmed" align="center">
                      No Images to display
                    </Text>
                  )}
                </Modal>

                {/* Assignment */}
                <Group spacing="xs">
                  <Text size="sm" component="div">
                    Current Status:
                  </Text>
                  <Badge color={activeLog ? "green" : "gray"} variant="light">
                    {activeLog ? "ASSIGNED" : "UNASSIGNED"}
                  </Badge>
                </Group>
                
                {activeLog && (
                  <>
                    <Divider my="xs" />
                    <Text size="sm" component="div">
                      <b>Assigned To:</b>{" "}
                      {activeLog.employee?.fullName || "Unknown"}
                    </Text>
                    <Text size="sm" component="div">
                      <b>Assigned At:</b>{" "}
                      {new Date(activeLog.createdAt).toLocaleString()}
                    </Text>
                  </>
                )}
              </Stack>
            )}
          </Paper>

          {/* Logs */}
          <Stack spacing="sm">
            {isLoading && (
              <Center>
                <Loader size="sm" />
              </Center>
            )}
            {isError && (
              <Text c="red" size="sm" component="div">
                Failed to load logs
              </Text>
            )}
            {!isLoading && logs.length === 0 && (
              <Text size="sm" c="dimmed" component="div">
                No logs found
              </Text>
            )}
            {logs.map((log) => (
              <Paper key={log.id} withBorder radius="sm" p="sm">
                <Group>
                  <Text size="sm" component="div">
                    <b>{log.employee?.fullName || "Unknown"}</b>
                  </Text>
                  <Badge
                    size="xs"
                    color={log.unassignedAt ? "gray" : "green"}
                    variant="light"
                  >
                    {log.unassignedAt ? "Inactive" : "Active"}
                  </Badge>
                </Group>
                <Text>Product ID : {log.assetUnit.productId}</Text>
                <Text size="xs" c="dimmed" component="div">
                  Assigned: {new Date(log.createdAt).toLocaleString()}
                </Text>
                {log.unassignedAt && (
                  <Text size="xs" c="dimmed" component="div">
                    Unassigned: {new Date(log.unassignedAt).toLocaleString()}
                  </Text>
                )}
              </Paper>
            ))}
          </Stack>
        </>
      )}
    </Stack>
  );
};

export default AssetLog;
