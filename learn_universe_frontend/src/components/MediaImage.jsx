import { useState } from "react";
import { API_BASE_URL } from "../utils/constants.js";

export default function MediaImage({ src, kind = "course", alt = "", onError, ...props }) {
  const [failedSource, setFailedSource] = useState(null);
  const source = src?.startsWith("/media/") ? new URL(src, API_BASE_URL).href : src;
  const fallback = `/images/${kind === "avatar" ? "avatar" : "course"}-placeholder.svg`;
  return <img {...props} alt={alt} src={!source || failedSource === source ? fallback : source}
    onError={(event) => { setFailedSource(source); onError?.(event); }} />;
}
