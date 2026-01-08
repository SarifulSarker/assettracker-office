// src/layouts/SidebarLink.jsx
import { useState } from "react";
import { Flex, rem, UnstyledButton, Text, Collapse } from "@mantine/core";
import { Link, useLocation } from "react-router-dom";
import COLORS from "../constants/Colors";

const SidebarLink = ({
  icon: Icon,
  label,
  link,
  links,
  onClick,
  onClickMobile,
}) => {
  const location = useLocation();
  const [openDropdown, setOpenDropdown] = useState(false);

  // Active if current path matches link or any child link
  const active = link
    ? location.pathname.includes(link)
    : links?.some((l) => location.pathname.includes(l.link));

  const handleClick = () => {
    if (onClick) onClick();
    if (onClickMobile) onClickMobile();
    if (links) setOpenDropdown(!openDropdown); // toggle dropdown for parent
  };

  // Wrapper: if parent has a direct link
  const Wrapper = ({ children }) =>
    link ? (
      <Link
        to={link}
        style={{ textDecoration: "none" }}
        onClick={onClickMobile}
      >
        {children}
      </Link>
    ) : (
      <>{children}</>
    );

  return (
    <div>
      {/* Parent button */}
      <Wrapper>
        <UnstyledButton
          onClick={handleClick}
          style={{
            display: "flex",
            alignItems: "center",
            width: "100%",
            height: rem(50),
            padding: "0 12px",
            borderRadius: rem(8),
            backgroundColor: active ? COLORS.background : "transparent",
            cursor: "pointer",
            transition: "background-color 0.25s ease, color 0.25s ease",
          }}
        >
          <Flex
            gap={12}
            align="center"
            justify="space-between"
            style={{ width: "100%" }}
          >
            <Flex gap={12} align="center">
              <Icon
                size="1.5rem"
                stroke={1.5}
                color={active ? COLORS.app_color : COLORS.white}
              />
              <Text
                size="sm"
                fw={500}
                color={active ? COLORS.app_color : COLORS.white}
              >
                {label}
              </Text>
            </Flex>

            {links && (
              <Text size="sm" color={COLORS.white}>
                {openDropdown ? "▾" : "▸"}
              </Text>
            )}
          </Flex>
        </UnstyledButton>
      </Wrapper>

      {/* Dropdown children */}
      {links && (
        <Collapse in={openDropdown}>
          <Flex direction="column" gap="xs" ml="md" mt="xs">
            {links.map((child) => {
              const childActive = location.pathname.includes(child.link);

              return (
                <Link
                  key={child.label}
                  to={child.link}
                  style={{ textDecoration: "none" }}
                  onClick={() => onClickMobile && onClickMobile()}
                >
                  <UnstyledButton
                    style={{
                      display: "flex",
                      alignItems: "center",
                      width: "100%",
                      height: rem(45),
                      padding: "0 12px",
                      borderRadius: rem(8),
                      backgroundColor: childActive
                        ? COLORS.background
                        : "transparent",
                      cursor: "pointer",
                      transition:
                        "background-color 0.25s ease, color 0.25s ease",
                    }}
                  >
                    <Flex gap={12} align="center">
                      <child.icon
                        size="1.25rem"
                        stroke={1.5}
                        color={childActive ? COLORS.app_color : COLORS.white}
                      />
                      <Text
                        size="sm"
                        fw={500}
                        color={childActive ? COLORS.app_color : COLORS.white}
                      >
                        {child.label}
                      </Text>
                    </Flex>
                  </UnstyledButton>
                </Link>
              );
            })}
          </Flex>
        </Collapse>
      )}
    </div>
  );
};

export default SidebarLink;
