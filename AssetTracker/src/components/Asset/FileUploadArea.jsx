import { Dropzone, IMAGE_MIME_TYPE } from "@mantine/dropzone";
import {
  Group,
  Text,
  Image,
  ActionIcon,
  Paper,
  Modal,
  Stack,
  Button,
} from "@mantine/core";
import { IconPhoto, IconX, IconCamera, IconDeviceMobile } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { useRef, useState } from "react";

const FileUploadArea = ({ images, setImages }) => {
  const [opened, setOpened] = useState(false);

  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  // ---------- Handle files ----------
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

    const uniqueFiles = Array.from(
      new Set(newFiles.map((f) => f.name + f.size)),
    ).map((key) => newFiles.find((f) => f.name + f.size === key));

    setImages(uniqueFiles);
    setOpened(false);
  };

  const handleFileChange = (e) => {
    handleDrop(Array.from(e.target.files));
  };

  const removeImage = (index) =>
    setImages((prev) => prev.filter((_, i) => i !== index));

  // ---------- Modal actions ----------
  const openCamera = () => cameraInputRef.current.click();
  const openGallery = () => galleryInputRef.current.click();

  return (
    <Paper withBorder radius="md" p="md">
      {/* ========= Modal ========= */}
      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title="Upload Image"
        centered
      >
        <Stack>
          <Button leftSection={<IconCamera size={18} />} onClick={openCamera}>
            📷 Take Photo
          </Button>

          <Button
            variant="light"
            leftSection={<IconDeviceMobile size={18} />}
            onClick={openGallery}
          >
             🖼️ Choose from Gallery
          </Button>
{/* 
          <Button color="red" variant="subtle" onClick={() => setOpened(false)}>
            Cancel
          </Button> */}
        </Stack>
      </Modal>

      {/* Camera input */}
      <input
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        ref={cameraInputRef}
        style={{ display: "none" }}
        onChange={handleFileChange}
      />

      {/* Gallery input */}
      <input
        type="file"
        accept="image/*"
        multiple
        ref={galleryInputRef}
        style={{ display: "none" }}
        onChange={handleFileChange}
      />

      {/* ========= Click Area ========= */}
      <Dropzone
        onClick={() => setOpened(true)}   // 🔥 open modal now
        onDrop={handleDrop}
        maxSize={5 * 1024 ** 2}
        accept={IMAGE_MIME_TYPE}
        multiple
        style={{
          minHeight: 120,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
        }}
      >
        <Group position="center" spacing="xs" direction="column">
          <IconPhoto size={32} />
          <Text size="sm" color="dimmed">
            Tap to upload images
          </Text>
          <Text size="xs" color="dimmed">
            Max 5 images
          </Text>
        </Group>
      </Dropzone>

      {/* ========= Preview ========= */}
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

      {images.length > 0 && (
        <Text size="sm" color="dimmed" mt="xs">
          {images.length}/5 images uploaded
        </Text>
      )}
    </Paper>
  );
};

export default FileUploadArea;
