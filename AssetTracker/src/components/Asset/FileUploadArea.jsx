import { Dropzone, IMAGE_MIME_TYPE } from "@mantine/dropzone";
import { Group, Text, Image, ActionIcon, Paper } from "@mantine/core";
import { IconPhoto, IconX } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";

const FileUploadArea = ({ images, setImages }) => {
  const handleDrop = (files) => {
    const newFiles = [...images, ...files].slice(0, 5);

    if (newFiles.length > 5) {
      notifications.show({
        title: "Limit exceeded",
        message: "You can upload maximum 5 images",
        color: "red",
        position: "top-center",
      });
    }

    // Remove duplicates by name + size
    const uniqueFiles = Array.from(
      new Set(newFiles.map((f) => f.name + f.size)),
    ).map((key) => newFiles.find((f) => f.name + f.size === key));

    setImages(uniqueFiles);
  };

  const removeImage = (index) =>
    setImages((prev) => prev.filter((_, i) => i !== index));

  return (
    <Paper withBorder radius="md" p="md">
      {/* Drag-and-drop zone */}
      <Dropzone
        onDrop={handleDrop}
        maxSize={5 * 1024 ** 2} // 5MB per file
        accept={IMAGE_MIME_TYPE}
        multiple
        style={{
          minHeight: 120,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Group position="center" spacing="xs" direction="column">
          <IconPhoto size={32} />
          <Text align="center" size="sm" color="dimmed">
            Drag images here or click to select
          </Text>
          <Text align="center" size="xs" color="dimmed">
            Max 5 images
          </Text>
        </Group>
      </Dropzone>

      {/* Preview thumbnails */}
      {images.length > 0 && (
        <Group spacing="sm" mt="sm">
          {images.map((file, index) => (
            <div key={index} style={{ position: "relative" }}>
              <Image
                src={URL.createObjectURL(file)}
                alt={file.name}
                width={80}
                height={80}
                radius="sm"
                fit="cover"
              />
              <ActionIcon
                color="red"
                size="sm"
                style={{ position: "absolute", top: -8, right: -8 }}
                onClick={() => removeImage(index)}
              >
                <IconX size={16} />
              </ActionIcon>
            </div>
          ))}
        </Group>
      )}

      {/* Uploaded count */}
      {images.length > 0 && (
        <Text size="sm" color="dimmed" mt="xs">
          {images.length}/5 images uploaded
        </Text>
      )}
    </Paper>
  );
};

export default FileUploadArea;
