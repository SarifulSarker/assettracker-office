import { Flex, Pagination, Text } from "@mantine/core";
import React from "react";
import { hexToRgba } from "../../utils/utils";
import COLORS from "../../constants/Colors";

const CustomPagination = ({ page, setPage, total, pageSize = 20 }) => {
    return (
        <Flex mt="20px" align="start" direction="column">
            <Text size="sm" pb={4} fw={500}>
                {total} {total?.length > 1 ? "results" : "result"} found
            </Text>
            <Pagination
                value={page}
                onChange={setPage}
                total={Math.ceil(total / pageSize)}
                color={hexToRgba(COLORS.secondary)}
            />
        </Flex>
    );
};

export default CustomPagination;
