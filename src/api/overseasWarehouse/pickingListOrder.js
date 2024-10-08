import request from "@/utils/request";
// 前缀
import { PORT4 } from "@/api/config";
// 主页面列表
export function selPageList(params) {
    return request({
        url: PORT4 + "/storage/wmsOutboundPickingList/pageList",
        method: "get",
        params,
    });
}

// 子列表
export function selPageSonList(params) {
    return request({
        url: PORT4 + "/storage/wmsOutboundPickingList/detailList",
        method: "get",
        params,
    });
}

// FBA列表完成拣货
export function FBACompletePick(data, params) {
    return request({
        url: PORT4 + "/storage/wmsOutboundPickingList/fbaCompletePick",
        method: "post",
        recordTitle: "FBA列表完成拣货",
        types: 'json',
        data,
        params,
        isShowLoading: true
    });
}


// 箱号查询信息
export function selPdaPickingListInfo(params) {
    return request({
        url: PORT4 + "/storage/wmsOutboundPickingList/selPdaPickingListInfo",
        method: "get",
        params,
        isCancelToken: true
    });
}


// pda-扫描箱子
export function pdaScanBox(data) {
    return request({
        url: PORT4 + "/storage/wmsOutboundPickingList/pdaScanBox",
        method: "post",
        data,
        types: 'json',
    });
}

// PDA-FBA-完成拣货
export function pdaFbaCompletePick(params) {
    return request({
        url: PORT4 + "/storage/wmsOutboundPickingList/pdaFbaCompletePick",
        method: "post",
        params,
        isShowLoading: true
    });
}




// 主页面列表 箱号维度
export function boxInventoryList(params) {
    return request({
        isWms: true,
        url: PORT4 + "/storage/wmsStorageInventoryFlow/boxInventoryList",
        method: "get",
        params,
    });
}


