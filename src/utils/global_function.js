import { Toast } from "vant";

//浮点数精度丢失   小数位过多也有可能不准确 对值进行四舍五入
// js 精度处理
function accAdd(arg1, arg2, length = 2) {//加法
    arg1 = arg1 ? arg1 : 0
    arg2 = arg2 ? arg2 : 0
    arg1 = arg1.toString(), arg2 = arg2.toString();
    let arg1Arr = arg1.split("."), arg2Arr = arg2.split("."), d1 = arg1Arr.length == 2 ? arg1Arr[1] : "", d2 = arg2Arr.length == 2 ? arg2Arr[1] : "";
    let maxLen = Math.max(d1.length, d2.length);
    let m = Math.pow(10, maxLen);
    let result = Number(((arg1 * m + arg2 * m) / m).toFixed(maxLen));
    let d = length;
    return typeof d === "number" ? Number((result).toFixed(d)) : result;
}
function Subtr(arg1, arg2, length = 2) {  // 减法
    return accAdd(arg1, -Number(arg2), length);
}
//乘法
function accMul(arg1, arg2, length = null) {
    arg1 = arg1 ? arg1 : 0
    arg2 = arg2 ? arg2 : 0
    let r1 = arg1.toString(), r2 = arg2.toString(), m, resultVal, d = length;
    m = (r1.split(".")[1] ? r1.split(".")[1].length : 0) + (r2.split(".")[1] ? r2.split(".")[1].length : 0);
    resultVal = Number(r1.replace(".", "")) * Number(r2.replace(".", "")) / Math.pow(10, m);
    return typeof d !== "number" ? Number(resultVal) : Number(resultVal.toFixed(parseInt(d)));
}
// 除法 leng 小数位长度
function accDiv(arg1, arg2, length = null) {
    arg1 = arg1 ? arg1 : 0
    arg2 = arg2 ? arg2 : 0
    let r1 = arg1.toString(), r2 = arg2.toString(), m, resultVal, d = length;
    m = (r2.split(".")[1] ? r2.split(".")[1].length : 0) - (r1.split(".")[1] ? r1.split(".")[1].length : 0);
    resultVal = Number(r1.replace(".", "")) / Number(r2.replace(".", "")) * Math.pow(10, m);
    return typeof d !== "number" ? Number(resultVal) : Number(resultVal.toFixed(parseInt(d)));
}
/**
 * @param { 复制的内容 } str 
 */
function ycCopyText(str) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(str)
        return Toast.success({
            message: "Copy success",
            position: "top",
        });
    }
    let targetId = "_hiddenCopyText_";
    let target = document.getElementById(targetId);
    if (!target) {
        target = document.createElement("textarea");
        target.style.position = "absolute";
        target.style.left = "-9999px";
        target.style.top = "0";
        target.id = targetId;
        // target.type = "text";
        document.body.appendChild(target);
    }
    target.value = str;
    target.select();
    document.execCommand("copy");
    Toast.success({
        message: "Copy success",
        position: "top",
    });
    document.body.removeChild(target);
}

// 跟据某个字段去重 累加某数值
function removeDupAndSumByKey(arr, key, needSumPropList = [], childList = []) {
    let map = new Map();
    arr.forEach((obj) => {
        if (map.has(obj[key])) {
            needSumPropList.forEach((prop) => {
                map.get(obj[key])[prop] = accAdd(
                    map.get(obj[key])[prop],
                    obj[prop]
                );
            });
            if (map.get(obj[key])['child']) {
                let childObj = {}
                childList.forEach(prop => {
                    childObj[prop] = obj[prop]
                })
                let currentArr = map.get(obj[key])['child']
                currentArr.push(childObj)
                map.set(obj[key], { ...map.get(obj[key]), child: currentArr });
            }
        } else {
            if (childList.length > 0) {
                let childObj = {}
                childList.forEach(prop => {
                    childObj[prop] = obj[prop]
                })
                map.set(obj[key], { ...obj, child: [childObj] });
            } else {
                map.set(obj[key], { ...obj });
            }

        }
    });
    return Array.from(map.values());
}

/**
 * 将方法暴露出去
 */
export default {
    accAdd,// 加
    Subtr,//减
    accMul,//乘
    accDiv,//除
    ycCopyText,// 复制内容到剪贴板
    removeDupAndSumByKey
}