import request from "@/utils/request";
// 前缀
import { PORT4 } from "@/api/config";

// 上架和移除
export function addAndRemove(data, params) {
    return request({
        url: PORT4 + "/storage/wmsStorageInventoryFlow/addAndRemove",
        method: "post",
        data,
        params,
        types: 'json',
    });
}
