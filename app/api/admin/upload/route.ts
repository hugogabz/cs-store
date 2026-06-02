import { createHash } from "node:crypto"
import { NextResponse } from "next/server"
import { isAdminAuthenticated, unauthorizedResponse } from "@/services/admin-auth"

export const runtime = "nodejs"

const MAX_IMAGE_SIZE = 5 * 1024 * 1024

type CloudinaryUploadResponse = {
  public_id: string
  secure_url: string
  width: number
  height: number
  format: string
  resource_type: string
}

function getCloudinaryConfig() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME
  const apiKey = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET
  const folder = process.env.CLOUDINARY_UPLOAD_FOLDER ?? "cs-store/products"

  if (!cloudName || !apiKey || !apiSecret) {
    return null
  }

  return {
    apiKey,
    apiSecret,
    cloudName,
    folder,
  }
}

function createCloudinarySignature(
  params: Record<string, string>,
  apiSecret: string
) {
  const serializedParams = Object.entries(params)
    .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
    .map(([key, value]) => `${key}=${value}`)
    .join("&")

  return createHash("sha1")
    .update(`${serializedParams}${apiSecret}`)
    .digest("hex")
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return unauthorizedResponse()
  }

  const formData = await request.formData()
  const file = formData.get("file")

  if (!(file instanceof File)) {
    return NextResponse.json(
      {
        message: "Selecione uma imagem para enviar.",
      },
      {
        status: 400,
      }
    )
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json(
      {
        message: "O arquivo selecionado precisa ser uma imagem.",
      },
      {
        status: 400,
      }
    )
  }

  if (file.size > MAX_IMAGE_SIZE) {
    return NextResponse.json(
      {
        message: "A imagem deve ter no máximo 5 MB.",
      },
      {
        status: 400,
      }
    )
  }

  const config = getCloudinaryConfig()

  if (!config) {
    return NextResponse.json(
      {
        message: "Credenciais do Cloudinary não configuradas.",
      },
      {
        status: 500,
      }
    )
  }

  const timestamp = Math.floor(Date.now() / 1000).toString()
  const paramsToSign = {
    folder: config.folder,
    timestamp,
  }

  const signature = createCloudinarySignature(paramsToSign, config.apiSecret)
  const bytes = Buffer.from(await file.arrayBuffer())
  const dataUri = `data:${file.type};base64,${bytes.toString("base64")}`

  const uploadFormData = new FormData()
  uploadFormData.append("file", dataUri)
  uploadFormData.append("api_key", config.apiKey)
  uploadFormData.append("timestamp", timestamp)
  uploadFormData.append("signature", signature)
  uploadFormData.append("folder", config.folder)

  const uploadResponse = await fetch(
    `https://api.cloudinary.com/v1_1/${config.cloudName}/image/upload`,
    {
      method: "POST",
      body: uploadFormData,
    }
  )

  const uploadData = await uploadResponse.json()

  if (!uploadResponse.ok) {
    return NextResponse.json(
      {
        message:
          uploadData?.error?.message ??
          "Não foi possível enviar a imagem para o Cloudinary.",
      },
      {
        status: uploadResponse.status,
      }
    )
  }

  const image = uploadData as CloudinaryUploadResponse

  return NextResponse.json({
    height: image.height,
    publicId: image.public_id,
    secureUrl: image.secure_url,
    width: image.width,
  })
}
