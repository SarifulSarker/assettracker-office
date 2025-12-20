import { Flex, Text } from "@mantine/core";
import { useSelector } from "react-redux";
import COLORS from "../constants/Colors";

const HeaderContent = () => {
  const user = useSelector((state) => state.auth.user); // user object
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);

  return (
    <Flex direction="column">
      {isLoggedIn && user ? (
        <>
          <Text fw={600} color={COLORS.secondary}>
            {user.firstName} {user.lastName}
          </Text>
          <Text size="sm" color={COLORS.secondary}>
            {user.email}
          </Text>
        </>
      ) : (
        <Text fw={600} color={COLORS.secondary}>
          Guest
        </Text>
      )}
    </Flex>
  );
};

export default HeaderContent;
