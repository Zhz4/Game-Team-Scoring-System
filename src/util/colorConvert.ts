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

/**
 * 随机生成n种不重复的队伍名
 */
export function generateRandomTeams(n: number): string[] {
    const fruits =  ['苹果队', '香蕉队', '橙子队', '草莓队', '西瓜队', '葡萄队', '梨队', '柠檬队', '桃子队', '樱桃队', '菠萝队',
        '芒果队', '蜜桃队', '蓝莓队', '柚子队', '石榴队', '柚子队', '枇杷队', '杨梅队', '柿子队', '柚子队',
        '桑葚队', '枇杷队', '椰子队', '黄皮队', '乌梅队', '樱桃队', '龙眼队', '橙子队', '蓝莓队',
        '草莓队', '苹果队', '荔枝队', '柠檬队', '茄子队', '西瓜队', '菠萝队', '芒果队', '桃子队',
        '香蕉队', '柚子队', '黄皮队', '木瓜队', '甘蔗队', '黑莓队', '山竹队', '蜜桃队', '樱桃队', '杨梅队',
        '橙子队', '柚子队', '椰子队', '黄皮队', '石榴队', '柚子队', '枇杷队', '桂圆队',
        '蓝莓队', '樱桃队', '草莓队', '苹果队', '柠檬队', '茄子队', '西瓜队', '菠萝队', '芒果队',
        '桃子队', '香蕉队', '柚子队', '黄皮队', '木瓜队', '甘蔗队', '黑莓队', '山竹队', '蜜桃队', '樱桃队',
        '杨梅队', '橙子队', '柚子队', '椰子队', '黄皮队', '石榴队', '柚子队', '枇杷队',
        '桂圆队'];
    if (n > fruits.length) {
        throw new Error('生成的队伍名数量超过了水果列表的长度');
    }
    const teams=[];
    for(let i=0;i<n; i++) {
        teams.push(fruits[i])
    }
    return teams;
}
