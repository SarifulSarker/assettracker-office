import { useParams } from "react-router-dom";
import QRCode from "react-qr-code";
import { Button, Paper, Stack, Text } from "@mantine/core";
import PageTop from "../../components/global/PageTop";

const AssetQRPage = () => {
  const { uid } = useParams();

  const printQR = () => window.print();

  return (
    <>
      <PageTop PAGE_TITLE="QR" backBtn />
      <Paper p="lg" withBorder>
        <Stack align="center" spacing="md" id="asset-qr">
          <QRCode value={uid} size={160} />

          <Text fw={600}>Asset UID: {uid}</Text>

          <Button onClick={printQR}>Print QR</Button>
        </Stack>
      </Paper>
    </>
  );
};

export default AssetQRPage;
