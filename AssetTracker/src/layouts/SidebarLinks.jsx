// SidebarLinks.jsx
import { Stack } from "@mantine/core";
import SidebarItems from "../constants/SidebarItems";
import SidebarLink from "./SidebarLink";

const SidebarLinks = ({ onclick }) => {
  return (
    <Stack spacing="xs">
      {SidebarItems.map((item, idx) => (
        <SidebarLink
          key={idx}
          icon={item.icon}
          label={item.label}
          link={item.link}
          onClick={onclick} // Pass down the close function
        />
      ))}
    </Stack>
  );
};

export default SidebarLinks;
