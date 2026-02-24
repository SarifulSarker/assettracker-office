import { ActionIcon, Image, Group, Paper, Text } from "@mantine/core";
import { IconX, IconPlus } from "@tabler/icons-react";
import React, { useMemo, useRef } from "react";

const UnitImagePreviewList = ({ images, unitIndex, onRemove, onAdd }) => {
  const fileInputRef = useRef(null);

  const previewUrls = useMemo(
    () =>
      images.map((img) =>
        img.isNew
          ? URL.createObjectURL(img.file)
          : `${import.meta.env.VITE_APP_BACKEND_BASE_URL}${img.url}`
      ),
    [images]
  );

  const handleAddClick = () => fileInputRef.current.click();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) onAdd(unitIndex, { file, isNew: true });
    e.target.value = "";
  };

  return (
    <div style={{ marginTop: 12 }}>
      <Text size="sm" weight={500} mb={4}>
        Unit Images (max:5)
      </Text>
      <div
        style={{
          display: "flex",
          gap: 12,
          overflowX: "auto",
          padding: "4px 0",
        }}
      >
        {previewUrls.map((src, index) => (
          <Paper
            key={index}
            shadow="sm"
            radius="md"
            style={{
              position: "relative",
              width: 100,
              height: 80,
              flexShrink: 0,
              overflow: "hidden",
              cursor: "pointer",
            }}
          >
            <Image src={src} width={100} height={80} fit="cover" />
            <ActionIcon
              color="red"
              size="sm"
              variant="filled"
              style={{
                position: "absolute",
                top: 4,
                right: 4,
                zIndex: 10,
              }}
              onClick={() => onRemove(unitIndex, index)}
            >
              <IconX size={14} />
            </ActionIcon>
          </Paper>
        ))}

        {/* Add Image Button */}
        <Paper
          onClick={handleAddClick}
          shadow="sm"
          radius="md"
          style={{
            width: 80,
            height: 80,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            flexShrink: 0,
            border: "2px dashed #aaa",
          }}
        >
          <IconPlus size={24} color="#888" />
        </Paper>

        <input
          type="file"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleFileChange}
          accept="image/*"
        />
      </div>
    </div>
  );
};

export default UnitImagePreviewList;