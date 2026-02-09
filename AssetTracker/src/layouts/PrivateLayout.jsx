import React from "react";
import {
  AppShell,
  Burger,
  Group,
  ScrollArea,
  Flex,
  Box,
  Text,
  Button,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Outlet, useNavigate } from "react-router-dom";
import SidebarLinks from "../layouts/SidebarLinks";
import NavbarLink from "../layouts/SidebarLink";
import { IconLogout } from "@tabler/icons-react";
import COLORS from "../constants/Colors";
import SidebarLink from "../layouts/SidebarLink";
import { useDispatch } from "react-redux";
import { logout } from "../store/reducers/authReducer";
import { modals } from "@mantine/modals";
import HeaderContent from "../components/HeaderContent";
import Logo from "../assets/Logo SVG.svg";
import useResponsive from "../utils/useResponsive"; // je hook tumi banayechile

const PrivateLayout = () => {
  const [opened, { toggle, close }] = useDisclosure(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isMobile, isTablet } = useResponsive();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  //logout modal open
  const handleLogoutModal = () => {
    modals.openConfirmModal({
      title: "Are you sure?",
      centered: true,
      children: <Text size="sm">Are You Sure You Want To Logout??</Text>,

      labels: { confirm: "Confirm", cancel: "Cancel" },
      confirmProps: { color: "red" },
      //onCancel: () => console.log('Cancel'),
      onConfirm: () => {
        handleLogout();
        // closeAllModals();
      },
    });
  };

  return (
    <AppShell
      padding={"md"}
      navbar={{
        width: 250,
        breakpoint: "md",
        collapsed: { mobile: !opened },
      }}
      header={{ height: { base: 75 } }}
      styles={{
        main: {},
      }}
    >
      {/* HEADER */}
      <AppShell.Header
        style={{
          backgroundColor: COLORS.nav_header,
          color: COLORS.background,
          boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
        }}
      >
        <Flex
          align="center"
          justify="space-between"
          h="100%"
          px={isMobile ? "sm" : "lg"} // padding adjust
        >
          {/* Left side: burger + logo */}
          <Flex align="center" gap={isMobile ? "sm" : "md"}>
            <Burger
              opened={opened}
              onClick={toggle}
              hiddenFrom="md" // Mantine automatically hides burger from md+ screens
              size={isMobile ? "sm" : "md"}
              color="#ffffff"
            />
            <Box
              component="img"
              src={Logo}
              alt="Logo"
              style={{
                width: isMobile ? 160 : "auto", // responsive width
                height: isMobile ? 45 : 57,
                marginLeft: isMobile ? -20 : -44,
              }}
            />
          </Flex>

          {/* Right side: user info */}
          <HeaderContent />
        </Flex>
      </AppShell.Header>

      {/* SIDEBAR */}
      <AppShell.Navbar
        p="xs"
        style={{
          backgroundColor: COLORS.nav_header,
          borderRight: "1px solid rgba(0,0,0,0.05)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <ScrollArea style={{ flex: 1, marginBottom: 10 }}>
          <SidebarLinks onClickMobile={close} />
        </ScrollArea>
        <Button
          leftSection={<IconLogout size={20} />}
          onClick={handleLogoutModal}
          fullWidth
          variant="light"
          color="red"
          style={{
            borderRadius: 14,
            fontWeight: 600,
            justifyContent: "center",
            marginBottom: 16,
            fontSize: 16,
          }}
        >
          Logout
        </Button>
      </AppShell.Navbar>

      {/* MAIN CONTENT */}
      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
};

export default PrivateLayout;
