// src/constants/SidebarItems.js
import {
  IconBuildingStore,
  IconUser,
  IconCategory,
  IconBrandAngularFilled,
  IconBusinessplan,
  IconUserCircle,
  IconDeviceTabletShare,
  IconMapPinCheck,
} from "@tabler/icons-react";
import * as urls from "./AppUrls";

const SidebarItems = [
  {
    label: "Dashboard",
    icon: IconBuildingStore,
    link: urls.DASHBOARD, // /assets
  },
  {
    label: "User",
    icon: IconUser,
    link: urls.USER, // /employee
  },
  {
    label: "Assets",
    icon: IconBuildingStore,
    link: urls.ASSETS, // /assets
  },
  {
    label: "Employee",
    icon: IconUserCircle,
    link: urls.EMPLOYEE,
  },
  {
    label: "Designation",
    icon: IconDeviceTabletShare,
    link: urls.DESIGNATION,
  },

  {
    label: "Department",
    icon: IconUser,
    link: urls.DEPARTMENT,
  },
  {
    label: "Category",
    icon: IconCategory,
    link: urls.CATEGORIES,
  },
  {
    label: "Brand",
    icon: IconBrandAngularFilled,
    link: urls.BRAND,
  },
  {
    label: "Vendor",
    icon: IconBusinessplan,
    link: urls.VENDOR,
  },
  {
    label: "Asset Mapping",
    icon: IconMapPinCheck,
    link: urls.ASSET_MAPPING,
  },
];

export default SidebarItems;
