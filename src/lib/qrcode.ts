import qrcode from "qrcode-generator";

/**
 * 把一段文本渲染成二维码 dataURL。
 * 微信 Native 下单返回的 `codeUrl`、支付宝的 `payUrl` 都是「内容」不是图片地址，
 * 所以都在前端用二维码库画出来（qrcode-generator，MIT、零依赖）。
 */
export function toQrDataUrl(text: string, cellSize = 4, margin = 2) {
  const value = String(text || "").trim();
  if (!value) return "";
  try {
    const qr = qrcode(0, "M");
    qr.addData(value);
    qr.make();
    return qr.createDataURL(cellSize, margin);
  } catch {
    // 内容过长等异常：交给调用方显示「二维码生成失败」
    return "";
  }
}
