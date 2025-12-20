import { Box } from "@mantine/core";
import React from "react";
import { Outlet } from "react-router-dom";

const PublicLayout = () => {
  return (
    <Box>
       
      <Outlet />
    </Box>
  );
};

export default PublicLayout;
