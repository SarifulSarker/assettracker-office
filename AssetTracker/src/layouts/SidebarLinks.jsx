import { Flex, ScrollArea, rem } from "@mantine/core";
import SidebarItems from "../constants/SidebarItems";
import SidebarLink from "./SidebarLink";

const Sidebar = ({ onClickMobile }) => {
  return (
    <ScrollArea style={{ flex: 1 }}>
      <Flex direction="column" gap="sm" p="md" style={{ width: rem(210) }}>
        {SidebarItems.map((item) => (
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
