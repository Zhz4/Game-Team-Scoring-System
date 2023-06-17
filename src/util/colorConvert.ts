export function rgbToHex(rgb:string) {
    // 将 RGB 格式的颜色转换成十六进制
    const hex = Number(rgb).toString(16);
    return hex.length < 2 ? "0" + hex : hex;
  }

export function fullColorHex(color:string) {
    // 将 RGB 格式的颜色转换成十六进制
    const regex = /rgba?\((\d+), (\d+), (\d+)/i;
    const matches = color.match(regex);
    if (!matches) {
      return "";
    }
    const red = rgbToHex(matches[1]);
    const green = rgbToHex(matches[2]);
    const blue = rgbToHex(matches[3]);
    return "#" + red + green + blue;
  }