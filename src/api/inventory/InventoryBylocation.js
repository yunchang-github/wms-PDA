import request from "@/utils/request";
// 前缀
import { PORT4 } from "@/api/config";

// 盘点列表
export function selPageList(params) {
    return request({
        url: PORT4 + "/storage/wmsStorageInventoryFlow/selInventoryByLocationName",
        method: "get",
        params,
    });
}


// 盘点
export function inventoryCheck(data, params) {
    return request({
        url: PORT4 + "/storage/wmsStorageInventoryFlow/check",
        method: "post",
        data,
        params,
        types: 'json',
    });
}
