
Page({
  onClick_Simple: function() {
    wx.navigateTo({
      url: '../simpleDemo/simple',
    })
 
  },
  onClick_Aliyun: function() {
    wx.navigateTo({
      url: '../aliyunDemo/aliyunIot',
    })
  }
})