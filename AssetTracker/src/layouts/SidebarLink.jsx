import { Flex, rem, UnstyledButton, Text } from "@mantine/core";
import { useHover } from "@mantine/hooks";
import { Link, useLocation } from "react-router-dom";
import COLORS from "../constants/Colors";
const SidebarLink = ({ icon: Icon, label, link, onClick, onClickMobile }) => {
  const { hovered, ref } = useHover();
  const location = useLocation();

  const active = location.pathname.includes(link);

  const handleClick = (e) => {
    if (onClick) onClick(e); // call your onClick (like logout)
    if (onClickMobile) onClickMobile(); // close sidebar on mobile
  };

  return (
    <Link
      to={link || "#"} // if no link, prevent navigation
      style={{ textDecoration: "none" }}
      onClick={handleClick}
    >
      <UnstyledButton
        ref={ref}
        style={{
          display: "flex",
          alignItems: "center",
          width: "100%",
          height: rem(50),
          padding: "0 12px",
          borderRadius: rem(8),
          backgroundColor: active
            ? COLORS.primary
            : hovered
            ? COLORS.secondaryShades[3]
            : "transparent",
          transition: "all 0.25s ease",
          cursor: "pointer",
        }}
      >
        <Flex gap={12} align="center">
          <Icon
            size="1.5rem"
            stroke={1.5}
            color={active ? COLORS.secondary : COLORS.white}
          />
          <Text
            size="sm"
            fw={500}
            color={active ? COLORS.secondary : COLORS.white}
          >
            {label}
          </Text>
        </Flex>
      </UnstyledButton>
    </Link>
  );
};
export default SidebarLink;
