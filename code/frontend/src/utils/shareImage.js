import html2canvas from "html2canvas";

export async function shareElementAsImage(element, filename, shareText) {
  if (!element) {
    throw new Error("Nothing to share yet.");
  }

  const canvas = await html2canvas(element, {
    backgroundColor: "#1E222B",
    scale: 2,
    useCORS: true,
  });

  const blob = await new Promise((resolve) =>
    canvas.toBlob(resolve, "image/png")
  );

  if (!blob) {
    throw new Error("Couldn't generate image.");
  }

  const file = new File([blob], filename, { type: "image/png" });

  if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
    await navigator.share({
      files: [file],
      title: "SmartFit AI",
      text: shareText,
    });
    return { method: "share" };
  }

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  return { method: "download" };
}