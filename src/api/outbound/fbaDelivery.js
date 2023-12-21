import request from "@/utils/request";
// 前缀
import { PORT4 } from "@/api/config";
const Qs = require("qs");
// 盘点列表
// export function selPageList(params) {
//     return request({
//         url: PORT4 + "/storage/wmsStorageInventoryFlow/selInventoryByLocationName",
//         method: "get",
//         params,
//     });
// }

// 扫描箱号
export function scanBoxNo(obj) {
    return request({
        url: "/yc-busi-logistics/pc/wlWarehouseAllocationCargoDetail/scanBoxNo",
        method: "post",
        data: Qs.stringify(obj)
    });
}

// 扫描配货单号
export function selectByCargoDetail(query) {
    return request({
        url:
            "/yc-busi-logistics/pc/wlWarehouseAllocationCargoDetail/selectByCargoDetail",
        method: "get",
        params: query
    });
}

// 保存批量填写尺寸
export function mainComplete(obj) {
    return request({
        url: "/yc-busi-logistics/pc/wlWarehouseAllocationCargoDetail/mainComplete",
        method: "post",
        types: "json",
        data: obj
    });
}

// 获取配货单中已处理和未处理数量
export function getAllocationDisposeNum(query) {
    return request({
        url:
            "/yc-busi-logistics/pc/wlWarehouseAllocationCargoDetail/getAllocationDisposeNum",
        method: "get",
        params: query
    });
}
// 获取指定箱子编号在配货单中已处理的箱号
export function getBoxNoByAllocationCargoNoAndBoxId(query) {
    return request({
        url:
            "/yc-busi-logistics/pc/wlWarehouseAllocationCargoDetail/getBoxNoByAllocationCargoNoAndBoxId",
        method: "get",
        params: query
    });
}

// 获取指定箱号在配货单中已处理和未处理数量
export function getAllocationDisposeNumByBoxNo(query) {
    return request({
        url:
            "/yc-busi-logistics/pc/wlWarehouseAllocationCargoDetail/getAllocationDisposeNumByBoxNo",
        method: "get",
        params: query
    });
}

// 根据配货单号查询手机端配货明细
export function getPhoneAllocationDetail(query) {
    return request({
        url:
            "/yc-busi-logistics/pc/wlWarehouseAllocationCargoDetail/getPhoneAllocationDetail",
        method: "get",
        params: query
    });
}



// 扫描配货单号(是否操作)
export function getAllocationOperationSign(query) {
    return request({
        url:
            "/yc-busi-logistics/pc/wlWarehouseAllocationCargoDetail/getAllocationOperationSign",
        method: "get",
        params: query
    });
}