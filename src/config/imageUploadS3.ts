import {env} from "../config/env";
export const uploadImageToS3 = async (formData: FormData, folder: string, name?: string): Promise<string | null> => {

  const res = await fetch(`${env.API_MAIN}/aws/upload-image?folder=${folder}&name=${name}`,{
    method: 'POST',
    credentials:"include",
    body: formData
  });
  const typedRes =await res.json() as { success: boolean; data: string };
  if (!typedRes.success) return null;

  const data = typedRes.data;
  return data || null;
};