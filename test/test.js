const {
    createWorker
} = require('tesseract.js');
const path = require('path');
const axios = require('axios');
const fs = require('fs');

const worker = createWorker({
    langPath: path.join(__dirname, '..', 'lang-data'),
    logger: m => console.log(m),
});

(async () => {
    await (await worker).load();
    await (await worker).loadLanguage('eng'); // 将语言设置为英语
    await (await worker).initialize('eng'); // 将语言设置为英语
    let res = await axios.get('https://ecard.mva.gov.cn:18443/cert/pc/api/common/getCheckCode') // 发送请求获取验证码
    let base64 = res.data.data.base64
    base64 = base64.replace(/^data:image\/\w+;base64,/, ""); // 去除base64前面的 data:image/jpg;base64
    const dataBuffer = Buffer.from(base64, 'base64'); // 将base64转成 Buffer
    fs.writeFile('./aaaa.jpg', dataBuffer, async function (err) { //用fs写入文件
        if (err) {
            console.log(err);
        } else {
            const {
                data: {
                    text
                }
            } = await (await worker).recognize(path.join(__dirname, './aaaa.jpg')); // 识别图片
            console.log(text); // 打印读取结果
            await (await worker).terminate();
        }
    })
})()


// 快速排序
function quickSort(arr) {
    if (arr.length <= 1) {
        return arr;
    }
    let left = [],
        right = [],
        mid = arr.splice(0, 1);
    for (let i = 0; i < arr.length; i++) {
        if (arr[i] < mid) {
            left.push(arr[i])
        } else {
            right.push(arr[i])
        }
    }
    return quickSort(left).concat(mid, quickSort(right))
}
