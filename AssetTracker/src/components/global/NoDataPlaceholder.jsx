import { Stack, Text } from "@mantine/core";
import { IconBox, IconError404 } from "@tabler/icons-react";
import React from "react";
import COLORS from "../../constants/Colors";

const NoDataPlaceholder = ({
  title,
  subtext,
  icon,
  apiError = false,
  h = 390,
  ...rest
}) => {
  if (apiError)
    return (
      <Stack w="100%" h={h} align="center" justify="center" {...rest}>
        <IconError404 size={70} color={COLORS.error} />
        <Text size="xl" weight={700}>
          Something went wrong
        </Text>
        <Text size="sm" weight={300} color="dimmed">
          Please contact admin to see what is wrong or refresh after some time.
        </Text>
      </Stack>
    );
  return (
    <Stack w="100%" h={h} align="center" justify="center" {...rest}>
      {icon || <IconBox size={70} color={COLORS.blue} />}
      <Text size="xl" weight={700}>
        {title || "No Data"}
      </Text>
      <Text size="sm" weight={300} color="dimmed">
        {subtext || "No data available at the moment"}
      </Text>
    </Stack>
  );
};

export default NoDataPlaceholder;
