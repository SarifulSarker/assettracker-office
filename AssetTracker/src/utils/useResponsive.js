import { useMediaQuery } from "@mantine/hooks";

const useResponsive = () => {
  const isMobile = useMediaQuery("(max-width: 768px)", true, {
    getInitialValueInEffect: false,
  });

  const isTablet = useMediaQuery("(max-width: 1024px)", true, {
    getInitialValueInEffect: false,
  });

  const isLaptop = useMediaQuery("(max-width: 1462px)", true, {
    getInitialValueInEffect: false,
  });

  const isDesktop = useMediaQuery("(min-width: 1463px) ", true, {
    getInitialValueInEffect: false,
  });

  const isShortHeight = useMediaQuery("(max-height: 800px)", true, {
    getInitialValueInEffect: false,
  });

  const isMacBookMinWidth = useMediaQuery("(min-width: 1430px)", true, {
    getInitialValueInEffect: false,
  });

  const isMacBookMaxWidth = useMediaQuery("(max-width: 1520px)", true, {
    getInitialValueInEffect: false,
  });

  const isMacBookMinHeight = useMediaQuery("(min-height: 720px)", true, {
    getInitialValueInEffect: false,
  });

  const isMacBookMaxHeight = useMediaQuery("(max-height: 990px)", true, {
    getInitialValueInEffect: false,
  });

  const isMac =
    isMacBookMinWidth &&
    isMacBookMaxWidth &&
    isMacBookMinHeight &&
    isMacBookMaxHeight;

  return { isMobile, isTablet, isLaptop, isDesktop, isShortHeight, isMac };
};

export default useResponsive;
