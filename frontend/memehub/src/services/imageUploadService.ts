// Cloudinary upload utility for MemeHub frontend
// Usage: const url = await uploadImageToCloudinary(file)

export async function uploadImageToCloudinary(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  // Set your actual unsigned upload preset from Cloudinary dashboard
  formData.append("upload_preset", "ml_default"); // Replace with your preset if needed

  // Set your Cloudinary cloud name
  const cloudName = "dimvcw303";
  const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

  try {
    const response = await fetch(url, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Cloudinary upload failed: ${errorText}`);
    }

    const data = await response.json();
    if (!data.secure_url) {
      throw new Error("Upload succeeded but no URL returned");
    }

    return data.secure_url;
  } catch (err) {
    console.error("Cloudinary upload error:", err);
    throw err;
  }
}
