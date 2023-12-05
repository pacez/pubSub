/**
 * 发布订阅事件
 */
import { showError } from 'xx/ui';

/* ========  声明区 开始 ======  */
interface IMessageEvent {
    eventCode: string; // 事件编码
    source: string; // 事件来源描述，${应用名称}【${应用ID】-${页面名称}【${pageUrD}-${触发组件名称}${触发组件id}】
    data: Record<string, any>; // 数据信息
}

//  注册事件侦听的接口声明
interface IRegisterEventListener {
    eventCode: string,
}

//  参数结构声明
interface IParams {
    key: string;
    value: any;
}

//  参数映射结构声明
interface IParamsMapping {
    form: IParams;
    to: IParams;
}

//  参数批量映射结构声明
type IParamsMappingList = IParamsMapping[]

//  发送事件配置声明
interface IPublishEventConfig {
    iframe: HTMLIFrameElement, // iframe元素
    targetOrigin?: string;  // 允许通信的域名
    targetOriginFromIframe?: boolean; // targetOrigin从iframe src中分析获取，配置后会忽略targetOrigin属性，适配特殊场景：比如会重定向的第三方页面。
}

/* ========  声明区 结束 ======  */

//  错误信息定义
const errMsg = {
    format: '消息格式不合法，缺少source信息',
    afterListener: '事件监听, 后续处理逻辑异常',
    send: '发送事件异常',
}

//  消息格式校验
function msgFormatValidator(message: IMessageEvent): boolean {
    if (Object.prototype.toString.call(message) === '[object Object]' && message.eventCode) {
        if (!message.source) {
            showError(errMsg.format);
            console.error(errMsg.format);
            return false
        }
        return true
    }
    return false
}

//  接收校验
function receiveValidator(messageEvent: MessageEvent<IMessageEvent>, eventCode: string): Boolean {
    if (msgFormatValidator(messageEvent.data) && messageEvent.data.eventCode === eventCode) {
        return true
    }
    return false
}

/**
 * 主模块：订阅事件
 */
export class RegisterEventListener {
    constructor(config: IRegisterEventListener) {
        this.config = config;
    }

    config: IRegisterEventListener | null = null;

    //  事件监听函数
    eventHandler(messageEvent: MessageEvent<IMessageEvent>) {
        try {
            if (receiveValidator(messageEvent, this.config!.eventCode)) {
                //TODO: this.parparamsMapping() // 事件参数对uiModel的映射。
                console.log('接受到消息', messageEvent.data)
            }
        } catch (e) {
            showError(errMsg.afterListener);
            console.error(errMsg.afterListener)
            console.error(e);
        }
    }

    // 初始化事件监听
    init(config: IRegisterEventListener) {
        window.addEventListener('message', this.eventHandler);
    }

    // 移除事件监听
    remove() {
        window.removeEventListener('message', this.eventHandler)
    }

    // 事件参数映射
    paramsMapping(paramsMappingList: IParamsMappingList) {
        //TODO:  把事件参数映射到uiModel上
    }

}

/**
 * 主模块：事件发布
 */
export const publishEvent = (message: IMessageEvent, config: IPublishEventConfig): void => {
    try {
        const { iframe, targetOrigin, targetOriginFromIframe } = config;
        if (msgFormatValidator(message)) {
            if (targetOriginFromIframe) {
                // targetOrigin从iframe src属性分析获取
                iframe.contentWindow?.postMessage(message, new window.URL(iframe.src).origin);
                return
            }

            if (targetOrigin) {
                iframe.contentWindow?.postMessage(message, targetOrigin)
            }
        }
    } catch (e) {
        showError(errMsg.send);
        console.error(errMsg.send);
        console.error(e);
    }
}

