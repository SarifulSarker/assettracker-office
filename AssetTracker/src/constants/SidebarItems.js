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
  IconBrandAngularFilled,
  IconBusinessplan,
} from "@tabler/icons-react";

import * as urls from "./AppUrls";

const SidebarItems = [
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
        label: "Brand",
        icon: IconBrandAngularFilled,
        link: urls.BRAND,
      },
      {
        label: "Vendor",
        icon: IconBusinessplan,
        link: urls.VENDOR,
      },
    ],
  },
];

export default SidebarItems;
