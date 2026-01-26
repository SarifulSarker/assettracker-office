// src/constants/SidebarItems.js

import {
  IconUser,
  IconDeviceLaptop,
  IconUserCircle,
  IconMapPinCheck,
  IconSettings,
  IconDeviceTabletShare,
  IconBuildingStore,
  IconListTree,
  IconBrandAngular,
  IconBusinessplan,
  IconLayoutDashboard,
} from "@tabler/icons-react";

import * as urls from "./AppUrls";

const SidebarItems = [
  {
    label: "DashBoard",
    icon: IconLayoutDashboard,
    link: urls.DASHBOARD,
  },
  {
    label: "User",
    icon: IconUser,
    link: urls.USER,
  },
  {
    label: "Assets",
    icon: IconDeviceLaptop,
    link: urls.ASSETS,
  },
  {
    label: "Employee",
    icon: IconUserCircle,
    link: urls.EMPLOYEE,
  },
  {
    label: "Asset Assignment",
    icon: IconMapPinCheck,
    link: urls.ASSET_MAPPING,
  },
  {
    label: "Settings",
    icon: IconSettings,
    links: [
      {
        label: "Designation",
        icon: IconDeviceTabletShare,
        link: urls.DESIGNATION,
      },
      {
        label: "Department",
        icon: IconBuildingStore,
        link: urls.DEPARTMENT,
      },
      {
        label: "Category",
        icon: IconListTree,
        link: urls.CATEGORIES,
      },
      {
        label: "Vendor",
        icon: IconBusinessplan,
        link: urls.VENDOR,
      },
      {
        label: "Brand",
        icon: IconBrandAngular,
        link: urls.BRAND,
      },
    ],
  },
];

export default SidebarItems;
