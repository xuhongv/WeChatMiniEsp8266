import mqtt from '../../utils/mqtt.js';

const aliyunOpt = require('../../utils/aliyun/aliyun_connect.js')

Page({
  data: {
    client: null,
    //记录重连的次数
    reconnectCounts: 0,
    //MQTT连接的配置
    options: {
      protocolVersion: 4, //MQTT连接协议版本
      clean: false,
      reconnectPeriod: 1000, //1000毫秒，两次重新连接之间的间隔
      connectTimeout: 30 * 1000, //1000毫秒，两次重新连接之间的间隔
      resubscribe: true, //如果连接断开并重新连接，则会再次自动订阅已订阅的主题（默认true）
      clientId: '',
      password: '',
      username: '',
    },
    aliyunInfo: {
      productKey: 'a1o3SXAACTs', //阿里云连接的三元组 ，请自己替代为自己的产品信息!!
      deviceName: 'rgb2812', //阿里云连接的三元组 ，请自己替代为自己的产品信息!!
      deviceSecret: 'RurAqmlt0duwMilKv6Oa856WDcQ277Ca', //阿里云连接的三元组 ，请自己替代为自己的产品信息!!
      regionId: 'cn-shanghai', //阿里云连接的三元组 ，请自己替代为自己的产品信息!!
    }
  },
  onClick_connect: function() {

    var that = this
    //传进去三元组等信息，拿到mqtt连接的各个参数
    let clientOpt = aliyunOpt.getAliyunIotMqttClient({
      productKey: that.data.aliyunInfo.productKey,
      deviceName: that.data.aliyunInfo.deviceName,
      deviceSecret: that.data.aliyunInfo.deviceSecret,
      regionId: that.data.aliyunInfo.regionId,
      port: that.data.aliyunInfo.port,
    });
    //console.log("get data:" + JSON.stringify(clientOpt));
    //得到连接域名
    let host = 'wxs://'+clientOpt.host;
    this.setData({
      'options.clientId': clientOpt.clientId,
      'options.password': clientOpt.password,
      'options.username': clientOpt.username,
    })
    console.log("this.data.options host:" + host);
    console.log("this.data.options data:" + JSON.stringify(this.data.options));
    //开始连接
    this.data.client = mqtt.connect(host, this.data.options);
    this.data.client.on('connect', function(connack) {
      wx.showToast({
        title: '连接成功'
      })
    })
    //服务器下发消息的回调
    that.data.client.on("message", function(topic, payload) {
      console.log(" 收到 topic:" + topic + " , payload :" + payload)
      wx.showModal({
        content: " 收到topic:[" + topic + "], payload :[" + payload + "]",
        showCancel: false,
      });
    })
    //服务器连接异常的回调
    that.data.client.on("error", function(error) {
      console.log(" 服务器 error 的回调" + error)

    })
    //服务器重连连接异常的回调
    that.data.client.on("reconnect", function() {
      console.log(" 服务器 reconnect的回调")

    })
    //服务器连接异常的回调
    that.data.client.on("offline", function(errr) {
      console.log(" 服务器offline的回调")
    })
  },
  onClick_SubOne: function() {
    if (this.data.client && this.data.client.connected) {
      //仅订阅单个主题
      this.data.client.subscribe('/sys/a1o3SXAACTs/rgb2812/thing/event/property/post', function(err, granted) {
        if (!err) {
          wx.showToast({
            title: '订阅主题成功'
          })
        } else {
          wx.showToast({
            title: '订阅主题失败',
            icon: 'fail',
            duration: 2000
          })
        }
      })
    } else {
      wx.showToast({
        title: '请先连接服务器',
        icon: 'none',
        duration: 2000
      })
    }
  },
  onClick_SubMany: function() {

    if (this.data.client && this.data.client.connected) {
      //仅订阅多个主题
      this.data.client.subscribe({
        'Topic1': {
          qos: 0
        },
        'Topic2': {
          qos: 1
        }
      }, function(err, granted) {
        if (!err) {
          wx.showToast({
            title: '订阅多主题成功'
          })
        } else {
          wx.showToast({
            title: '订阅多主题失败',
            icon: 'fail',
            duration: 2000
          })
        }
      })
    } else {
      wx.showToast({
        title: '请先连接服务器',
        icon: 'none',
        duration: 2000
      })
    }
  },
  onClick_PubMsg: function() {
    if (this.data.client && this.data.client.connected) {
      this.data.client.publish('hello', 'i am  from wechat msg');
      wx.showToast({
        title: '发布成功'
      })
    } else {
      wx.showToast({
        title: '请先连接服务器',
        icon: 'none',
        duration: 2000
      })
    }
  },
  onClick_unSubOne: function() {
    if (this.data.client && this.data.client.connected) {
      this.data.client.unsubscribe('Topic1');
    } else {
      wx.showToast({
        title: '请先连接服务器',
        icon: 'none',
        duration: 2000
      })
    }
  },
  onClick_unSubMany: function() {
    if (this.data.client && this.data.client.connected) {
      this.data.client.unsubscribe(['Topic1', 'Topic2']);
    } else {
      wx.showToast({
        title: '请先连接服务器',
        icon: 'none',
        duration: 2000
      })
    }
  },
  onLoad: function() {
    wx.setNavigationBarTitle({
      title: '阿里云物联网Mqtt连接'
    })
  }
})