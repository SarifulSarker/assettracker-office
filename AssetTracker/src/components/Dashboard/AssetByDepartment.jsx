import React, { useEffect, useRef, useState } from "react";
import { Card, Loader, Text, Center } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import ApexCharts from "apexcharts";
import { getAssetDepartmentOverviewApi } from "../../services/dashboard.js";

const AssetByDepartment = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  // 1️⃣ Fetch data once
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getAssetDepartmentOverviewApi();

        if (!res.success) {
          notifications.show({
            title: "Error",
            message: res.message || "Failed to fetch data",
            color: "red",
          });
          setLoading(false);
          return;
        }

        // Prepare data for chart
        const categories = res.data.map((item) => item.department); // department names
        const seriesData = res.data.map((item) => item.count); // counts

        setData({ categories, seriesData });
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
          name: "Assets",
          data: data.seriesData,
        },
      ],

      xaxis: {
        categories: data.categories,
      },

      plotOptions: {
        bar: {
          horizontal: true,
       
          distributed: true, // ⭐ per department color
          barHeight: "70%",
        },
      },

      colors: [
        "var(--mantine-color-blue-6)",
        "var(--mantine-color-teal-6)",
        "var(--mantine-color-green-6)",
        "var(--mantine-color-indigo-6)",
        "var(--mantine-color-cyan-6)",
      ],

      dataLabels: {
        enabled: true,
      },

      tooltip: {
        custom: ({ seriesIndex, dataPointIndex, w }) => {
          const count = w.globals.series[seriesIndex][dataPointIndex];
          const department = w.globals.labels[dataPointIndex];
          return `
        <div style="padding: 8px;">
          <strong>${department}</strong><br/>
          Count: ${count}
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
  }, [data]);

  return (
    <Card padding="lg">
      <Text weight={500} mb="md">
        Assets by Department
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

export default AssetByDepartment;
