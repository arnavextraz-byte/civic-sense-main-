import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../services/firebase";

export async function uploadReport(file) {
  try {
    const fileRef = ref(storage, `reports/${Date.now()}-${file.name || "report"}`);
    const snapshot = await uploadBytes(fileRef, file);
    const url = await getDownloadURL(snapshot.ref);
    return url;
  } catch (err) {
    console.error("Upload error:", err);
    throw err;
  }
}
