import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

const cloudName =
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

const apiKey =
  process.env.CLOUDINARY_API_KEY;

const apiSecret =
  process.env.CLOUDINARY_API_SECRET;

if (!cloudName || !apiKey || !apiSecret) {
  throw new Error(
    "Missing Cloudinary environment variables."
  );
}

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
});

export async function POST(request: Request) {
  try {
    // -----------------------------
    // Read multipart form data
    // -----------------------------

    const formData = await request.formData();

    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          error: "No image file provided.",
        },
        { status: 400 }
      );
    }

    // -----------------------------
    // Validate file
    // -----------------------------

    const maxSize = 10 * 1024 * 1024;

    if (file.size <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: "The selected image is empty.",
        },
        { status: 400 }
      );
    }

    if (file.size > maxSize) {
      return NextResponse.json(
        {
          success: false,
          error: "Image must be smaller than 10MB.",
        },
        { status: 400 }
      );
    }

    // Some browsers may report JFIF as image/jpeg.
    // We primarily validate the MIME type but also
    // allow common image extensions as a fallback.
    const fileName =
      file.name?.toLowerCase() || "";

    const isImage =
      file.type.startsWith("image/") ||
      /\.(jpg|jpeg|jfif|png|webp|avif|gif)$/i.test(
        fileName
      );

    if (!isImage) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Only JPG, JPEG, JFIF, PNG, WEBP, AVIF and GIF images are allowed.",
        },
        { status: 400 }
      );
    }

    // -----------------------------
    // Convert File → Buffer
    // -----------------------------

    const arrayBuffer =
      await file.arrayBuffer();

    const buffer = Buffer.from(arrayBuffer);

    // -----------------------------
    // Upload to Cloudinary
    // -----------------------------

    const result =
      await new Promise<{
        secure_url: string;
        public_id: string;
      }>((resolve, reject) => {
        const uploadStream =
          cloudinary.uploader.upload_stream(
            {
              folder:
                "seven-bucks/products",

              resource_type: "image",

              // Keep the original uploaded asset.
              // Optimization is applied on delivery
              // through q_auto + f_auto below.
            },

            (error, uploaded) => {
              if (error) {
                reject(error);
                return;
              }

              if (
                !uploaded ||
                !uploaded.secure_url ||
                !uploaded.public_id
              ) {
                reject(
                  new Error(
                    "Cloudinary returned an invalid upload response."
                  )
                );
                return;
              }

              resolve({
                secure_url:
                  uploaded.secure_url,

                public_id:
                  uploaded.public_id,
              });
            }
          );

        uploadStream.on(
          "error",
          (streamError) => {
            reject(streamError);
          }
        );

        uploadStream.end(buffer);
      });

    // -----------------------------
    // Optimized delivery URL
    // -----------------------------
    //
    // q_auto = automatic quality optimization
    // f_auto = automatically choose best format
    //
    // Browser can receive AVIF/WebP where supported.
    //

    const optimizedUrl =
      cloudinary.url(
        result.public_id,
        {
          secure: true,

          transformation: [
            {
              quality: "auto",
              fetch_format: "auto",
            },
          ],
        }
      );

    // -----------------------------
    // Success response
    // -----------------------------

    return NextResponse.json(
      {
        success: true,

        url: optimizedUrl,

        originalUrl:
          result.secure_url,

        publicId:
          result.public_id,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "Cloudinary upload error:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Unknown upload error.";

    return NextResponse.json(
      {
        success: false,
        error:
          `Image upload failed: ${message}`,
      },
      { status: 500 }
    );
  }
}