import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ActionIcon, Flex, Tooltip } from "@mantine/core";
import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import { IconDownload } from "@tabler/icons-react";

import PageTop from "../../components/global/PageTop.jsx";
import TablePaperContent from "../../components/global/TablePaperContent";
import CustomTable from "../../components/global/CustomTable";
import CustomPagination from "../../components/global/CustomPagination";
import { getAssetsReportApi } from "../../services/assetMapping";
import handleDownloadXLSX from "../../Pages/REPORT/handleDownloadXLSX.jsx";
dayjs.extend(advancedFormat);

const PAGE_SIZE = 20;

const AssetReport = () => {
  const [page, setPage] = useState(1);
  const [isExporting, setIsExporting] = useState(false);

  const { data, isLoading, isRefetching, isPending } = useQuery({
    queryKey: ["assetReport", page],
    queryFn: () =>
      getAssetsReportApi({
        page,
        pageSize: PAGE_SIZE,
      }),
    keepPreviousData: true,
  });

  const assets = data?.data || [];
  const total = data?.total || 0;

  const handleDownload = async () => {
    setIsExporting(true);
    try {
      const allAssets = await getAssetsReportApi({ exportAll: true });
      await handleDownloadXLSX({ assets: allAssets?.data});
    } finally {
      setIsExporting(false);
    }
  };

  const tableHeaders = [
    {
      key: "sl",
      headerTitle: "SL",
      row: (v, row, index) => (page - 1) * PAGE_SIZE + index + 1,
    },
    {
      key: "employeeName",
      headerTitle: "Employee Name",
      row: (v, row) => row.employeeName,
    },
    {
      key: "employeeUid",
      headerTitle: "Employee UID",
      row: (v, row) => row.employeeUid,
    },
    {
      key: "assignedAsset",
      headerTitle: "Assigned Asset",
      row: (v, row) => row.assignedAsset,
    },
    {
      key: "assetType",
      headerTitle: "Asset Type",
      row: (v, row) => row.assetType,
    },
    {
      key: "assetPrice",
      headerTitle: "Asset Price",
      row: (v, row) => row.assetPrice,
    },
    {
      key: "purchaseDate",
      headerTitle: "Purchase Date",
      row: (v, row) => {
        if (!row.purchaseDate) return "-";

        if (Array.isArray(row.purchaseDate)) {
          return row.purchaseDate
            .map((d) => dayjs(d).format("Do MMM YYYY"))
            .join(", ");
        }

        if (typeof row.purchaseDate === "string") {
          return row.purchaseDate
            .split(",")
            .map((d) => dayjs(d.trim()).format("Do MMM YYYY"))
            .join(", ");
        }

        return dayjs(row.purchaseDate).format("Do MMM YYYY");
      },
    },
  ];

  return (
    <div>
      <PageTop PAGE_TITLE="Asset Assignment Report" backBtn={false} />

      <TablePaperContent
        table={
          <CustomTable
            tableHeaders={tableHeaders}
            data={assets}
            isFetching={isPending || isLoading || isRefetching}
          />
        }
        exportAndPagination={
          <Flex justify="space-between" align="center">
            <Tooltip label="Download xlsx" withArrow>
              <ActionIcon
                variant="filled"
                color="blue"
                loading={isExporting}
                disabled={isExporting}
                onClick={handleDownload}
              >
                <IconDownload size={18} />
              </ActionIcon>
            </Tooltip>

            <CustomPagination
              page={page}
              setPage={setPage}
              total={total}
              pageSize={PAGE_SIZE}
            />
          </Flex>
        }
      />
    </div>
  );
};

export default AssetReport;
