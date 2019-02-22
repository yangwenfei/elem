function getCookie(c_name) {
  if (document.cookie.length > 0) {
    c_start = document.cookie.indexOf(c_name + "=");
    if (c_start != -1) {
      c_start = c_start + c_name.length + 1;
      c_end = document.cookie.indexOf(";", c_start);
      if (c_end == -1)
        c_end = document.cookie.length;
      return unescape(document.cookie.substring(c_start, c_end));
    }
  }
  return "";
}

function setCookie(c_name, value, expiredays) {
  var exdate = new Date();
  exdate.setDate(exdate.getDate() + expiredays);
  document.cookie = c_name + "=" + escape(value) + ((expiredays == null) ? "" : ";expires=" + exdate.toGMTString()) +
    ";path=/";
}
define(function (require) {

  var rootUrlCookie = getCookie('rootURL');
  var productCodeCookie = getCookie('productCode');
  if (rootUrlCookie && rootUrlCookie != '') {
    $.cookie('rootURL', rootUrlCookie);
  }
  if (productCodeCookie && productCodeCookie != '') {
    localStorage.setItem('productCode', getCookie('productCode'));
    $.cookie('productCode', getCookie('productCode'));
  }
  var cloudt_product_app_id = getCookie('cloudt_product_app_id');
  var cloudt_product_org_id = getCookie('org');
  var hiddenProperty = 'hidden' in document ? 'hidden' : 'webkitHidden' in document ? 'webkitHidden' : 'mozHidden' in document ? 'mozHidden' : null;
  var visibilityChangeEvent = hiddenProperty.replace(/hidden/i, 'visibilitychange');
  var onVisibilityChange = function () {
    if (!document[hiddenProperty]) {
      console.log('页面激活---appId:' + cloudt_product_app_id + ';orgId cookie:' + cloudt_product_org_id);
      setCookie('cloudt_product_app_id', cloudt_product_app_id);
      setCookie('org', cloudt_product_org_id);
      $.ajax({
        url: '/product/app/' + cloudt_product_app_id + '?orgId=' + cloudt_product_org_id,
        type: "PUT",
        async: false
      });
    } else {
      console.log('页面激活---appId:' + cloudt_product_app_id + ';orgId cookie:' + cloudt_product_org_id);
    }
  }
  document.addEventListener(visibilityChangeEvent, onVisibilityChange);


  var View = require('Sparrow/View'),
    ListView = require('Sparrow/ListView'),
    Tree = require('Sparrow/TreeView'),
    formHelper = require('Sparrow/formHelper'),
    ajax = require('Sparrow/ajax'),
    Dialog = require('Sparrow/ModalDialog');

  //自动加载地图需要的js
  var initMap = function () {
    if (!window.AMap && !window.mapJSLoaded) {
      $.getScript('https://cache.amap.com/lbs/static/es5.min.js').done(function () {
        $.getScript('https://webapi.amap.com/maps?v=1.3&key=802147d1e3b4dd75577bb5f3587d609c&plugin=AMap.MarkerClusterer').done(function () {
          window.mapJSLoaded = true;
          setTimeout(function () {
            initMap();
          }, 50);
        });
      });
    } else if (!window.AMap) {
      setTimeout(function () {
        initMap();
      }, 50);
    } else {
      if (!window.geocoder) {
        AMap.service('AMap.Geocoder', function () {
          window.geocoder = new AMap.Geocoder(); //实例化Geocoder
        });
      }
    }
  };

  initMap();

  var productData = $.cookie('productData') ? JSON.parse($.cookie('productData')) : null;

  var encrypt = function (data) {
    var o = new Date().getTime();
    var a = Math.round(Math.random() * 14) + 1;
    var s = o + '#|,|#' + data;
    var len = s.length;
    var buf = '';
    for (var i = 0; i < len; i++) {
      var x = (s.charCodeAt(i) ^ a).toString(16);
      if (x.length == 1)
        x = '000' + x;
      else if (x.length == 2)
        x = '00' + x;
      else if (x.length == 3)
        x = '0' + x;
      buf += x;
    }
    return a.toString(16) + buf;
  };

  var setCaption = function () {
    var smsButton = $('.btn-info')[0];
    window.smsCounter--;
    smsButton.innerHTML = window.smsCounter + '秒后重新获取';
    if (window.smsCounter < 1) {
      clearInterval(window.smsTimer);
      window.smsTimer = null;
      smsButton.innerHTML = '获取验证码';
      smsButton.disabled = '';
    }
  }

  var appendShim = function (el, h) {
    var shim = $('#ifr_shim');

    if (shim.length > 0) {
      shim.height(h);
      shim.appendTo(el);
    }
  }

  function createHeader() {
    var dlgChangePwd = new Dialog({
      width: '500px',
      height: '200px',
      bodyContentUrl: View.resolveHtmlUrl(require, '/html/frame/change-pwd.html'),
      footerHTML: '<button type="button" class="btn btn-ok btn-success">确定</button>' + '<button type="button" class="btn btn-cancel btn-default" data-dismiss="modal">取消</button>',
      title: '修改密码',
      listeners: [
        //确定
        ['click', '.btn-success',
          function (event, elm, dlg) {
            //检测新密码与确认密码是否相同，不同则提示
            if (formHelper.verify(dlg.element) === false) return false;
            var newPassword = $('.lbr-user-info-new-pwd').val();
            var newPasswordConfirm = $('.lbr-user-info-new-pwd-again').val();
            if (newPassword != newPasswordConfirm) {
              //退出登录
              Dialog.showMessage({
                title: '警告',
                message: '新密码与确认密码不相同。'
              });
              return;
            }
            //修改密码
            ajax.request({
              url: '/pmpp/services/user/change-pwd?old=' + encrypt($('.lbr-user-info-old-pwd').val()) + '&new=' + encrypt(newPassword),
              success: function (result) {
                dlg.hide();
                Dialog.showMessage({
                  title: '成功',
                  message: '密码修改成功。'
                });
              }
            });
          }
        ]
      ],
      showDialog: function (o) {
        this.setTitle(o.title);
        $('.lbr-user-info-old-pwd,.lbr-user-info-new-pwd,.lbr-user-info-new-pwd-again').val('');
        this.show();
        appendShim(this.contentElm, 320);
      }
    });

    var dlgCodeLogin = new Dialog({
      width: '380px',
      height: '270px',
      bodyContentUrl: View.resolveHtmlUrl(require, '/html/frame/code.html'),
      footerHTML: '<button type="button" class="btn btn-cancel btn-default" data-dismiss="modal">关闭</button>',
      title: 'APP扫码登录',
      showDialog: function (o) {
        this.setTitle(o.title);
        this.get("#image-login-code").attr("src", "/identity/qrcode.img?v=" + (new Date().getTime()));
        this.show();
        appendShim(this.contentElm, 380);
      },
      listeners: [
        //点击修改手机号
        ['click', '.code-refresh',
          function (event, elm, dlg) {
            dlg.get("#image-login-code").attr("src", "/identity/qrcode.img?v=" + (new Date().getTime()));
          }
        ]
      ]
    });
    var dlgUserInfo = new Dialog({
      width: '500px',
      height: '250px',
      bodyContentUrl: View.resolveHtmlUrl(require, '/html/frame/user-info.html'),
      footerHTML: '<button type="button" class="btn btn-ok btn-success">确定</button>' + '<button type="button" class="btn btn-cancel btn-default" data-dismiss="modal">取消</button>' + '<button type="button" class="btn btn-danger btn-change-phone" style="display:none">更换手机号</button>' + '<button type="button" class="btn btn-default btn-return" style="display:none">返回</button>',
      title: '个人设置',
      listeners: [
        //点击修改手机号
        ['click', '.btn-user-info-edit-phone',
          function (event, elm, dlg) {
            dlg.get('.lbr-user-info-new-phone').val('');
            dlg.get('.lbr-sms-code').val('');
            dlg.get('.lbr-user-info-main-view,.btn-success,.btn-cancel').css('display', 'none');
            dlg.get('.lbr-user-info-edit-phone,.btn-change-phone,.btn-return').css('display', '');
          }
        ],
        //获取验证码
        ['click', '.btn-info',
          function (event, elm, dlg) {
            if (formHelper.verify('.lbr-user-info-mobile') === false) return false;

            if ($('.lbr-user-info-orgin-phone')[0].innerHTML == $('.lbr-user-info-new-phone').val()) {
              Dialog.showMessage({
                title: '提示',
                message: '新手机号与旧手机号不能相同。'
              });
              return;
            }

            ajax.request({
              url: '/user/mobile/verifyCode?mobile=' + $('.lbr-user-info-new-phone').val(),
              success: function (result) {
                window.smsIndex = result;
                $('.btn-info')[0].disabled = 'disabled';
                window.smsCounter = 60;
                window.smsTimer = setInterval(setCaption, 1000);
              }
            });
          }
        ],
        //返回
        ['click', '.btn-return',
          function (event, elm, dlg) {
            dlg.get('.lbr-user-info-main-view,.btn-success,.btn-cancel').css('display', '');
            dlg.get('.lbr-user-info-edit-phone,.btn-change-phone,.btn-return').css('display', 'none');
          }
        ],
        //更改手机号
        ['click', '.btn-change-phone',
          function (event, elm, dlg) {
            if (formHelper.verify(dlg.element) === false) return false;

            if ($('.lbr-user-info-orgin-phone')[0].innerHTML == $('.lbr-user-info-new-phone').val()) {
              Dialog.showMessage({
                title: '提示',
                message: '新手机号与旧手机号不能相同。'
              });
              return;
            }

            if (!window.smsIndex) {
              Dialog.showMessage({
                title: '提示',
                message: '请先获取手机验证码。'
              });
              return;
            }

            var index = window.smsIndex;
            ajax.request({
              url: '/user/mobile/' + dlg.userId + '?mobile=' + $('.lbr-user-info-new-phone').val() + '&key=' + index + '&verifyCode=' + $('.lbr-sms-code').val(),
              success: function (result) {
                window.smsIndex = null;
                $('.lbr-user-info-orgin-phone')[0].innerHTML = $('.lbr-user-info-new-phone').val();
                $('.lbr-user-info-phone')[0].innerHTML = $('.lbr-user-info-new-phone').val();
                dlg.get('.lbr-user-info-main-view').css('display', '');
                dlg.get('.lbr-user-info-edit-phone').css('display', 'none');
                dlg.get('.btn-success').css('display', '');
                dlg.get('.btn-cancel').css('display', '');
                dlg.get('.btn-change-phone').css('display', 'none');
                dlg.get('.btn-return').css('display', 'none');
                Dialog.showMessage({
                  title: '成功',
                  message: '手机号修改成功。'
                });
              }
            });
          }
        ],
        //确定
        ['click', '.btn-success',
          function (event, elm, dlg) {
            if ($.cookie('tenantManager') == 'true') {
              var phone = $('.lbr-user-info-link-tel').val();
              if ($.trim(phone)) {
                if (!mobileIsValid($.trim(phone))) {
                  Dialog.showHint('请输入有效的11位手机号码。', 'red-bg');
                  return false;
                }
              }
              ajax.request({
                url: '/user/mobile/' + dlg.userId + '?mobile=' + phone,
                success: function (result) {
                  dlg.hide();
                  Dialog.showMessage({
                    title: '成功',
                    message: '管理员信息修改成功。'
                  });
                }
              });
            } else {
              var data = dlg.getData();
              var name = $('.lbr-lbr-user-info-name').val();
              if (!$.trim(name)) {
                Dialog.showHint('真实姓名 不能为空。', 'red-bg');
                return false;
              }
              ajax.request({
                url: '/user/user/name?userId=' + dlg.userId + '&name=' + name,
                data: data,
                success: function (result) {
                  dlg.hide();
                  header.get('.userName').html(data.name);
                  Dialog.showMessage({
                    title: '成功',
                    message: '用户信息修改成功。'
                  });
                }
              });
            }
          }
        ]
      ],
      showDialog: function (o) {
        var me = this;
        this.setTitle(o.title);
        ajax.request({
          url: '/pmpp/services/user/current',
          success: function (result) {
            me.userId = result.id;
            if (window.userType > 0) {
              $('.group-sex').css('display', 'none');
            }
            if ($.cookie('tenantManager') == 'true') {
              $('.btn-user-info-edit-phone').css('display', 'none');
              $('.lbr-name').html('帐户名称');
              $('.lbr-lbr-user-info-name').attr('disabled', true);
              $('.group-sex').css('display', 'none');
              $('.group-link-tel').css('display', '');
            }
            me.get('.lbr-user-info-new-phone').val('');
            me.get('.lbr-sms-code').val('');
            me.get('.lbr-user-info-main-view,.btn-success,.btn-cancel').css('display', '');
            me.get('.lbr-user-info-edit-phone,.btn-change-phone,.btn-return').css('display', 'none');
            $('.lbr-user-info-orgin-phone')[0].innerHTML = (result.phone.length == 11) ? result.phone : '未绑定';
            $('.lbr-user-info-phone')[0].innerHTML = ($.cookie('tenantManager') == 'true') ? result.account : ((result.phone.length == 11) ? result.phone : '未绑定');
            $('.lbr-lbr-user-info-name').val(result.name);
            $('.lbr-user-info-link-tel').val(result.phone);
            me.show();
            appendShim(me.contentElm, 370);
          }
        });
      },
      getData: function () {
        var result = {
          name: $('.lbr-lbr-user-info-name').val(),
          gender: 1
        };
        return result;
      }
    });
    var dlgSelectProject = new Dialog({
      width: (((document.body.scrollWidth > 1200) ? 1200 : document.body.scrollWidth) - 200) + 'px',
      height: ((document.body.scrollHeight == 0) ? 700 : (document.body.scrollHeight - 200)) + 'px',
      bodyContentUrl: View.resolveHtmlUrl(require, '/html/frame/select-project.html'),
      title: '地图导航',
      showDialog: function (o) {
        var me = this;
        me.show();
        me.projects = o.projects;

        var markers = [];
        var processMarker = function () {
          for (var i = 0; i < me.projects.length; i++) {
            var marker = new AMap.Marker({
              position: [me.projects[i].longitude, me.projects[i].latitude],
              //title: me.projects[i].name,
              title: '',
              extData: me.projects[i].orgId,
              map: me.map
            });
            marker.setLabel({
              offset: new AMap.Pixel(15, 15),
              content: me.projects[i].name
            });
            AMap.event.addListener(marker, 'click', me._selectProject);
            markers.push(marker);
          }
          new AMap.MarkerClusterer(me.map, markers, {
            gridSize: 80
          });
          me.map.setZoomAndCenter(4, [105, 34]);
        };

        if (!me.map) {
          me._selectProject = function (e) {
            var orgId = e.target.getExtData();

            var findRec = function (parent) {
              if (parent.id == orgId) {
                return parent;
              } else if (parent && parent.childNodes) {
                for (var i = 0; i < parent.childNodes.length; i++) {
                  var rec = findRec(parent.childNodes[i]);
                  if (rec) {
                    return rec;
                  }
                }
                return null;
              } else {
                return null;
              }
            }

            var rec = findRec(header.orgTree.model.items[0]);
            $.cookie('bureau', rec.bureau === true ? 1 : 0);
            $.cookie('refer', rec.refer === true ? 1 : 0);
            me.hide();
            //window.location.href = $.cookie('rootURL') + 'index.jsp?orgId=' + rec.id + '&ts=' + new Date().getTime();
            ajax.request({
              url: '/org/projects?id=' + rec.projectId,
              success: function (result) {
                dlgProjectInfo.showDialog(result[0], "true");
              }
            });
          };
          me.map = new AMap.Map('project-select-map', {
            resizeEnable: true,
            center: [105, 34],
            zoom: 4
          });
          processMarker();
        } else {
          processMarker();
        }
      }
    });
    var orgIdTemp = null;
    var dlgProjectInfo = new Dialog({
      width: (((document.body.scrollWidth > 1200) ? 1200 : document.body.scrollWidth) - 200) + 'px',
      height: ((document.body.scrollHeight == 0) ? 700 : (document.body.scrollHeight - 200)) + 'px',
      bodyContentUrl: View.resolveHtmlUrl(require, '/html/frame/project-info.html'),
      title: '项目信息',
      showDialog: function (project, flag) {
        orgIdTemp = project.orgId;
        if (flag) {
          $("#menu-button").remove();
          $(".div-info").parent().parent().prepend('<div id="menu-button"><button id="menu-button-back" type="button" class="btn btn-default btn-xs" data-dismiss="modal">返回</button><button id="menu-button-enter-project000" type="button" style="float: right;" class="btn btn-primary btn-xs" data-dismiss="modal">进入项目</button></div>');

          $("#menu-button-back").click(function () {
            //alert("111111111111111");
            /*ajax.request({
                     url: '/org/org-projects?orgId=' + $.cookie("org") + '&productCode=' + $.cookie("appName"),
                     success: function (result) {
                         dlgSelectProject.showDialog({
                           projects: result
                         });
                     }
                   });*/
            dlgSelectProject.show();
          });
          $("#menu-button-enter-project000").click(function () {
            //alert("fffffffff-");
            window.location.href = $.cookie('rootURL') + 'index.jsp?orgId=' + orgIdTemp + '&ts=' + new Date().getTime();
          });
        }

        var formatDate = function (value) {
          var month = value.getMonth() + 1;
          var day = value.getDate();
          return value.getFullYear() + '-' +
            (month < 10 ? '0' + month : month) + '-' +
            (day < 10 ? '0' + day : day);
        }

        var me = this;
        var dataFields = $('.span-data');
        for (var i = 0; i < dataFields.length; i++) {
          var classList = $(dataFields[i]).attr('class').split(' ');
          if (classList.length == 2) {
            var prop = classList[1].replace('span-', '');
            if (prop == 'constructStatus') {
              $(dataFields[i]).text(project.constructStatus == 3 ? '竣工' : (project.constructStatus == 2 ? '停工' : (project.constructStatus == 1 ? '在建' : '未开工')));
            } else if ((prop == 'planStart') || (prop == 'planEnd')) {
              $(dataFields[i]).text(project[prop] ? formatDate(new Date(project[prop])) : '-');
            } else if (prop == 'caleDate') {
              $(dataFields[i]).text((project.planStart && project.planEnd) ? (Math.ceil(((project.planEnd - project.planStart) / 86400000) + 1)) : '');
            } else if (prop == 'actualStart') {
              $(dataFields[i]).text(project.actualStart ? formatDate(new Date(project.actualStart)) : '-');
            } else if (prop == 'constructPurpose' || prop == 'structType' || prop == 'area') {
              $(dataFields[i]).text(project[prop] ? project[prop] : '-');
              var tag = $('.span-' + prop).parent();
              tag.hide();
              var constructType = project.constructType;
              if (constructType === "房建") {
                tag.show();
              } else if ((constructType === "市政" || constructType === "安装" || constructType === "装饰") && prop == 'constructPurpose') {
                tag.show();
              }
            } else {
              $(dataFields[i]).text(project[prop] ? project[prop] : '-');
            }
          }
        }
        //添加项目管理人员和扩展属性
        $('.div-manager-data').html('');
        if (project.managers && project.managers.length > 0) {
          var htmlContent = '';
          for (var i = 0; i < project.managers.length; i++) {
            htmlContent += '<div style="padding: 6px 0px"><span class="section-name" style="padding-left: 16px;">' + project.managers[i].duty + '</span>' +
              '<span class="span-data" style="padding-left: 16px;">' + project.managers[i].name + '</span></div>'
          }
          $('.div-manager-data').html(htmlContent);
          $('.div-manager').show();
        } else {
          $('.div-manager').hide();
        }

        $('.div-extend-data').html('');
        if (project.extendFields && project.extendFields.length > 0) {
          var htmlContent = '';
          for (var i = 0; i < project.extendFields.length; i++) {
            htmlContent += '<div style="padding: 6px 0px"><span class="section-name" style="padding-left: 16px;">' + project.extendFields[i].caption + '</span>' +
              '<span class="span-data" style="padding-left: 16px;word-wrap: break-word;">' + project.extendFields[i].value + '</span></div>'
          }
          $('.div-extend-data').html(htmlContent);
          $('.div-extend-data').css("width", "310px").css("float", "right");
          $('.div-extend').show();
        } else {
          $('.div-extend').hide();
        }

        $('.section-name').css('display', 'inline-block').css('overflow', 'hidden').css('width', '80px').css('font-weight', '600').css('color', '#777').css('vertical-align', 'bottom').css('word-wrap', 'break-word');
        me.show();
        if (project.longitude === 0.0 && project.latitude === 0.0 && !project.location) {
          return;
        }

        var showMarker = function () {
          var _innerShowMarker = function () {
            var marker = new AMap.Marker({
              position: [project.longitude, project.latitude],
              title: project.name,
              map: me.map
            });
            me.map.setCenter([project.longitude, project.latitude]);
          }

          var setPosition = function () {
            geocoder.getLocation(project.location, function (status, result) {
              if (status === 'complete' && result.info === 'OK') {
                var geocode = result.geocodes[0];
                project.longitude = geocode.location.getLng();
                project.latitude = geocode.location.getLat();
                _innerShowMarker();
              }
            });
          };

          if (project.longitude === 0.0 && project.latitude === 0.0) {
            setPosition();
          } else {
            _innerShowMarker();
          }
        };

        if (!me.map) {
          me.map = new AMap.Map('project-site', {
            resizeEnable: true,
            zoom: 13
          });
          showMarker();
        } else {
          showMarker();
        }
      }
    });
    // var ztree = require('/lib/3rd/tree/jquery.ztree.core.min.js');

    var _orgTree;
    var header = new View({
      element: '.ct-page-header',
      contentUrl: (productData && productData.contentUrl) ? productData.contentUrl : '/html/frame/header.html',
      renderContent: function () {
        var me = this;
        if (!me.showed) {
          me.showed = true;

          $("head").append("<link>");
          var css = $("head").children(":last");
          css.attr({
            rel: "stylesheet",
            type: "text/css",
            href: "/css/style.css"
          });

          $("head").append("<link>");
          var zTreeStyle = $("head").children(":last");
          zTreeStyle.attr({
            rel: "stylesheet",
            type: "text/css",
            href: "/lib/3rd/tree/css/zTreeStyle/zTreeStyle.css"
          });

          $("head").append("<link>");
          var iconfont = $("head").children(":last");
          iconfont.attr({
            rel: "stylesheet",
            type: "text/css",
            href: "/lib/3rd/tree/css/iconFont/iconfont.css"
          });

        }
        $(this.element).addClass('navbar navbar-default ct-box-shadow-small');
        if (!productData || !productData.hideOrgTree) {
          this.orgTree = new Tree({
            element: this.getOne('.lbr-change-project'),
            itemTemplate: '<li><a class="text-overflow" title="{{item.name}}" style="cursor: pointer;{{if item.active}}color:#006DFF;' +
              '{{else if !item.canSelect}}cursor:not-allowed;color:#aaaaaa;{{/if}}' +
              'white-space: nowrap; padding: 10px 0 10px {{item.__level * 20 + 10}}px;width:100%;">' +
              '<span class="glyphicon glyphicon-{{if (item.type==1)}}{{if item.refer}}{{if item.tagId==3}}paperclip{{else}}link{{/if}} node-ref {{if item.active}}active{{/if}}{{else}}' +
              '{{if item.tagId==3}}asterisk{{else}}{{if item.tagId==2}}tags{{else}}flag{{/if}}{{/if}}{{/if}}{{else}}folder-open{{/if}}" {{if item.type==1}}style="color:#ea8010;"{{/if}}></span>' +
              '<span>{{item.name}}</span></a></li>',
            canSelect: true,
            itemSelector: 'li',
            service: {
              load: function (callback) {
                // ajax.request({
                //   url: '/pmpp/services/org/navigate-org-tree',
                //   success: function (result) {
                //     if ($.isArray(result)) {
                //       var setActive = function (node) {
                //         var refer = parseInt($.cookie('refer'));
                //         if (node.id == $.cookie("org")) {
                //           // if(node.type==1 && refer==true && !!!node.refer||(refer!=true && !!node.refer)) return;
                //           node.active = true;
                //           $('.lbr-cur-project-name').html(node.name);
                //         } else if (node.childNodes) {
                //           for (var i = 0; i < node.childNodes.length; i++) {
                //             setActive(node.childNodes[i]);
                //           }
                //         }
                //       }

                //       for (var i = 0; i < result.length; i++) {
                //         setActive(result[i]);
                //       }

                //       _orgTree = result;
                //       callback(result);
                //       me.appendFilterInput();

                //       var prjStatus = localStorage.getItem('prj_status_filter');
                //       var tenantName = localStorage.getItem('tenantName');

                //       if (prjStatus && prjStatus.indexOf(tenantName + '#$#') == 0 && $.cookie('appName').indexOf('inspection') == -1) {
                //         prjStatus = prjStatus.split('#$#')[1];
                //         var status = prjStatus.split(',');

                //         // if(status.length>0){
                //         //     $('.filter-prj_status input').each(function(i,item){
                //         //         item.checked=false;
                //         //         if(status.indexOf(item.getAttribute('data-v'))!=-1){
                //         //             item.checked=true;
                //         //         }});
                //         //     filterTreeByProjectStatus();
                //         // }
                //       }
                //     }
                //   }
                // });
              }
            }
          });
          this.orgTree.on('beforeselect', function (elm, rec) {
            if (!rec.canSelect || rec.active) return false;
          }).on('itemselect', function (elm, rec) {
            $.cookie('bureau', rec.bureau === true ? 1 : 0);
            $.cookie('refer', rec.refer === true ? 1 : 0);
            window.location.href = $.cookie('rootURL') + 'index.jsp?orgId=' + rec.id + '&ts=' + new Date().getTime();
          });
          this.initOrgItemEvent(this.orgTree);

          $('.nav-menu-item-more,.ct-page-header .dropdown').on('shown.bs.dropdown', function (e) {
            var el = arguments[0].target.children[1],
              sh = el.scrollHeight,
              h = $(el).height(); //用offsetHeight可能比较大

            appendShim(el, sh > h ? sh : h);
          });

          this.orgList = new ListView({
            element: document.querySelector('.list-org_nav'),
            itemSelector: 'li',
            emptyTemplate: '<li class="ct-list-empty">{{emptyText}}</li>',
            itemTemplate: '<li><a class="text-overflow" style="cursor: pointer;{{if item.active}}color:#006DFF;' +
              '{{else if !item.canSelect}}cursor:not-allowed;color:#aaaaaa;{{/if}}' +
              'white-space: nowrap;padding: 10px 0 10px 10px;width:100%;">' +
              '{{if item.type!=-1}}<span class="glyphicon glyphicon-{{if item.type==1}}{{if item.refer}}link{{if item.active}} active{{/if}}{{else}}' +
              'flag{{/if}}{{else}}folder-open{{/if}}" {{if item.type==1}}style="color:#ea8010;{{/if}}"></span>{{/if}}' +
              '<span title="{{item.name}}">{{item.name}}</span><span title="{{item.parentName}}" style="float:right;margin-right:10px;color:#aaa;">{{item.parentName}}</span></a></li>',
            canSelect: true,
            paging: false
          });

          this.initOrgItemEvent(this.orgList);
        }

        var self = this;
        this.on('click', '.nav-tree_filter', function (e) {
          e.stopPropagation();
          var target = $(e.target || e.srcElement),
            divFilters = $('.filter-prj_status');

          if (target.hasClass('active')) {
            target.removeClass('active');
            divFilters.removeClass('active');
            self.orgTree.model.load(_orgTree);
          } else {
            target.addClass('active');
            divFilters.addClass('active');
            filterTreeByProjectStatus();
          }
        });
        this.on('click', '.project-overview-product', function () {
          window.open('/system-management/project-overview-product-page');
        });

        var getPrjStatusFilter = function () {
          var status = '';
          $('.filter-prj_status input:checked').each(function (i, item) {
            if (status == '') {
              status += item.getAttribute('data-v');
            } else {
              status = status + ',' + item.getAttribute('data-v');
            }

          })
          if ($('.filter-prj_status input:checked').length === 3) {
            status = 'PREPARE,BUILDING,STOP,FINISH';
          }
          return status;
        }

        var filterTreeByProjectStatus = function (e) {
          if (e) e.stopPropagation();

          if (_orgTree && _orgTree.length > 0) {
            var filterData = JSON.parse(JSON.stringify(_orgTree[0]));
            var status = getPrjStatusFilter();

            var syncFilter = function () {
              var ev = document.createEvent('Events');
              ev.initEvent('keyup', false, true);
              ev.keyCode = 13;
              // document.querySelector('.input-org_filter').dispatchEvent(ev);
            }

            if (status.length == 0) {
              self.orgTree.model.load([]);
            } else if (status.length == 3) {
              self.orgTree.model.load([filterData]);
            } else {
              walkTree4Filter(filterData, status);
              if (filterData.type == 0 && (!filterData.childNodes || filterData.childNodes.length == 0)) {
                self.orgTree.model.load([]);
              } else {
                self.orgTree.model.load([filterData]);
              }
            }

            syncFilter();
          }

          var prj_status = localStorage.getItem('tenantName') + '#$#' + status.join(',');
          localStorage.setItem('prj_status_filter', prj_status);
        }

        var walkTree4Filter = function (node, status) {
          var childNodes = node.childNodes;

          if (childNodes && childNodes.length > 0) {
            for (var i = childNodes.length - 1; i >= 0; i--) {
              if (!walkTree4Filter(childNodes[i], status)) {
                childNodes.splice(i, 1);
              }
            }
          }

          if (node.projectId && status.indexOf(node.projectStatus) == -1) {
            return false;
          } else if (node.type == 0 && (!node.childNodes || node.childNodes.length == 0)) {
            return false;
          }

          return true;
        }

        // this.on('click','.filter-prj_status input',filterTreeByProjectStatus);
        // this.on('click','.filter-prj_status span',function(e){
        //   e.stopPropagation();
        //   var target=e.target||e.srcElement;
        //   var chkBox=target.children[0];
        //   chkBox.checked= !chkBox.checked;
        //   filterTreeByProjectStatus()
        // });

        // 头部加载树
        var ztree = require('/lib/3rd/tree/jquery.ztree.core.min.js');

        var productCode = window.sessionStorage.getItem("productCode") && window.sessionStorage.getItem("productCode") != '' ? window.sessionStorage.getItem("productCode") : $.cookie('appName');
        productCode = productCode && productCode != '' ? productCode : $.cookie('appName');
        var initTree = function (projectStatus, type, fetchNum) {
          var zTreeObj;

          function url() {
            return '/org/list;parent?project_status=' + projectStatus + '&product_code=' + productCode;
          }
          var setting = {
            view: {
              dblClickExpand: false,
              showLine: false,
              showIcon: true,
              addDiyDom: function (treeId, treeNode) {
                var aObj = $("#" + treeNode.tId + "_a");
                if (!treeNode.canSelect) {
                  aObj.css('cursor', 'not-allowed').css('color', '#ccc');
                }
              }
            },
            async: {
              enable: true,
              contentType: 'application/x-www-form-urlencoded',
              dataType: 'json',
              type: 'get',
              url: url(),
              autoParam: ["id=parent_id"],
              otherParam: {
                bureau: 1,
              },

              dataFilter: function (treeId, parentNode, responseData) {
                if (responseData.data) {
                  for (var i in responseData.data) {
                    if (responseData.data[i].type == 0) {
                      responseData.data[i].icon = '/lib/3rd/tree/css/iconFont/wenjian.png';
                    } else if (responseData.data[i].type == 1) {
                      if (responseData.data[i].bureau == true) {
                        if (responseData.data[i].tagId == 3) {
                          responseData.data[i].icon = '/lib/3rd/tree/css/iconFont/fujian.png';
                        } else {
                          responseData.data[i].icon = '/lib/3rd/tree/css/iconFont/guanlian.png';
                        }
                      } else {
                        if (responseData.data[i].tagId == 1) {
                          responseData.data[i].icon = '/lib/3rd/tree/css/iconFont/flag.png';
                        } else {
                          responseData.data[i].icon = '/lib/3rd/tree/css/iconFont/taiyang.png';
                        }
                      }
                    }
                  }
                  return responseData.data;
                }
              }
            },
            data: {
              simpleData: {
                enable: true,
                idKey: "id",
                pIdKey: "parentId",
                rootPId: -1

              },
              key: {
                children: "childNodes",
                isParent: "child"
              }
            },
            callback: {
              onAsyncSuccess: function () {
                var treeObj = $.fn.zTree.getZTreeObj("tree");
                var nodes = treeObj.getNodes();
                window.sessionStorage.setItem('zTreeObj', JSON.stringify(nodes));
              },
              onClick: function (e, treeId, treeNode) {
                if (!treeNode.canSelect || treeNode.active) return false;
                $.cookie('bureau', treeNode.bureau === true ? 1 : 0);
                $.cookie('refer', treeNode.refer === true ? 1 : 0);
                window.location.href = $.cookie('rootURL') + 'index.jsp?orgId=' + (treeNode.bureau === true ? treeNode.realId : treeNode.id) + '&ts=' + new Date().getTime();
              },
            }
          };

          function fetchDouble(projectStatus) {
            ajax.request({
              url: '/org/list;double?project_status=' + projectStatus + '&product_code=' + productCode + '&bureau=1',
              success: function (res) {
                if (res) {
                  for (var i in res) {
                    if (res[i].type == 0) {
                      res[i].icon = '/lib/3rd/tree/css/iconFont/wenjian.png';
                    } else if (res[i].type == 1) {
                      if (res[i].bureau == true) {
                        if (res[i].tagId == 3) {
                          res[i].icon = '/lib/3rd/tree/css/iconFont/fujian.png';
                        } else {
                          res[i].icon = '/lib/3rd/tree/css/iconFont/guanlian.png';
                        }

                      } else {
                        if (res[i].tagId == 1) {
                          res[i].icon = '/lib/3rd/tree/css/iconFont/flag.png';
                        } else {
                          res[i].icon = '/lib/3rd/tree/css/iconFont/taiyang.png';
                        }
                      }
                    }
                    var childNodes = res[i].childNodes
                    for (var j in childNodes) {
                      if (childNodes[j].type == 0) {
                        childNodes[j].icon = '/lib/3rd/tree/css/iconFont/wenjian.png';
                      } else if (childNodes[j].type == 1) {
                        if (childNodes[j].bureau == true) {
                          if (childNodes[j].tagId == 3) {
                            childNodes[j].icon = '/lib/3rd/tree/css/iconFont/fujian.png';
                          } else {
                            childNodes[j].icon = '/lib/3rd/tree/css/iconFont/guanlian.png';
                          }

                        } else {
                          if (childNodes[j].tagId == 1) {
                            childNodes[j].icon = '/lib/3rd/tree/css/iconFont/flag.png';
                          } else {
                            childNodes[j].icon = '/lib/3rd/tree/css/iconFont/taiyang.png';
                          }
                        }
                      }
                    }
                  }
                }
                window.sessionStorage.setItem('zTreeObj', JSON.stringify(res));
                var zTreeObj = $.fn.zTree.init($("#tree"), setting, res);
                var treeObj = $.fn.zTree.getZTreeObj("tree");
                var nodes = treeObj.getNodes();
                treeObj.expandNode(nodes[0], true, false, false)
              }
            });
          }
          var zTreeData = window.sessionStorage.getItem("zTreeObj");
          var orgId = window.sessionStorage.getItem("org");
          if (type == 'checkBox') {
            window.sessionStorage.setItem('zTreeObj', []);
            // zTreeObj = $.fn.zTree.init($("#tree"), setting);
            //fetchDouble(projectStatus);
          } else {
            if (zTreeData) {
              zTreeObj = $.fn.zTree.init($("#tree"), setting, JSON.parse(zTreeData));
              var treeObj = $.fn.zTree.getZTreeObj("tree")
              var node = zTreeObj.getNodeByParam("id", orgId, null);
              zTreeObj.selectNode(node);
            } else {
              // zTreeObj = $.fn.zTree.init($("#tree"), setting);
              //  fetchDouble(projectStatus);
            }
          }

        }
        initTree('PREPARE,BUILDING,STOP,FINISH');
        this.on('click', '.filter-prj_status input', function () {
          var project_status = getPrjStatusFilter();
          initTree(project_status, 'checkBox');
        })
        // 事件节流
        var checkEmail = function () {

          var t = null;
          return function () {
            clearTimeout(t);
            t = setTimeout(function () {
              var val = $('.seatchVal').val();
              var project_status = getPrjStatusFilter();
              var params = {
                bureau: 1,
                product_code: productCode
              };
              if (val) {
                $('.tree-box').hide();
                $('.seatch-box').show();
                $('.seatch-result').html('');
                $.ajax({
                  url: '/org/list;name?project_status=' + project_status + '&org_name=' + encodeURIComponent(val),
                  data: params,
                  type: 'get',
                  async: true,
                  contentType: 'application/json;charset=UTF-8',
                  dataType: 'json',
                  success: function (res) {
                    if (res.data && res.data[0]) {
                      var data = res.data;
                      var str = '';
                      for (var item in data) {
                        if (data[item].type == 0) {
                          str += '<li><a data=' + JSON.stringify(data[item]) + '><img src="/lib/3rd/tree/css/iconFont/wenjian.png"/><span>' + data[item].name + '</span><b>' + data[item].nodeParentName + '</b></a></li>'
                        } else if (data[item].type == 1) {
                          if (data[item].bureau == true) {
                            if (data[item].tagId == 3) {
                              str += '<li><a data=' + JSON.stringify(data[item]) + '><img src="/lib/3rd/tree/css/iconFont/fujian.png"/><span>' + data[item].name + '</span><b>' + data[item].nodeParentName + '</b></a></li>'
                            } else {
                              str += '<li><a data=' + JSON.stringify(data[item]) + '><img src="/lib/3rd/tree/css/iconFont/guanlian.png"/><span>' + data[item].name + '</span><b>' + data[item].nodeParentName + '</b></a></li>'
                            }
                          } else {
                            if (data[item].tagId == 1) {
                              str += '<li><a data=' + JSON.stringify(data[item]) + '><img src="/lib/3rd/tree/css/iconFont/flag.png"/><span>' + data[item].name + '</span><b>' + data[item].nodeParentName + '</b></a></li>'
                            } else {
                              str += '<li><a data=' + JSON.stringify(data[item]) + '><img src="/lib/3rd/tree/css/iconFont/taiyang.png"/><span>' + data[item].name + '</span><b>' + data[item].nodeParentName + '</b></a></li>'
                            }
                          }
                        }
                      }
                      $('.seatch-result').html(str);
                      $('.seatch-result li a').click(function (e) {
                        $('.seatch-result li a').each(function (i, el) {
                          $(el).removeClass('active')
                        })
                        $(this).addClass('active');
                        var data = $(this).attr('data');
                        var treeNode = JSON.parse(data);
                        if (!treeNode.canSelect || treeNode.active) return false;
                        $.cookie('bureau', treeNode.bureau === true ? 1 : 0);
                        $.cookie('refer', treeNode.refer === true ? 1 : 0);
                        window.location.href = $.cookie('rootURL') + 'index.jsp?orgId=' + (treeNode.bureau === true ? treeNode.realId : treeNode.id) + '&ts=' + new Date().getTime();

                      })
                    } else {
                      $('.seatch-result').html('<li class="none-data">暂无数据</li>');
                    }
                  },
                  error: function (error) {
                    console.log(error)
                  }
                })
              } else {
                $('.tree-box').show();
                $('.seatch-box').hide();
                $('.seatch-result').html('');
              }
            }, 500);
          }
        };
        this.on('keyup', '.seatchVal', checkEmail())
        var click = 0;
        this.on('click', '.filter', function (e) {
          click++;
          if (click % 2 == 0) {
            $('.filter-box').show();
          } else {
            $('.filter-box').hide();
          }
        });
        this.on('click', '.header-dropdown-menu', function (e) {
          e.stopPropagation();
        });
        // 头部加载树 -- 结束 --

        this.on('click', '.lbr-prjs-info', function (e) {
          ajax.request({
            url: '/org/org-projects?orgId=' + $.cookie("org") + '&productCode=' + $.cookie("appName"),
            success: function (result) {
              if (result.length == 0) {
                Dialog.showMessage({
                  title: '信息',
                  message: '选择的组织下没有包含项目。'
                });
              } else if ($.cookie("project") && result.length > 0) {
                ajax.request({
                  url: '/org/projects?id=' + $.cookie("project"),
                  success: function (result) {
                    //console.log("pppppppppppppppppppppppppppp");
                    dlgProjectInfo.showDialog(result[0]);
                  }
                });
              } else {
                for (var i = result.length - 1; i >= 0; i--) {
                  if (result[i].longitude === 0.0 && result[i].latitude === 0.0) {
                    result.splice(i, 1);
                  }
                }
                if (result.length == 0) {
                  Dialog.showMessage({
                    title: '信息',
                    message: '选择的组织下没有包含地理信息的项目。'
                  });
                }
                dlgSelectProject.showDialog({
                  projects: result
                })
              }
            }
          });
        }).on('click', '.link-user-setting', function (e) {
          dlgUserInfo.showDialog({
            title: ($.cookie('tenantManager') == 'true') ? '管理员设置' : '个人设置'
          });
        }).on('click', '.link-user-change-pwd', function (e) {
          window.open("/password");
        }).on('click', '.link-login-mobileapp', function (e) {
          dlgCodeLogin.showDialog({
            title: 'APP扫码登录'
          });
        }).on('click', '.link-help', function (e) {
          window.open(productData.helpURL ? productData.helpURL : '/static/labor/servicehelp/index.html');
        }).on('click', '.link-change-product', function (e) {
          var zTreeData = JSON.parse(window.sessionStorage.getItem("zTreeObj"));
          var userOrg = JSON.parse(getCookie('userOrg'));
          var org = [{
            'orgId': zTreeData[0].id,
            'userId': JSON.parse(userOrg)[0].userId
          }];
          // 单独处理userOrg中不被转码
          function setUserOrgCookie(c_name, value, expiredays) {
            var exdate = new Date();
            exdate.setDate(exdate.getDate() + expiredays);
            document.cookie = c_name + "=" + value + ((expiredays == null) ? "" : ";expires=" + exdate.toGMTString()) +
              ";path=/";
          }
          setUserOrgCookie('userOrg', JSON.stringify(JSON.stringify(org)));
          setCookie('org', zTreeData[0].id);
          window.sessionStorage.setItem('zTreeObj', []);
          document.location.replace('/');
        }).on('click', '.link-user-login-out', function (e) {
          //退出登录
          Dialog.confirm({
            title: '退出登录',
            message: '确定要退出登录吗？',
            callback: function () {
              if (window.sessionStorage) { //处理局指项目退出后不清空，重新登录导航节点选中
                // var refer=$.cookie('refer');
                // var bureau=$.cookie('bureau');
                sessionStorage.clear();
                // if(refer!=null) $.cookie('refer',refer);
                // if(bureau!=null) $.cookie('bureau',bureau);
              }
              window.location.replace("/logout");
            }
          });
          appendShim(Dialog.confirmDialog.contentElm, 220);
        });

        if (productData && productData.hideOrgTree)
          this.get('.navbar-left').css('display', 'none');

        ajax.request({
          url: '/pmpp/services/user/current-user-name',
          success: function (result) {
            me.get('.userName').html(result);
          }
        });

        if (!productData || !productData.hideOrgTree) {
          this.orgTree.load();
        }

        if (productData) {
          if (productData.productTextLogo) {
            var html = '<img src="./static/pc/inspection.png" style="width: 50px; height: 54px; margin-top: -10px; margin-right: 16px">供应商管理系统'
            // $('.ct-text-logo').html(productData.productTextLogo);
            $('.ct-text-logo').html(html);
          }


          $('.service-qq').html(productData.qq || '');

          if (productData.phone) {
            $('.link-service-phone').html('<span class="glyphicon glyphicon-earphone"></span>' + productData.phone);
          }

          if (productData.showDownloadPlugin === true) {
            $('.nav.help li:hidden').css('display', '');
          }
        } else {
          var html = '<img src="./static/pc/inspection.png" style="width: 50px; height: 54px; margin-top: -10px; margin-right: 16px;display:inline-block;vertical-align:middle"><span style="display:inline-block;vertical-align:middle">供应商管理系统</span>'
          $('.ct-text-logo').html(html);
        }

        if (!$.cookie("canselectproduct")) {
          $('.li-change-product').css('display', 'none');
          $('.lbr-change-product').css('display', 'none');
        }
      },
      initOrgItemEvent: function (el) {
        el.on('itemselect', function (elm, rec) {
          if (!rec || !rec.canSelect || rec.active) return false;

          if (rec.type == -1) {
            event.stopPropagation();
            event.preventDefault();
          }
          $.cookie('bureau', rec.bureau === true ? 1 : 0);
          $.cookie('refer', rec.refer === true ? 1 : 0);
          window.location.href = $.cookie('rootURL') + 'index.jsp?orgId=' + rec.id + '&ts=' + new Date().getTime();
        });
      },
      appendFilterInput: function () {
        // document.querySelector('.lbr-change-project').insertAdjacentHTML('afterBegin','<li style="padding: 0 10px;">'+
        //              </li>');

        var me = this,
          inputEl = $('.input-org_filter');

        inputEl.on('click', function (e) {
          e.stopPropagation();
          e.preventDefault();
          e.stopImmediatePropagation();
          e.cancelBubble = true;
        });
        inputEl.on('keyup', function (e) {
          var key = $.trim(e.target.value),
            list = $('.list-org_nav'),
            tree = $('.lbr-change-project'),
            emptyEl = $('.ct-list-empty'),
            orgs, prjOrgs, data;

          if (key) {
            tree.hide();
            list.show();

            orgs = [];
            prjOrgs = [];
            me.filterOrg(key, null, orgs, prjOrgs);

            if (prjOrgs.length > 0) {
              prjOrgs = prjOrgs.sort(function (a, b) {
                return a.name.localeCompare(b.name);
              });
              prjOrgs.unshift({
                type: -1,
                canSelect: false,
                name: '项目'
              });
              data = prjOrgs;
            }
            if (orgs.length > 0) {
              orgs = orgs.sort(function (a, b) {
                return a.name.localeCompare(b.name);
              });
              orgs.unshift({
                type: -1,
                canSelect: false,
                name: '组织'
              });
              data = data ? data.concat(orgs) : orgs;
            }
            me.orgList.load(data || []);
          } else {
            tree.show();
            list.hide();
            emptyEl.hide();
          }
        });
      },
      filterOrg: function (key, parent, orgs, prjOrgs) {
        var data = parent && parent.childNodes || this.orgTree.model.items;

        for (var i = 0, l = data.length; i < l; i++) {
          if (data[i].name.indexOf(key) > -1) {
            data[i].parentName = parent ? parent.name : '';
            if (data[i].type == 0) {
              orgs.push(data[i]);
            } else {
              prjOrgs.push(data[i]);
            }
          }

          if (data[i].childNodes) {
            this.filterOrg(key, data[i], orgs, prjOrgs);
          }
        }
      }
    });
  }

  function createNavbar(activeMenu) {
    var elm = $('.ct-page-navbar')[0];
    if (!elm) return;

    elm.style.zIndex = 6;
    var navBar = new ListView({
      element: elm,
      itemTemplate: '<li><a href="{{item.url}}">{{item.text}}</a></li>',
      canSelect: true,
      emptyText: null,
      renderContent: function () {
        if (!this.element) return;

        $(this.element).addClass('nav navbar-nav');
        ListView.prototype.renderContent.call(this);

        // var arr = [{
        //   text: '首页',
        //   url: '/labor/index.jsp'
        // }];

        if (productData && productData.moduleList) {
          arr = productData.moduleList;
        }

        // if (arr) { //如果存在菜单，则创建下拉菜单节点（此处没有判断现有菜单宽度是否超出内容区大小）
        //   //去掉组织管理菜单
        //   for (var i = arr.length - 1; i >= 0; i--) {
        //     if (arr[i].url.indexOf('/pmpp/page/org.jsp') > -1) {
        //       arr.splice(i, 1);
        //     }
        //   }
        //   this.load(arr);
        //   elm.insertAdjacentHTML('beforeEnd', '<li class="dropdown nav-menu-item-more" style="display:none;float:right;right:10px;">' +
        //     '<a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-expanded="true">' +
        //     '<span class="glyphicon glyphicon-th-list"></span><span class="caret"></span></a>' +
        //     '<ul class="dropdown-menu" data-role="menu" style="left:-200px;width:250px;"></ul></li>');

        //   setTimeout(resizeMenu, 10);

        //   var tid;

        //   window.addEventListener('resize', function () {
        //     if (tid) {
        //       clearTimeout(tid);
        //     }
        //     tid = setTimeout(resizeMenu, 200);
        //   });
        // }
      },
      selectMenu: function (menuText) {
        // for (var i = 0, len = this.model.items.length; i < len; i++) {
        //   if (this.model.items[i].text === menuText) {
        //     this.selectItemUI(i);
        //     return;
        //   }
        // }
      }
    });
    activeMenu && navBar.selectMenu(activeMenu);
  }

  function resizeMenu() { //调整导航菜单展现形式，如果无法都显示，出现下拉菜单
    var aw = 0, //从左至右计算菜单宽度和
      items = $('.ct-page-navbar>li:not(.nav-menu-item-more)'),
      l = items.length;

    if (!window.__menuWidths) { //缓存页面打开时导航菜单宽度，页面大小改变时使用
      window.__menuWidths = {};
      for (var i = 0; i < l; i++) {
        window.__menuWidths[i] = items[i].offsetWidth;
      }
    }

    // $('.nav-menu-item-more .dropdown-menu').html('');
    $('.nav-menu-item-more').hide();

    items.each(function (i, item) {
      var w = window.__menuWidths[i] || 0,
        sw = $('.ct-page-body').width() || 1350;
      // sw = $('.ct-page-body').width();
      if ((aw + w) >= sw) { //如果菜单宽度和超出页面内容滚动宽度，显示下拉菜单
        $('.nav-menu-item-more').show();
        var sIndex;
        var dropmenu = $('.nav-menu-item-more .dropdown-menu');

        if ((aw + $('.nav-menu-item-more').width()) > sw) { //算出添加到下拉菜单起始位置
          sIndex = i - 1;
        } else {
          sIndex = i;
        }

        var child, href;
        for (var j = sIndex; j < l; j++) {
          if (/(active)/.test(items[j].className)) { //如果是当前打开页面菜单，则把上一菜单隐藏
            items[sIndex - 1].style.display = 'none';
            child = items[sIndex - 1].childNodes[0];
          } else {
            items[j].style.display = 'none';
            child = items[j].childNodes[0];
          }

          href = child.getAttribute('href');
          dropmenu.append('<li><a href="' + href + '" style="line-height:40px;border:none!important;">' + child.innerHTML + '</a></li>');
        }

        return false;
      } else {
        aw += w;
        if (item.style.display == 'none') {
          item.style.display = '';
        }
      }
    });
  }

  var suggestDlg = new Dialog({
    width: '500px',
    height: '250px',
    bodyHTML: '<div style="text-align:center;margin-bottom:20px;font-size:16px;font-weight:bold;">建议使用下方的浏览器进行访问:</div>' +
      '<div style="display: block;text-align: center;">' +
      '<div style="display:inline-block;margin-right:30px;"><a href="http://www.google.cn/chrome/" target="blank"><img src="/images/chrome.png" style="width: 100px;height:100px;"></a>' +
      '<div class="link_word"><a href="http://www.google.cn/chrome/" target="blank">Chrome 36及以上</a></div> </div>' +
      '<div style="display:inline-block;"><a href="http://windows.microsoft.com/zh-cn/internet-explorer/download-ie" target="blank">' +
      '<img src="/images/ie9.png" style="width: 100px;height:100px;"></a>' +
      '<div class="link_word"><a href="http://windows.microsoft.com/zh-cn/internet-explorer/download-ie" target="blank">' +
      '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;IE9 及以上</a></div>' +
      '</div></div><div style="display:none;bottom: 0px;position: absolute;right: 5px;">' +
      '<span>7天之内不再提示&nbsp;<input type="checkbox" class="chk-browsersuggest"/></span></div>',
    footerHTML: '<button type="button" class="btn btn-ok btn-success">确定</button>' +
      '<button type="button" class="btn btn-cancel btn-default" data-dismiss="modal">取消</button>',
    title: '提示',
    listeners: [
      ['click', '.btn-success',
        function (event, elm, dlg) {
          // if ($('.chk-browsersuggest')[0].checked) {
          //   $.cookie('nottipperweek', 1, {
          //     expires: 7,
          //     path:'/'
          //   });
          // } else {
          //   $.cookie('nottipperweek', null);
          // }
          dlg.hide();
        }
      ]
    ]
  });

  var PageFrame = View.extend({
    element: document.body,
    renderContent: function () {
      createHeader();
      createNavbar(this.activeMenu);
      this.setActiveItem(0);
      this.checkBrowserInfo();
      if (window.expiredProducts) {
        Dialog.showHint(window.expiredProducts, 'red-bg', 5000);
        delete window.expiredProducts;
      }
    },
    checkBrowserInfo: function () {
      var browserInfo = $.fn.isIE(),
        preferred = true;

      if (browserInfo === 8) {
        preferred = false;
      } else if (browserInfo == false) {
        browserInfo = /(.*?)(Chrome\/(\d+))\./i.exec(navigator.userAgent);

        if (browserInfo == null || parseInt(browserInfo[3]) < 36) {
          preferred = false;
        }
      }

      if (preferred == false && $.cookie('suggested') !== '1') {
        appendShim(suggestDlg.contentElm, 380);
        suggestDlg.show();
        $.cookie('suggested', 1);
      }
    },
    setActiveItem: function (idx) {
      $('.ct-page-body').css('display', 'none');
      $('.ct-page-body:eq(' + idx + ')').css('display', 'block');
    }
  });
  //增加检查权限的（静态）方法
  PageFrame.$checkAuthority = function (fnCode) {
    var authorised = false;
    var arr = productData.authorisedFunctions;
    for (var k = 0; k < arr.length; k++) {
      if (fnCode === arr[k].code) {
        authorised = true;
        break;
      }
    }
    return authorised;
  };
  $('.ct-stat-grid .ct-body').on('scroll', function (e) {
    var jElm = $(this),
      scrollX = this.scrollLeft;
    var b = $('.ct-header', this.parentNode)[0];
    b && (b.scrollLeft = scrollX);
  });

  Number.prototype.toFixed = function (d) {
    var s = this + "";
    if (!d) d = 0;
    if (s.indexOf(".") == -1) s += ".";
    s += new Array(d + 1).join("0");
    if (new RegExp("^(-|\\+)?(\\d+(\\.\\d{0," + (d + 1) + "})?)\\d*$").test(s)) {
      var s = "0" + RegExp.$2,
        pm = RegExp.$1,
        a = RegExp.$3.length,
        b = true;
      if (a == d + 2) {
        a = s.match(/\d/g);
        if (parseInt(a[a.length - 1]) > 4) {
          for (var i = a.length - 2; i >= 0; i--) {
            a[i] = parseInt(a[i]) + 1;
            if (a[i] == 10) {
              a[i] = 0;
              b = i != 1;
            } else break;
          }
        }
        s = a.join("").replace(new RegExp("(\\d+)(\\d{" + d + "})\\d$"), "$1.$2");

      }
      if (b) s = s.substr(1);
      return (pm + s).replace(/\.$/, "");
    }
    return this + "";
  };

  function fixNumber(num, n) // 四舍五入保留n位小数
  {
    num = parseFloat(num);
    if (!isNaN(num)) {
      num = num.toFixed(n);
      numArr = num.split('.');
      numArr[1] = numArr[1] ? numArr[1].replace(/0*$/gi, '') : '';
      if (numArr[1]) {
        num = numArr.join('.');
      } else {
        num = numArr[0];
        num = parseFloat(num);
      }
      return num;
    } else {
      return 0;
    }
  }

  template.helper('fixNumber', fixNumber);
  return PageFrame;
});
// require.config({
//   baseUrl : "/public/jsFrame/",
//   paths : {
//       'Page' : 'lib/page',
//       'PageManager' : 'lib/pagemanager',
//       'app' : 'app',
//       'Ajax' : 'lib/ajax',
//       'dialog' : 'lib/dialog'
//   },
//   map : {
//       '*' : {
//           'css' : 'bower_components/require-css/css',
//       },
//   },

//   shim : {

//       'Page' : {
//           deps : [ 'css!/public/uiCss/ui', 'css!/public/homeCss/home', 'css!/public/contractCss/contract', 'css!/public/projectCss/project', 'css!/public/helpCss/help', 'css!/public/taskCss/task']
//       }
//   },

//   urlArgs : 't=20170505' // 增加版本，解决js缓存
// });
