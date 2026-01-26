import { getAllAssetsApi } from "../services/asset";
import { notifications } from "@mantine/notifications";

const formatDate = (date) => {
  if (!date) return "";
  return new Date(date).toISOString().split("T")[0];
};

const downloadAssetsCSV = async ({ searchKey, statusBool }) => {
  try {
    const res = await getAllAssetsApi({
      page: 1,
      perpage: 10000,
      search: searchKey,
      status: statusBool,
    });

    const assets = res?.data?.assets || [];

    if (assets.length === 0) {
      notifications.show({
        title: "No Data",
        message: "No assets found to download",
        color: "yellow",
        position: "top-center",
      });
      return;
    }

    const headers = [
      "Asset Name",
      "Category",
      "Subcategory",
      "Brand",
      "Vendor",
      "Assigned Employee",
      "Specs",
      "Purchase Date",
      "Purchase Price",
      "Status",
    ];

    const rows = assets.map((a) => [
      a.name || "",
      a.category?.name || "",
      a.subCategory?.name || "",
      a.brand?.name || "",
      a.vendor?.name || "",
      a.assetAssingmentEmployees?.[0]?.employee?.fullName || "Not Assigned",
      (a.specs || "").replace(/\n/g, " "),
      formatDate(a.purchaseDate),
      a.purchasePrice ?? "",
      a.is_active ? "Active" : "Inactive",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((r) =>
        r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","),
      ),
    ].join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "assets.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (err) {
    notifications.show({
      title: "Error",
      message: "Failed to download CSV",
      color: "red",
      position: "top-center",
    });
  }
};

export default downloadAssetsCSV;
