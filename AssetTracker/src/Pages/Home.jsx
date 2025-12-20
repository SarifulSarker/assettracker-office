import { Container, Title, Text, Button, Stack, Center, Paper } from "@mantine/core";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <Center mih="100vh" style={{ background: "#ffff" }}>
      <Paper
        shadow="xl"
        radius="lg"
        p="xl"
        withBorder
        style={{
          background: "#b6b3b3ff",
          borderColor: "#333",
          width: "420px",
          textAlign: "center",
        }}
      >
        <Stack spacing="md">
          <Title order={1} c="white" ta="center">
            Welcome to Home Page
          </Title>

          <Text c="gray.4" size="lg">
            Click the button below to sign in.
          </Text>

          <Link to="/signin" style={{ textDecoration: "none" }}>
            <Button
              size="md"
              radius="md"
              fullWidth
              styles={{
                root: {
                  backgroundColor: "#1e88e5",
                  "&:hover": { backgroundColor: "#1565c0" },
                },
              }}
            >
              Sign In
            </Button>
          </Link>
        </Stack>
      </Paper>
    </Center>
  );
}
