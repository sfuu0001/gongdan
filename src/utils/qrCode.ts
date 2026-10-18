/**
 * 二维码生成（取餐核销凭据）
 * 来源：主工程 src/utils/qrCodeEngine.ts L160-179 generateQrCodeDataUrl
 * 差异：只保留本屏用到的这一个函数，直接基于 npm 包 qrcode。
 */
import QRCode from 'qrcode';

export async function generateQrCodeDataUrl(
  text: string,
  options?: {
    width?: number;
    margin?: number;
    darkColor?: string;
    lightColor?: string;
  }
): Promise<string> {
  const opts = {
    width: options?.width || 320,
    margin: options?.margin ?? 2,
    color: {
      dark: options?.darkColor || '#000000',
      light: options?.lightColor || '#ffffff'
    },
    errorCorrectionLevel: 'M' as const
  };
  return QRCode.toDataURL(text, opts);
}
