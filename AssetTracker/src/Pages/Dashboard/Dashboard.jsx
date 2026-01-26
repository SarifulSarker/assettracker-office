import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useState, useEffect } from "react";
import { getAssetOverviewApi } from "../../services/dashboard.js";
import { notifications } from "@mantine/notifications";
import {
  Card,
  Text,
  Flex,
  Container,
  Loader,
  SimpleGrid,
  Stack,
  Box,
} from "@mantine/core";
import AssetByCategory from "../../components/Dashboard/AssetByCategory.jsx";
import AssetByDepartment from "../../components/Dashboard/AssetByDepartment.jsx";

const Dashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOverview();
  }, []);

  const fetchOverview = async () => {
    try {
      const data = await getAssetOverviewApi();
      setOverview(data.data);
    } catch (err) {
      notifications.show({
        title: "Error",
        message: err.message || "Failed to fetch overview",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container fluid>
        <Loader size="lg" variant="dots" />
      </Container>
    );
  }

  return (
    <>
      <Container fluid>
        {/* Asset Overview Cards */}
        <SimpleGrid
          cols={6}
          spacing="md"
          breakpoints={[{ maxWidth: "sm", cols: 1 }]}
        >
          {[
            {
              label: "Total Asset Value",
              value: `৳${overview?.totalAssetValue || 0}`,
            },
            { label: "Total Assets", value: overview?.totalAssets || 0 },
            { label: "In Use", value: overview?.assetsInUse || 0 },
            { label: "In Stock", value: overview?.assetsInStock || 0 },
            {
              label: "In Maintenance",
              value: overview?.assetsInMaintenance || 0,
            },
            { label: "Lost", value: overview?.assetsLost || 0 },
          ].map((card, idx) => (
            <Card key={idx} withBorder p="md">
              <Stack spacing={6}>
                {/* LABEL */}
                <Text size="sm" color="dimmed" fz={20} fw={500}>
                  {card.label}
                </Text>

                {/* VALUE */}
                <Text size="40px" fw={500}>
                  {card.value}
                </Text>
              </Stack>
            </Card>
          ))}
        </SimpleGrid>

        {/* Charts Section - Full Width */}
        <Box w="100%" mt="30">
          <Card style={{ flex: 1, minWidth: 300 }} withBorder my={10} p="md">
            <AssetByCategory />
          </Card>
          <Card style={{ flex: 1, minWidth: 300 }} mt="30" withBorder my={10} p="md">
            <AssetByDepartment />
          </Card>
        </Box>
      </Container>
    </>
  );
};

export default Dashboard;
