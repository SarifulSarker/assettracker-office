import { Flex, ScrollArea, rem } from "@mantine/core";
import SidebarItems from "../constants/SidebarItems";
import SidebarLink from "./SidebarLink";
import { usePermissions } from "../hooks/useAuthPermissions";

const Sidebar = ({ onClickMobile }) => {
  const { hasPermission } = usePermissions();

  // Filter sidebar items based on permissions
  const filteredItems = SidebarItems.map((item) => {
    if (item.links) {
      const allowedLinks = item.links.filter((sub) =>
        hasPermission(sub.module, "view"),
      );
      if (allowedLinks.length === 0) return null;
      return { ...item, links: allowedLinks };
    } else {
      if (item.module && !hasPermission(item.module, "view")) return null;
      return item;
    }
  }).filter(Boolean);

  return (
    <ScrollArea style={{ flex: 1 }}>
      <Flex direction="column" gap="sm" p="md" style={{ width: rem(210) }}>
        {filteredItems.map((item) => (
          <SidebarLink
            key={item.label}
            icon={item.icon}
            label={item.label}
            link={item.link}
            links={item.links} // pass child links if present
            onClickMobile={onClickMobile}
          />
        ))}
      </Flex>
    </ScrollArea>
  );
};

export default Sidebar;
