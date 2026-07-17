import { SessionStore } from "@/common/store";
import type { SessionStoreModel } from "@/common/store/model";
import modalService from "@/common/util/modal.service";
import type { Store } from "pinia";

export const CHUNK_SIZE = 5 * 1024 * 1024;

export const chunkFile = (file: File, chunkSize: number) => {
  const chunks = [];
  for (let i = 0; i < file.size; i += chunkSize) {
    const chunk = file.slice(i, i + chunkSize);

    chunks.push(chunk);
  }

  return chunks;
};

export const isExtensionPermitted = (
  extension: string,
  session: Store<"session", SessionStoreModel>
) => {
  return (
    session.user &&
    session.user.extensionsAllowedToUpload &&
    session.user.extensionsAllowedToUpload.find((ext) => ext === extension)
  );
};

export const allowedExtensionsMessage = async (filename: string) => {
  const session = SessionStore();

  return await modalService.confirmation({
    content: `El archivo que intenta subir no es permitido. Las extensiones permitidas son: ${session.user?.extensionsAllowedToUpload.join(
      ","
    )}.`,
    title: `Error en la carga de ${filename}`,
  });
};

export const downloadFile = (response: any) => {
  const blob = new Blob([response.data], {
    type: response.headers["content-type"],
  });
  const title = response.headers["content-disposition"].split("filename=")[1];
  const anchor = document.createElement("a");

  anchor.href = URL.createObjectURL(blob);
  anchor.target = "_blank";
  anchor.download = title;
  anchor.click();
  anchor.remove();
};
