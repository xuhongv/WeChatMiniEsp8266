var util = require('../../utils/util.js')
var { Client, Message } = require('../../utils/paho-mqtt.js')
var app =getApp();


Page({
  data: {
    userInfo: {},
    logged: false,
    takeSession: false,
    requestResult: '',
    client: null
  },
  randomString: function (len) {
    len = len || 32;
    var $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
    var maxPos = $chars.length;
    var pwd = '';
    for (let i = 0; i < len; i++) {
      pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
    }
    return pwd;
  },
  subscribe: function (filter, subscribeOptions) {
    // 订阅
    var client = this.data.client;
    if (client && client.isConnected()) {
      wx.showToast({
        title: '订阅成功'
      })
      return client.subscribe(filter, subscribeOptions);
    }
    wx.showToast({
      title: '订阅失败',
      icon: 'success',
      duration: 2000
    })
  },
  publish: function (topic, message, qos = 0, retained = false) {
    // 发布
    var client = this.data.client;
    if (client && client.isConnected()) {
      var message = new Message(message);
      message.destinationName = topic;
      message.qos = qos;
      message.retained = retained;
      wx.showToast({
        title: '发布成功'
      })
      return client.send(message);
    }
    wx.showToast({
      title: '发送失败',
      icon: 'success',
      duration: 2000
    })
  },
  setOnMessageArrived: function (onMessageArrived) {
    if (typeof onMessageArrived === 'function') {
      this.data.onMessageArrived = onMessageArrived
    }
  },
  setOnConnectionLost: function (onConnectionLost) {
    if (typeof onConnectionLost === 'function') {
      this.data.onConnectionLost = onConnectionLost
    }
  },
  doSubscribe: function () {
    this.subscribe(app.globalData.subTopic, {
      qos: 1
    })
  },
  doPublish: function () {
    this.publish(app.globalData.pubTopic, 'Hello World', 1, false)
  },
  doConnect: function () {
    var that = this;
    if (that.data.client && that.data.client.isConnected()) {
      wx.showToast({
        title: '不要重复连接'
      })
      return
    }
    var client = new Client(app.globalData.server_domain, that.randomString());

    client.connect({
      useSSL: true,
      cleanSession: true,
      keepAliveInterval: 5,
      onSuccess: function () {
        wx.showToast({
          title: '连接成功'
        })

        that.data.client = client

        client.onMessageArrived = function (msg) {
          if (typeof that.data.onMessageArrived === 'function') {
            return that.data.onMessageArrived(msg)
          }

          wx.showModal({
            title: msg.destinationName,
            content: msg.payloadString
          })
        }

        client.onConnectionLost = function (responseObject) {
          if (typeof that.data.onConnectionLost === 'function') {
            return that.data.onConnectionLost(responseObject)
          }
          if (responseObject.errorCode !== 0) {
            console.log("onConnectionLost:" + responseObject.errorMessage);
          }
        }
      }
    });
  }

})