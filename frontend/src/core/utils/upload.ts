import { uploadFileAction } from "@/app/admin/posts/actions/upload";

/**
 * Tải một tệp tin hình ảnh lên cloud (Openinary)
 * @param file Tệp tin cần upload (ảnh chụp bằng cấp, chứng chỉ...)
 * @returns Đường dẫn URL ảnh tuyệt đối đã upload thành công trên cloud
 */
export async function uploadImageToCloud(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  return uploadFileAction(formData);
}
