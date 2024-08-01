import request from "@/utils/request";
// 前缀
import { PORT4 } from "@/api/config";

// 主页面列表
export function selPageList(params) {
    return request({
        url: PORT4 + "/storage/wmsInboundStockIn/pageList",
        method: "get",
        isCancelToken: true,
        params,
    });
}



// 子列表
export function selPageSonList(params) {
    return request({
        url: PORT4 + "/storage/wmsInboundStockIn/detailList",
        method: "get",
        params,
    });
}


// 签收
export function wmsInboundStockInSign(params, data) {
    return request({
        url: PORT4 + "/storage/wmsInboundStockIn/sign",
        method: "post",
        types: "json",
        params,
        data,
    });
}