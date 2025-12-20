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
import Logo from "../assets/manushTech.ico"

const PrivateLayout = () => {
  const [opened, { toggle, close }] = useDisclosure(false);
  const navigate = useNavigate();
const dispatch = useDispatch();

 
  const handleLogout = () => {
    
    dispatch(logout())
    navigate("/signin");
  };

  //logout modal open
   const handleLogoutModal = () => {
     modals.openConfirmModal({
      title: 'Are you sure?',
        centered: true,
      children: (
        <Text size="sm">
          Are You Sure You Want To Logout??
        </Text>
      ),
      
      labels: { confirm: 'Confirm', cancel: 'Cancel' },
       confirmProps: { color: 'red' },
      onCancel: () => console.log('Cancel'),
      onConfirm: () => {
       handleLogout()
       // closeAllModals();
      },
    });
    };

  return (
    <AppShell
      padding={"md"}
      navbar={{
        width: 260,
        breakpoint: "md",
        collapsed: { mobile: !opened },
      }}
      header={{ height: { base: 50 } }}
      styles={{
        main: {
          background: COLORS.mainBg ,
      
        },
      }}
    >
      {/* HEADER */}
      <AppShell.Header
        style={{
          backgroundColor: COLORS.primary,
          color: COLORS.secondary,
          boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
        }}
      >
    <Flex
      align="center"          // vertically center everything
      justify="space-between" // push first child left, second child right
      h="100%"
      px="lg"
    >
      {/* Left side: burger + logo */}
      <Flex align="center" gap="md">
        <Burger
          opened={opened}
          onClick={toggle}
          hiddenFrom="md"
          size="sm"
          color={COLORS.secondary}
        />
        <Box
          component="img"
          src={Logo}
          alt="Logo"
          style={{ width: 40 ,marginLeft: 99,  }}
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
          backgroundColor: COLORS.secondary,
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
          leftSection={<IconLogout size={16} />}
          onClick={handleLogoutModal}
          fullWidth
          variant="light"
          color="red"
          style={{
            padding: "10px 12px",
            borderRadius: 12,
            fontWeight: 600,
            justifyContent: "center",
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
