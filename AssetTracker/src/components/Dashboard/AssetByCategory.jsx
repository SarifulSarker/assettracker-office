import React, { useEffect, useRef, useState } from "react";
import { Card, Loader, Text, Center } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import ApexCharts from "apexcharts";
import { getAssetCategoryOverviewApi } from "../../services/dashboard.js";

const AssetByCategory = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  // 1️⃣ Fetch data once
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getAssetCategoryOverviewApi();

        if (!res.success) {
          notifications.show({
            title: "Error",
            message: res.message || "Failed to fetch data",
            color: "red",
          });
          setLoading(false);
          return;
        }

        setData(res.data);
      } catch (err) {
        notifications.show({
          title: "Error",
          message: err.message || "Failed to fetch chart data",
          color: "red",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 2️⃣ Render chart once div exists AND data is ready
  useEffect(() => {
    if (!data || !chartRef.current) return;

    const { categories, countSeries, priceSeries } = data;

    const options = {
      chart: {
        type: "bar",
        height: 350,
        toolbar: {
          show: true,
          offsetY: -40, // 🔼 মান বাড়ালে আরো উপরে উঠবে
          offsetX: 0,
        },
      },
      legend: {
        show: false, // ❌ নিচের color box + name চলে যাবে
      },
      series: [
        {
          name: "Asset Count",
          data: countSeries,
        },
      ],

      xaxis: {
        categories,
      },

      plotOptions: {
        bar: {
          distributed: true, // ⭐ MAGIC LINE
          columnWidth: "50%",
        
        },
      },

      colors: [
        "#4C6EF5",
        "#15AABF",
        "#40C057",
        "#FAB005",
        "#FA5252",
        "#7950F2",
        "#12B886",
      ],

      yaxis: {
        title: {
          text: "Asset Count",
        },
      },

      tooltip: {
        custom: ({ seriesIndex, dataPointIndex, w }) => {
          const count = w.globals.series[seriesIndex][dataPointIndex];
          const price = priceSeries[dataPointIndex];
          return `
        <div style="padding: 8px;">
          <strong>${w.globals.labels[dataPointIndex]}</strong><br/>
          Count: ${count}<br/>
          Price: ৳ ${price.toLocaleString()}
        </div>
      `;
        },
      },
    };

    // Destroy previous chart if exists
    chartInstance.current?.destroy?.();

    // Create new chart
    chartInstance.current = new ApexCharts(chartRef.current, options);
    chartInstance.current.render();

    // Cleanup on unmount
    return () => chartInstance.current?.destroy?.();
  }, [data]); // run whenever data changes

  return (
    <Card padding="lg">
      <Text weight={500} mb="md">
        Assets by Category
      </Text>

      {loading ? (
        <Center style={{ height: 200 }}>
          <Loader size="md" variant="dots" />
        </Center>
      ) : (
        <div ref={chartRef} style={{ height: 350 }} />
      )}
    </Card>
  );
};

export default AssetByCategory;
