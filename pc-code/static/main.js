define('main', ["/supplier/partner/static/pc/page-frame", '/lib/common/cloudt/1.0.0/js/file-service'], function (require) {
  var PageFrame = require("/supplier/partner/static/pc/page-frame");
  var fsClient = require("/lib/common/cloudt/1.0.0/js/file-service");

  fsClient.setProductType("supplier");

  var mainPage = new PageFrame({
    activeMenu: '供货管理',
    init: function () {
      var me = this;
      PageFrame.prototype.init.call(this);
    }
  });
  return mainPage;
});
