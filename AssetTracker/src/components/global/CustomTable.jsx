import { Loader, ScrollArea, Stack, Table } from "@mantine/core";
import React from "react";
import {
  isArrayAndHasContent,
  isObjectAndHasProperties,
} from "../../utils/utils";
import NoDataPlaceholder from "./NoDataPlaceholder";
import { IconSearchOff } from "@tabler/icons-react";
import COLORS from "../../constants/Colors";
import useResponsive from "../../utils/useResponsive";

const CustomTable = ({
  tableHeaders,
  data,
  isFetching,
  isFetchingLoader = <Loader size="xl" />,
  noDataText = "No data found",
  noDataSubText = " ",
  noDataIcon = <IconSearchOff size={70} color={COLORS.accent} />,
  mah,
  noDataHeight = 390,
}) => {
  const { isTablet, isLaptop, isShortHeight } = useResponsive();

  const getNestedProperty = (obj, key) => {
    return key.split(".").reduce((acc, part) => acc && acc[part], obj);
  };

  if (isFetching)
    return (
      <Stack
        style={{
          flex: 1,
        }}
        justify="center"
        align="center"
      >
        {isFetchingLoader}
      </Stack>
    );

  return (
    <>
      {isArrayAndHasContent(data) ? (
        <ScrollArea.Autosize
          mah={mah ? mah : isLaptop ? "67vh" : isShortHeight ? "60vh" : "70vh"}
        >
          <Table
            highlightOnHover
            style={{
              fontSize: isTablet ? "12px" : "14px",
            }}
          >
            <Table.Thead
              style={{
                position: "sticky",
                top: 0,
                zIndex: 2,
                backgroundColor: COLORS.white,
              }}
            >
              <Table.Tr>
                {tableHeaders.map(
                  (header, index) =>
                    isObjectAndHasProperties(header) && (
                      <Table.Th key={index} style={header?.style}>
                        {header.headerTitle}
                      </Table.Th>
                    )
                )}
              </Table.Tr>
            </Table.Thead>

            
            <Table.Tbody>
              {data.map((item, itemIndex) => (
                <Table.Tr key={itemIndex}>
                  {tableHeaders.map(
                    (header, headerIndex) =>
                      isObjectAndHasProperties(header) && (
                        <Table.Td key={headerIndex} style={header?.rowStyle}>
                          {header.row
                            ? header.row(
                                getNestedProperty(item, header.key),
                                item,
                                itemIndex
                              )
                            : getNestedProperty(item, header.key)}
                        </Table.Td>
                      )
                  )}
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </ScrollArea.Autosize>
      ) : (
        <Stack
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <NoDataPlaceholder
            title={noDataText}
            subtext={noDataSubText}
            icon={noDataIcon}
            h={noDataHeight}
          />
        </Stack>
      )}
    </>
  );
};

export default CustomTable;
