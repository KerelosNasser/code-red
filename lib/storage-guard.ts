import { mkdir, statfs } from "fs/promises"
import { join } from "path"

export const MEDIA_ROOT = join(process.cwd(), "public")

export class StorageGuardError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "StorageGuardError"
  }
}

export function getUploadLimitBytes() {
  const mb = Number(process.env.MEDIA_MAX_UPLOAD_MB || "1024")
  return mb * 1024 * 1024
}

export function getMinFreeBytes() {
  const mb = Number(process.env.MEDIA_MIN_FREE_MB || "1024")
  return mb * 1024 * 1024
}

export async function getFreeBytes(path = MEDIA_ROOT) {
  await mkdir(path, { recursive: true })
  const stats = await statfs(path)
  return Number(stats.bavail) * Number(stats.bsize)
}

export async function assertSufficientStorage(fileSize: number, path = MEDIA_ROOT) {
  const uploadLimit = getUploadLimitBytes()
  if (fileSize > uploadLimit) {
    throw new StorageGuardError(
      `File is too large. Maximum upload is ${Math.floor(uploadLimit / 1024 / 1024)} MB.`
    )
  }

  const freeBytes = await getFreeBytes(path)
  const minFreeBytes = getMinFreeBytes()
  if (freeBytes - fileSize < minFreeBytes) {
    throw new StorageGuardError(
      "Storage is almost full. Upload blocked before writing the file."
    )
  }
}
