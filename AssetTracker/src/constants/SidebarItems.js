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
    module: null, // permission check নেই
    icon: IconLayoutDashboard,
    link: urls.DASHBOARD,
  },
  {
    label: "User",
    module: "user",
    icon: IconUser,
    link: urls.USER,
  },
  {
    label: "Assets",
    module: "asset",
    icon: IconDeviceLaptop,
    link: urls.ASSETS,
  },
  {
    label: "Employee",
    module: "employee",
    icon: IconUserCircle,
    link: urls.EMPLOYEE,
  },
  {
    label: "Asset Assignment",
    module: "asset_assignment",
    icon: IconMapPinCheck,
    link: urls.ASSET_MAPPING,
  },
  {
    label: "Settings",
    module: null, // parent container, permission check on children
    icon: IconSettings,
    links: [
      {
        label: "Designations",
        module: "designation",
        icon: IconDeviceTabletShare,
        link: urls.DESIGNATION,
      },
      {
        label: "Departments",
        module: "department",
        icon: IconBuildingStore,
        link: urls.DEPARTMENT,
      },
      {
        label: "Categories",
        module: "category",
        icon: IconListTree,
        link: urls.CATEGORIES,
      },
      {
        label: "Vendors",
        module: "vendor",
        icon: IconBusinessplan,
        link: urls.VENDOR,
      },
      {
        label: "Brands",
        module: "brand",
        icon: IconBrandAngular,
        link: urls.BRAND,
      },
    ],
  },
];

export default SidebarItems;
