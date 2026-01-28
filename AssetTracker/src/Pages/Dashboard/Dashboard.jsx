import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useState, useEffect } from "react";
import { getAssetOverviewApi } from "../../services/dashboard.js";
import { notifications } from "@mantine/notifications";
import {
  Card,
  Text,
  Container,
  Loader,
  SimpleGrid,
  Stack,
  Box,
} from "@mantine/core";
import AssetByCategory from "../../components/Dashboard/AssetByCategory.jsx";
import AssetByDepartment from "../../components/Dashboard/AssetByDepartment.jsx";

// 1️⃣ Number formatter with commas
// BD style: 12,34,56,789
const formatBDT = (num = 0) => {
  const str = Math.floor(num).toString(); // remove decimal
  let lastThree = str.slice(-3);
  let otherNumbers = str.slice(0, -3);
  if (otherNumbers !== "") {
    lastThree = "," + lastThree;
  }
  const formatted =
    otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
  return formatted;
};

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

  const cards = [
    {
      label: "Total Asset Value",
      value: `৳${formatBDT(overview?.totalAssetValue)}`,
    },
    { label: "Total Assets", value: overview?.totalAssets || 0 },
    { label: "In Use", value: overview?.assetsInUse || 0 },
    { label: "In Stock", value: overview?.assetsInStock || 0 },
    { label: "In Maintenance", value: overview?.assetsInMaintenance || 0 },
    { label: "Lost", value: overview?.assetsLost || 0 },
  ];

  return (
    <Container fluid>
      {/* Asset Overview Cards */}
      <SimpleGrid
        cols={7}
        spacing="md"
        breakpoints={[{ maxWidth: "sm", cols: 1 }]}
      >
        {cards.map((card, idx) => (
          <Card
            key={idx}
            withBorder
            radius="md"
            p="md"
            style={{
              gridColumn: idx === 0 ? "span 2" : "span 1", // Total Asset Value 2 columns
            }}
          >
            <Stack spacing={7}>
              {/* LABEL */}
              <Text
                color="dimmed"
                fw={500}
                fz={20}
                size={idx === 0 ? "lg" : "sm"} // Total Value bigger
              >
                {card.label}
              </Text>

              {/* VALUE */}
              <Text
                fw={400}
                style={{
                  fontSize: idx === 0 ? "clamp(24px, 4vw, 50px)" : "40px", // responsive
                  wordBreak: "break-word",
                }}
              >
                {card.value}
              </Text>
            </Stack>
          </Card>
        ))}
      </SimpleGrid>

      {/* Charts Section - Full Width */}
      <Box w="100%" mt="30">
        <Card
          style={{ flex: 1, minWidth: 300 }}
          radius="md"
          withBorder
          my={10}
          p="md"
        >
          <AssetByCategory />
        </Card>
        <Card
          style={{ flex: 1, minWidth: 300 }}
          radius="md"
          mt="30"
          withBorder
          my={10}
          p="md"
        >
          <AssetByDepartment />
        </Card>
      </Box>
    </Container>
  );
};

export default Dashboard;
