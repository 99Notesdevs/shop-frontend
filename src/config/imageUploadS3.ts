import {env} from "../config/env";
export const uploadImageToS3 = async (formData: FormData, folder: string, name?: string): Promise<string | null> => {

  const params = new URLSearchParams();
  params.set("folder", folder);
  if (name) params.set("name", name);

  const res = await fetch(`${env.API_MAIN}/aws/upload-image?${params.toString()}`,{
    method: 'POST',
    credentials:"include",
    body: formData
  });
  const typedRes =await res.json() as { success: boolean; data: string };
  if (!typedRes.success) return null;

  const data = typedRes.data;
  return data || null;
};