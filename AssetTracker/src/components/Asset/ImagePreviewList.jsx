import { ActionIcon, Button, Group, Image } from "@mantine/core";
import { IconX } from "@tabler/icons-react";
import React, { useMemo } from "react";

const ImagePreviewList = React.memo(({ images, onRemove }) => {
  const previewUrls = useMemo(() => {
    return images.map((img) =>
      img instanceof File
        ? URL.createObjectURL(img)
        : `${import.meta.env.VITE_APP_BACKEND_BASE_URL}${img}`,
    );
  }, [images]);

  return (
    <Group>
      {previewUrls.map((src, index) => (
        <div key={index} style={{ position: "relative" }}>
          <Image src={src} width={80} height={80} radius="sm" fit="cover" />
          <ActionIcon
            color="red"
            size="sm"
            style={{ position: "absolute", top: -8, right: -8 }}
            onClick={() => onRemove(index)}
          >
            <IconX size={14} />
          </ActionIcon>
        </div>
      ))}
   
    </Group>
  );
});

export default ImagePreviewList;
