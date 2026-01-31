import { Tabs, Box } from "@mantine/core";
import PageTop from "../../components/global/PageTop";
import User from "../User/user"; // তোমার এই component
import RoleManagement from "../RoleAndPermission/roleandPermission"; 
// ↑ যেই component এ role management আছে

const UserManagement = () => {
  return (
    <Box>
    
      <Tabs defaultValue="users" variant="outline" >
        <Tabs.List>
          <Tabs.Tab value="users">Users</Tabs.Tab>
          <Tabs.Tab value="roles">Roles & Permissions</Tabs.Tab>
        </Tabs.List>

        {/* 👇 User Tab */}
        <Tabs.Panel value="users" pt="md">
          <User />
        </Tabs.Panel>

        {/* 👇 Role Tab */}
        <Tabs.Panel value="roles" pt="md">
          <RoleManagement />
        </Tabs.Panel>
      </Tabs>
    </Box>
  );
};

export default UserManagement;
