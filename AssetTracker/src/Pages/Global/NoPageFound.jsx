import { Stack, Title } from "@mantine/core";
import { IconError404 } from "@tabler/icons-react";
import React from "react";

const NoPageFound = () => {
  return (
    <Stack align="center" justify="center" style={{ height: "50vh" }}>
      <IconError404 size={150} />
      <Title align="center">404 Not Found</Title>
    </Stack>
  );
};

export default NoPageFound;
