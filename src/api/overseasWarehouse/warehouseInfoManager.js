import request from "@/utils/request";
// 前缀
import { PORT4 } from "@/api/config";
// 主页面列表
export function selPageList(params) {
    return request({
        url: PORT4 + "/storage/wmsWarehouseInfo/selWmsWarehouseInfo",
        method: "get",
        params,
    });
}
