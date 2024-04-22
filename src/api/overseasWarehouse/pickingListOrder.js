import request from "@/utils/request";
// 前缀
import { PORT4 } from "@/api/config";
// 主页面列表
export function selPageList(params) {
    return request({
        url: PORT4 + "/storage/wmsOutboundPickingList/pageList",
        method: "get",
        params,
        isCancelToken: true
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
        isShowGlobelLoading: true
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



