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

// 用户仓库操作记录表查询
export function selWarehouseOperateLog(params) {
    return request({
        url: PORT4 + "/storage/wmsBaseWarehouseOperateLog/selWarehouseOperateLog",
        method: "get",
        params,
        isShowLoading: true,
        loadMsg: 'Loading warehouse'
    });
}


// 用户仓库操作记录表新增
export function saveWarehouseOperateLog(params) {
    return request({
        url: PORT4 + "/storage/wmsBaseWarehouseOperateLog/saveWarehouseOperateLog",
        method: "get",
        params,
    });
}


