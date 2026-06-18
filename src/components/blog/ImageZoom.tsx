"use client";

import { useBlogStore } from "@/store/blog-store";

export default function ImageZoom() {
  const { zoomImage, setZoomImage } = useBlogStore();
  if (!zoomImage) return null;
  return (
    <div
      className="image-zoom-overlay"
      onClick={() => setZoomImage(null)}
    >
      <img
        src={zoomImage}
        alt="放大图片"
        style={{
          maxWidth: "95%",
          maxHeight: "95%",
          borderRadius: "12px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
        }}
      />
    </div>
  );
}
