/*global define:false*/
/*global template:false*/

//Observable
define('Sparrow/Observable', [], function (require) {
  function _find(es, eventName, handler) {
    var arr = es[eventName];
    if (arr) {
      var i, len = arr.length;
      for (i = 0; i < len; i++) {
        if (handler === arr[i]) {
          return i;
        }
      }
    }
    return -1;
  }

  function extend(target, ext) {
    var p, newArr, oldArr, i;
    for (p in ext) {
      if (ext.hasOwnProperty(p)) {
        if ($.isArray(target[p]) && $.isArray(ext[p])) {
          if (!target.hasOwnProperty(p)) {
            newArr = [];
            oldArr = target[p];
            for (i = 0; i < oldArr.length; i++) {
              newArr.push(oldArr[i]);
            }
            target[p] = newArr;
          }
          for (i = 0; i < ext[p].length; i++) {
            target[p].push(ext[p][i]);
          }
        } else {
          target[p] = ext[p];
        }
      }
    }
  }

  function Observable(o) {
    if (o && o !== '__extend__') {
      extend(this, o);
    }
  }
  Observable.extend = function (ext, initFn) {
    var Source = this;

    function T(o) {
      if (o === '__extend__') {
        return;
      }
      var c = initFn || Source.prototype.constructor;
      if (c) {
        c.apply(this, arguments);
      }
    }
    T.extend = Source.extend;
    T.prototype = new Source('__extend__');
    T.prototype.__super__ = Source.prototype;
    T.prototype.constructor = T;
    extend(T.prototype, ext);
    return T;
  };
  Observable.prototype = {
    on: function (eventName, handler, scope) {
      if (!this._es) {
        this._es = {};
      }
      var es = this._es;
      if (_find(es, eventName, handler) < 0) {
        if (!es[eventName]) {
          es[eventName] = [];
        }
        es[eventName].push({
          handler: handler,
          scope: scope
        });
      }
      return this;
    },
    off: function (eventName, handler) {
      var es = this._es;
      if (!es) {
        return;
      }
      var i = _find(es, eventName, handler);
      if (i > -1) {
        es[eventName] = es[eventName].splice(i, 1);
      }
      return this;
    },
    fire: function (eventName) {
      var es = this._es;
      if (!es) {
        return this;
      }
      var arr = es[eventName],
        args, i;
      if (!arr) {
        return this;
      }
      if (arguments.length > 1) {
        args = [];
        for (i = 1; i < arguments.length; i++) {
          args.push(arguments[i]);
        }
      }
      for (i = 0; i < arr.length; i++) {
        if (arr[i].handler.apply(arr[i].scope || this, args) === false) {
          return false;
        }
      }
      return this;
    }
  };
  Observable.prototype.constructor = Observable;
  return Observable;
});

//View
define('Sparrow/View', [], function (require) {
  var Observable = require('Sparrow/Observable');
  var View = Observable.extend({
    init: function () {
      return;
    },
    get: function (s, pElm) {
      pElm = pElm || this.element;
      return pElm ? $(s, pElm) : [];
    },
    getOne: function (s, pElm) {
      return this.get(s, pElm)[0];
    },
    querySelectorAll: function (s, pElm) {
      return this.get(s, pElm);
    },
    querySelector: function (s, pElm) {
      return this.getOne(s, pElm);
    },
    resolveHtmlUrl: function (req, url, callback) {
      return View.resolveHtmlUrl(req, url, callback);
    },
    getUrlContent: function (url, callback) {
      $.get(url, function (data) {
        var arr = data.match(/<body[^>]*>([\s\S.]*)<\/body>/i),
          html;
        if (arr && arr.length) {
          html = arr[0];
          html = html.substr(6, html.length - 13);
        } else {
          html = data;
        }
        callback(html);
      });
    },
    on: function (eventName, selector, handler, scope) {
      if ($.isFunction(selector)) {
        scope = handler;
        handler = selector;
        Observable.prototype.on.call(this, eventName, handler, scope);
        return this;
      }
      if (!$.isFunction(handler)) {
        return this;
      }
      //包装事件触发function，传入当前对象以及触发元素
      var me = this,
        fn = function (ev) {
          handler.call(scope || this, ev, this, me);
        };
      if ($.type(selector) !== "string") {
        $(this.element).on(eventName, fn);
      } else {
        $(this.element).on(eventName, selector, fn);
      }
      return this;
    },
    render: function (pElm) {
      var me = this,
        elm = this.element;
      pElm = pElm || this.parentElement || this.parent;
      if (!pElm && !elm) {
        return;
      }

      function done() {
        me.parentElement = pElm;
        if (me.renderContent) {
          me.renderContent();
        }
        var i, l, p2, p3;
        if (me.listeners) {
          for (i = 0; i < me.listeners.length; i++) {
            l = me.listeners[i];
            if (l && l.length > 1) {
              p2 = (l.length > 2) ? l[2] : undefined;
              p3 = (l.length > 3) ? l[3] : undefined;
              if ($.isFunction(l[1])) {
                me.on(l[0], l[1], p2);
              } else {
                me.on(l[0], l[1], p2, p3);
              }
            }
          }
        }
        me.fire('render', me);
      }
      if (elm) {
        if (elm === '.') {
          elm = this.element = pElm;
        } else {
          var jElm = pElm ? $(elm).appendTo(pElm) : $(elm);
          if ($.type(elm) === 'string') {
            elm = this.element = jElm[0];
          }
          if (!pElm) {
            pElm = elm.parentNode;
          }
        }
      }
      var p = elm || pElm;
      var html = this.html ? $.trim(this.html) : '';
      if (this.contentUrl) {
        this.getUrlContent(this.contentUrl, function (content) {
          var n = $($.trim(content)).appendTo(p)[0];
          if (!elm) {
            elm = me.element = n;
          }
          done();
        });
      } else {
        if (html !== '') {
          var n = $(html).appendTo(p)[0];
          if (!elm) {
            elm = this.element = n;
          }
        }
        done();
      }
    }
  }, function (o) {
    Observable.call(this, o);
    this.init();
    if (!(this.element || this.contentUrl || this.html) && this.defaultHTML) {
      this.html = this.defaultHTML;
    }
    if (this.autoRender !== false && (this.element || this.parentElement || this.parent)) {
      this.render();
    }
  });
  View.resolveHtmlUrl = function (req, url) {
    url = req.resolve(url);
    var lastIdx = url.toLowerCase().lastIndexOf('.js');
    if (lastIdx > 0) {
      url = url.substr(0, lastIdx);
    }
    return url;
  };
  return View;
});

//Panel
define('Sparrow/Panel', [], function (require) {
  var View = require('Sparrow/View');
  var Panel = View.extend({
    init: function () {
      if (!this.element && !this.html) {
        this.html = (this.height) ? '<div style="height:' + this.height + '"></div>' : '<div class="ct-layout-panel"></div>';
      }
    },
    renderItem: function (item, rg) {
      function getPx(v) {
        if (v === undefined) {
          return undefined;
        }
        if ($.isNumeric(v)) {
          v += 'px';
        }
        return v;
      }
      var bElm = this.bodyElement;
      if (this.layout === 'card' && $.type(item) === 'string') {
        //item定义是字符串，表示是当前文档中已经包含的片段
        var elm = $(item, bElm)[0];
        if (elm) {
          this.cardElements.push(elm);
          $(elm).css('display:none');
        }
        return;
      }
      var jElm, pElm = this.bodyElement,
        wrapItem = item;
      if (this.layout === 'card') {
        jElm = $('<div class="ct-card-view"></div>').appendTo(bElm);
        this.cardElements.push(jElm[0]);
        pElm = jElm[0];
        wrapItem = item.item || item;
      } else {
        if ($.isPlainObject(item) && rg) {
          jElm = $('<div style="position:absolute;"></div>').appendTo(bElm);
          jElm.css('top', getPx(rg.t));
          jElm.css('bottom', getPx(rg.b));
          jElm.css('left', getPx(rg.l));
          jElm.css('right', getPx(rg.r));
          jElm.css('width', getPx(rg.w));
          jElm.css('height', getPx(rg.h));
          jElm.css('overflow', item.overflow || 'auto');
          if (item.border) {
            jElm.css(rg.border, this.borderCss || "1px solid #eee");
          }
          pElm = jElm[0];
          wrapItem = item.item || item;
        }
      }
      //开始把wrapItem塞到pElm里
      if ($.isFunction(wrapItem.render)) {
        wrapItem.render(pElm);
      } else if (wrapItem.element) {
        if (wrapItem.element.parentNode !== pElm) {
          $(wrapItem.element).appendTo(pElm).css('display', 'block');
        }
      } else if (wrapItem.html) {
        $(wrapItem.html).appendTo(pElm);
      } else if (wrapItem.contentUrl) {
        this.getUrlContent(wrapItem.contentUrl, function (html) {
          $($.trim(html)).appendTo(pElm);
        });
      }
    },
    renderContent: function () {
      var me = this,
        elm = this.element;
      var bElm = this.bodyElement || (this.bodySelector ? $(this.bodySelector, elm)[0] : elm);
      this.bodyElement = bElm;
      if (!bElm) {
        return this;
      }
      if (this.bodyContentUrl) {
        this.getUrlContent(this.bodyContentUrl, function (content) {
          $($.trim(content)).appendTo(bElm);
          me.fire('bodyload', me);
        });
        return this;
      }
      if (!this.items) {
        return this;
      }
      var top = 10,
        bottom = 10,
        left = 10,
        right = 10,
        centerItem;
      var items = $.isArray(this.items) ? this.items : [this.items];
      if (this.layout === 'card') {
        this.cardElements = [];
      }
      var i, item, rg;
      for (i = 0; i < items.length; i++) {
        item = items[i];
        rg = null;
        if (item.region) {
          if (item.region === 'center') {
            centerItem = item;
          } else {
            rg = {};
            switch (item.region) {
              case "north":
                rg.t = 10;
                rg.l = left;
                rg.r = right;
                top = rg.h = item.height;
                rg.border = "border-bottom";
                break;
              case "south":
                rg.b = 10;
                rg.l = left;
                rg.r = right;
                bottom = rg.h = item.height;
                rg.border = "border-top";
                break;
              case "west":
                rg.t = top;
                rg.l = 10;
                rg.b = bottom;
                left = rg.w = item.width;
                rg.border = "border-right";
                break;
              case "east":
                rg.t = top;
                rg.r = 10;
                rg.b = bottom;
                right = rg.w = item.width;
                rg.border = "border-left";
                break;
            }
          }
        }
        this.renderItem(item, rg);
      }
      if (this.layout === 'card') {
        var idx = this.activeItemIndex || 0;
        this.setActiveItem(idx, true);
      } else if (centerItem) {
        this.renderItem(centerItem, {
          t: top,
          b: bottom,
          l: left,
          r: right,
          border: 'border'
        });
      }
    },
    setActiveItem: function (idx, whatever) {
      if ((this.layout !== 'card') || (!whatever && idx === this.activeItemIndex)) {
        return;
      }
      var elm;
      if (idx !== this.activeItemIndex) {
        elm = this.cardElements[this.activeItemIndex];
        this.activeItemIndex = -1;
        $(elm).css('display', 'none');
      }
      if (idx < this.cardElements.length) {
        elm = this.cardElements[idx];
        this.activeItemIndex = idx;
        $(elm).css('display', 'block');
      }
    }
  });
  return Panel;
});

//Modal-Dialog
define('Sparrow/ModalDialog', [], function (require) {
  var Panel = require('Sparrow/Panel');
  var ModalDialog = Panel.extend({
    parentElement: document.body,
    defaultHeaderHTML: '<button type="button" class="close" data-dismiss="modal" aria-label="Close">' + '<span aria-hidden="true">&times;</span>' + '</button>' + '<h4 class="modal-title" style="font-weight:bold"></h4>',
    okCancelFooterHtml: '<button type="button" class="btn btn-ok btn-primary">确定</button>' + '<button type="button" class="btn btn-cancel btn-default" data-dismiss="modal">取消</button>',
    closeFooterHtml: '<button type="button" class="btn btn-default" data-dismiss="modal">关闭</button>',
    frameHtml: '<div class="modal fade"><div class="modal-center"><div class="modal-dialog"><div class="modal-content">' + '<div class="modal-header"></div>' + '<div class="modal-body"></div>' + '<div class="modal-footer"></div>' + '</div></div></div></div>',
    init: function () {
      if (!(this.element || this.html || this.contentUrl)) {
        var s = this.frameHtml;
        var sHeader = (this.headerHTML || this.defaultHeaderHTML);
        var sBody = this.bodyHTML;
        var sFooter = (this.footerHTML || (this.footerType === 'okCancel' ? this.okCancelFooterHtml : this.closeFooterHtml));
        if (sHeader) {
          s = s.replace('header"></div>', 'header">' + sHeader + '</div>');
        }
        if (sBody) {
          s = s.replace('body"></div>', 'body">' + sBody + '</div>');
        }
        if (sFooter) {
          s = s.replace('footer"></div>', 'footer">' + sFooter + '</div>');
        }
        this.html = s;
      }
      this.headerSelector = this.headerSelector || '.modal-header';
      this.bodySelector = this.bodySelector || '.modal-body';
      this.footerSelector = this.footerSelector || '.modal-footer';
    },
    renderContent: function () {
      if (this.dialogClass) {
        $(this.element).addClass(this.dialogClass);
      }
      this.contentElm = this.contentElm || this.querySelector('.modal-content');
      this.headerElm = this.headerElm || this.querySelector(this.headerSelector);
      if (this.headerElm) {
        var me = this;
        $('.close', this.headerElm).on('click', function () {
          me.fire('close', me);
        });
      }
      this.footerElm = this.footerElm || this.querySelector(this.footerSelector);
      this.get('.modal-dialog').css('width', this.width || 'auto');
      if (this.maxWidth) {
        this.get('.modal-dialog').css('max-width', this.maxWidth);
      }
      if (this.minWidth) {
        this.get('.modal-dialog').css('min-width', this.maxWidth);
      }
      if (this.height) {
        this.get('.modal-body').css('height', this.height);
      }
      if (this.maxHeight) {
        this.get('.modal-body').css('max-height', this.maxHeight);
      }
      if (this.title) {
        this.setTitle(this.title);
      }
      Panel.prototype.renderContent.call(this);
    },
    listeners: [
      ['keydown', this.element, function (event) {
        if (event.keyCode == '13') {
          event.stopPropagation();
          event.preventDefault();
        }
      }]
    ],
    setTitle: function (s) {
      if (this.headerElm) {
        $('.modal-title', this.headerElm).html(s);
      }
    },
    show: function () {
      $(this.element).modal('show');
      this.fire('show', this);
    },
    hide: function () {
      $(this.element).modal('hide');
      this.fire('hide', this);
    }
  });

  function createConfirmDialog() {
    var dialog = new ModalDialog({
      bodyHTML: '<div class="dialog-message-body">' + '<span class="glyphicon glyphicon-question-sign text-warning msg-icon"/>' + '<span class="msg-text"/>' + '</div>',
      footerType: 'okCancel',
      listeners: [
        ['click', '.btn-ok',
          function (event, elm, dlg) {
            dlg.hide();
            if ($.isFunction(dlg.callback)) {
              dlg.callback();
            }
          }
        ],
        ['click', '.btn-cancel',
          function (event, elm, dlg) {
            dlg.hide();
            if ($.isFunction(dlg.cancel)) {
              dlg.cancel();
            }
          }
        ],
        ['close', function (dlg) {
          if ($.isFunction(dlg.cancel)) {
            dlg.cancel();
          }
        }]
      ],
      confirm: function (o, message, callback, cancelCallback) {
        var title, msg, fn, cancelFn;
        if ($.type(o) === "string") {
          if ($.type(message) === "string") {
            title = o;
            msg = message;
            fn = callback;
            cancelFn = cancelCallback;
          } else {
            msg = o;
            fn = message;
            cancelFn = callback;
          }
        } else {
          title = o.title;
          msg = o.message;
          fn = o.callback;
        }
        this.callback = fn;
        this.cancel = cancelFn;
        this.setTitle(title || '确认');
        this.get('.msg-text').html(msg);
        this.show();
      }
    });

    dialog.element.style.zIndex = 1100;
    return dialog;
  }

  function createMessageDialog() {
    var dialog = new ModalDialog({
      bodyHTML: '<div class="dialog-message-body">' + '<span class="glyphicon glyphicon-bell text-primary msg-icon"/>' + '<span class="msg-text"></span>' + '</div>',
      listeners: [
        ['click', '.btn',
          function (event, elm, dlg) {
            dlg.hide();
            if ($.isFunction(dlg.callback)) {
              dlg.callback();
            }
          }
        ],
        ['close', function (dlg) {
          if ($.isFunction(dlg.callback)) {
            dlg.callback();
          }
        }]
      ],
      showMessage: function (o, message, callback) {
        var title, msg, fn;
        if ($.type(o) === "string") {
          if ($.type(message) === "string") {
            title = o;
            msg = message;
            fn = callback;
          } else {
            msg = o;
            fn = message;
          }
        } else {
          title = o.title;
          msg = o.message;
          fn = o.callback;
        }
        if (msg) {
          msg = $.trim(msg);
        }
        this.setTitle(title || '提示');
        var msgWrap = this.get('.msg-text').empty();
        if (msg.indexOf('\n') > 0) {
          msgWrap = $('<pre></pre>').appendTo(msgWrap);
        }
        msgWrap.html(msg);
        this.callback = fn;
        this.show();
      }
    });

    dialog.element.style.zIndex = 1100;
    return dialog;
  }
  ModalDialog.confirm = function (title, message, okFn, cancelFn) {
    if (!this.confirmDialog) {
      this.confirmDialog = createConfirmDialog();
    }
    this.confirmDialog.confirm(title, message, okFn, cancelFn);
  };
  ModalDialog.showMessage = function (title, message, callback) {
    this.messageDialog = this.messageDialog || createMessageDialog();
    this.messageDialog.showMessage(title, message, callback);
  };
  ModalDialog.showHint = function (o, exClass, timeout) {
    var lyr = this.hintLayer,
      msg;
    if ($.type(o) === "string") {
      msg = o;
      if (exClass && $.isNumeric(exClass)) {
        var t = timeout;
        timeout = exClass;
        exClass = t;
      }
    } else {
      msg = o.message;
      exClass = o.exClass;
      timeout = o.timeout;
    }
    if (!lyr) {
      var wrap = $('<div class="message-hint-wrap"></div>').appendTo(document.body);
      lyr = this.hintLayer = $('<div class="message-hint"></div>').appendTo(wrap);
      lyr.__wrap = wrap;
    } else {
      if (lyr.__timer) {
        clearTimeout(lyr.__timer);
      }
    }
    lyr.html(msg);
    if (lyr.__exClass !== exClass) {
      if (lyr.__exClass) {
        lyr.removeClass(lyr.__exClass);
      }
      if (exClass) {
        lyr.addClass(exClass);
      }
      lyr.__exClass = exClass;
    }
    lyr.__wrap.fadeIn(1000);
    lyr.__timer = setTimeout(function () {
      lyr.__wrap.fadeOut(1000);
    }, timeout || 3000);
  };
  return ModalDialog;
});

//RecordFactory
define('Sparrow/RecordFactory', [], function (require) {
  function RecordFactory(fields) {
    if (!fields) {
      return;
    }
    var fk = {},
      fm = {};

    function init() {
      var i, f;
      for (i = 0; i < fields.length; i++) {
        f = fields[i];
        if ($.type(f) === "string") {
          fk[f] = 1;
        } else if (f.field) {
          if (f.mapping) {
            fm[f.mapping] = f.field;
            fk[f.field] = f.mapping;
          } else if (f.converter) {
            fk[f.field] = f.converter;
          }
        }
      }
    }
    init();
    this.create = function (data) {
      function getRecord(data) {
        var rec = {},
          f, v;
        for (f in fk) {
          if (fk.hasOwnProperty(f)) {
            v = fk[f];
            if (v === 1 && data[f] !== undefined) {
              rec[f] = data[f];
            } else if ($.type(v) === "string" && data[v] !== undefined) {
              rec[f] = data[v];
            } else if ($.isFunction(v)) {
              rec[f] = v(data);
            }
          }
        }
        return rec;
      }
      var ret;
      if ($.isArray(data)) {
        ret = [];
        var i;
        for (i = 0; i < data.length; i++) {
          ret.push(getRecord(data[i]));
        }
      } else {
        ret = getRecord(data);
      }
      return ret;
    };
  }
  return RecordFactory;
});

//List-Model
define('Sparrow/ListModel', [], function (require) {
  var Observable = require('Sparrow/Observable');
  var List = Observable.extend({
    init: function () {
      return;
    },
    newRecord: function (data) {
      if (this.Record) {
        return this.Record.create(data);
      }
      var rec = {};
      if (!data) {
        return rec;
      }
      var p;
      for (p in data) {
        if (data.hasOwnProperty(p)) {
          rec[p] = data[p];
        }
      }
      return rec;
    },
    __innerLoad: function (data) {
      this.clear(true);
      var count;
      if (data && data.data) {
        count = data.count;
        data = data.data;
      }
      var i;
      for (i = 0; i < data.length; i++) {
        this.__innerAppend(data[i], true);
      }
      this.fire('load', this, this.items, count);
    },
    load: function (pageCfg, data) {
      var me = this,
        loadSvc = this.service.load;
      var pageSize, pageIndex;
      if (pageCfg && pageCfg.pageSize) {
        pageSize = pageCfg.pageSize;
        pageIndex = pageCfg.pageIndex;
      } else {
        data = pageCfg;
      }
      if (!$.isArray(data) && loadSvc) {
        var args = [];
        if (pageSize) {
          args.push(pageSize);
          args.push(pageIndex);
        }
        if (data) {
          args.push(data);
        }
        var fn = function (d) {
          me.__innerLoad(d);
        };
        args.push(fn);
        loadSvc.apply(this, args);
      } else {
        this.__innerLoad(data);
      }
    },
    __innerAppend: function (data, noEvent, callback) {
      var rec = this.newRecord(data);
      this.items.push(rec);
      if (callback) {
        callback(this, this, rec, this.items.length - 1);
      }
      if (noEvent !== true) {
        this.fire('append', this, rec, this.items.length - 1);
      }
    },
    append: function (data, noEvent, callback) {
      var me = this,
        appendSvc = this.service.append;
      if (appendSvc) {
        appendSvc.call(this, data, function () {
          me.__innerAppend(data, noEvent, callback);
        });
      } else {
        this.__innerAppend(data, noEvent, callback);
      }
    },
    /*列表增加insert方法beign*/
    __innerInsert: function (data, noEvent, callback) {
      var rec = this.newRecord(data);
      this.items.unshift(rec);
      if (callback) {
        callback(this, this, rec, -1);
      }
      if (noEvent !== true) {
        this.fire('insert', this, rec, -1);
      }
    },
    insert: function (data, noEvent, callback) {
      var me = this,
        appendSvc = this.service.insert;
      if (appendSvc) {
        appendSvc.call(this, data, function () {
          me.__innerInsert(data, noEvent, callback);
        });
      } else {
        this.__innerInsert(data, noEvent, callback);
      }
    },
    /*列表增加insert方法end*/
    __innerUpdate: function (rec, data, idx, callback) {
      if (this.Record) {
        data = this.Record.create(data);
      }
      var p;
      for (p in data) {
        if (data.hasOwnProperty(p)) {
          rec[p] = data[p];
        }
      }
      if (callback) {
        callback(this, rec, idx);
      }
      this.fire('update', this, rec, idx);
    },
    update: function (mix, data, callback) {
      var idx = $.isNumeric(mix) ? mix : this.findIdx(mix);
      if (idx >= 0 && idx < this.items.length) {
        var me = this,
          rec = this.items[idx],
          updateSvc = this.service.update;
        if (updateSvc) {
          updateSvc.call(this, data, rec, idx, function () {
            me.__innerUpdate(rec, data, idx, callback);
          });
        } else {
          this.__innerUpdate(rec, data, idx, callback);
        }
      }
    },
    __innerRemove: function (idx, rec, callback) {
      this.items.splice(idx, 1);
      if (callback) {
        callback(this, rec, idx);
      }
      this.fire('remove', this, rec, idx);
    },
    remove: function (mix, callback) {
      var idx = $.isNumeric(mix) ? mix : this.findIdx(mix);
      if (idx >= 0 && idx < this.items.length) {
        var me = this,
          rec = this.items[idx],
          removeSvc = this.service.remove;
        if (this.fire('beforeremove', this, rec, idx) === false) {
          return;
        }
        if (removeSvc) {
          removeSvc.call(this, rec, idx, function () {
            me.__innerRemove(idx, rec, callback);
          });
        } else {
          this.__innerRemove(idx, rec, callback);
        }
      }
    },
    __innerClear: function (noEvent) {
      if (this.items) {
        this.items = undefined;
      }
      this.items = [];
      if (noEvent !== true) {
        this.fire('clear', this);
      }
    },
    clear: function (noEvent) {
      var me = this,
        clearSvc = this.service.clear;
      if (clearSvc) {
        clearSvc.call(this, function () {
          me.__innerClear(noEvent);
        });
      } else {
        this.__innerClear(noEvent);
      }
    },
    find: function (mix) {
      var idx = this.findIdx(mix);
      return (idx < 0) ? null : this.items[idx];
    },
    findIdx: function (mix) {
      var fn = $.isFunction(mix) ? mix : function (rec) {
        return (rec === mix);
      };
      var i;
      for (i = 0; i < this.items.length; i++) {
        if (fn(this.items[i]) === true) {
          return i;
        }
      }
      return -1;
    }
  }, function (o) {
    if (!o) {
      return;
    }
    var p;
    for (p in o) {
      if (o.hasOwnProperty(p)) {
        if (o[p] !== undefined) {
          this[p] = o[p];
        }
      }
    }
    this.service = this.service || {};
    this.init();
    if (o.data) {
      this.load(o.data);
    }
  });
  return List;
});

//Tree-Model
define('Sparrow/TreeModel', [], function (require) {
  var List = require('Sparrow/ListModel');
  var Tree = List.extend({
    childNodesAttr: 'childNodes',
    __innerLoad: function (data) {
      this.clear(true);
      var i;
      for (i = 0; i < data.length; i++) {
        this.__innerAppend(null, data[i], true);
      }
      this.fire('load', this, this.items);
    },
    __innerAppend: function (parent, data, noEvent, callback) {
      var rec = this.newRecord(data);
      rec[this.childNodesAttr] = undefined;
      rec.__parent = parent;
      rec.__level = parent ? parent.__level + 1 : 0;
      var attr = parent ? this.childNodesAttr : 'items',
        p = parent || this;
      p[attr] = p[attr] || [];
      p[attr].push(rec);
      var childNodes = data[this.childNodesAttr];
      if (childNodes) {
        var i;
        for (i = 0; i < childNodes.length; i++) {
          this.__innerAppend(rec, childNodes[i], true);
        }
      }
      if (noEvent !== true) {
        this.fire('append', this, parent, rec, p[attr].length - 1);
      }
      if (callback) {
        callback(this, parent, rec, p[attr].length - 1);
      }
    },
    append: function (parent, data, noEvent, callback) {
      var me = this,
        appendSvc = this.service.append;
      if (appendSvc) {
        appendSvc.call(this, parent, data, function () {
          me.__innerAppend(parent, data, noEvent, callback);
        });
      } else {
        this.__innerAppend(parent, data, noEvent, callback);
      }
    },
    __innerUpdate: function (parent, rec, data, idx, callback) {
      if (this.Record) {
        data = this.Record.create(data);
      }
      var p;
      for (p in data) {
        if (data.hasOwnProperty(p)) {
          rec[p] = data[p];
        }
      }
      this.fire('update', this, parent, rec, idx);
      if (callback) {
        callback(this, parent, rec, idx);
      }
    },
    update: function (rec, data, callback) {
      var parent = rec.__parent,
        attr = parent ? this.childNodesAttr : 'items',
        p = parent || this;
      var me = this,
        updateSvc = this.service.update,
        idx = $.inArray(rec, p[attr]);
      if (idx < 0) {
        return;
      }
      if (updateSvc) {
        updateSvc.call(this, parent, data, rec, idx, function () {
          me.__innerUpdate(parent, rec, data, idx, callback);
        });
      } else {
        this.__innerUpdate(parent, rec, data, idx, callback);
      }
    },
    __innerRemove: function (parent, rec, idx, callback) {
      var attr = parent ? this.childNodesAttr : 'items',
        p = parent || this;
      p[attr].splice(idx, 1);
      this.fire('remove', this, parent, rec, idx);
      if (callback) {
        callback(this, parent, rec, idx);
      }
    },
    remove: function (rec, callback) {
      var parent = rec.__parent,
        attr = parent ? this.childNodesAttr : 'items',
        p = parent || this;
      var me = this,
        removeSvc = this.service.remove,
        idx = $.inArray(rec, p[attr]);
      if (idx < 0) {
        return;
      }
      if (this.fire('beforeremove', this, parent, idx, rec) === false) {
        return;
      }
      if (removeSvc) {
        removeSvc.call(this, parent, rec, idx, function () {
          me.__innerRemove(parent, rec, idx, callback);
        });
      } else {
        this.__innerRemove(parent, rec, idx, callback);
      }
    }
  });
  return Tree;
});

//List-View
define('Sparrow/ListView', [], function (require) {
  var View = require('Sparrow/View'),
    ListModel = require('Sparrow/ListModel'),
    Dialog = require('Sparrow/ModalDialog');
  var ListView = View.extend({
    emptyTemplate: '<div class="ct-list-empty">{{emptyText}}</div>',
    emptyText: '暂无数据',
    init: function () {
      if (!this.model) {
        this.Model = this.Model || ListModel;
        this.model = new this.Model({
          Record: this.Record,
          service: this.service
        });
      }
      this.paging = this.paging || !!this.pageSize;
      if (this.paging) {
        if (!this.pageSize) {
          this.pageSize = 20;
        }
        if (!this.pagingBodyRender) {
          var tmpl = "";
          if (this.pagingStyle === "simple") {
            tmpl = this.pagingBodyTemplate || '<div class="navbar-form navbar-left" style="padding-left: 0px;">' +
              '<ul class="pagination pagination-lg" style="margin:0;float:left">' +
              '<li class="prev-page">' +
              '<a href="#" title="上一页" style="font-size:13px"><span >上一页</span>' +
              '</a>' +
              '</li>' +
              '<li class="next-page">' +
              '<a href="#" title="下一页" style="font-size:13px"><span>下一页</span>' +
              '</a>' +
              '</li>' +
              '</ul>' +
              '<label style="padding-left:10px;font-weight:400;line-height:40px;float:left"> 当前第 {{pageIdx+1}} 页</label> ' +
              '</div>' +
              '<div style="clear:both"></div>';
          } else {
            tmpl = this.pagingBodyTemplate || '<div class="navbar-form navbar-left" style="padding-left: 0px;">' +
              '<ul class="pagination pagination-lg" style="margin:0;float:left">' +
              '<li class="first-page">' +
              '<a href="#" title="首页" style="font-size:13px">' +
              '<span class="glyphicon glyphicon-step-backward"></span>' +
              '</a>' +
              '</li>' +
              '<li class="prev-page">' +
              '<a href="#" title="上一页" style="font-size:13px">' +
              '<span class="glyphicon glyphicon-triangle-left"></span>' +
              '</a>' +
              '</li>' +
              '{{each pages}}' +
              '<li pageIndex="{{$value}}"><a href="#" style="font-size:13px">{{$value + 1}}</a></li>' +
              '{{/each}}' +
              '<li class="next-page">' +
              '<a href="#" title="下一页" style="font-size:13px">' +
              '<span class="glyphicon glyphicon-triangle-right"></span>' +
              '</a>' +
              '</li>' +
              '<li class="last-page">' +
              '<a href="#" title="最后一页" style="font-size:13px">' +
              '<span class="glyphicon glyphicon-step-forward"></span>' +
              '</a>' +
              '</li>' +
              '</ul>' +
              '<label style="padding-left:10px;font-weight:400;line-height:40px;float:left"> 共 {{pageCount}} 页, {{count}} 条</label> ' +
              '</div>' +
              '<div class="navbar-form navbar-right" style="padding-right:0px">' +
              '<span>每页显示:</span>' +
              '<select class="form-control sel-set-pagesize" style="width:95px !important;">' +
              '{{each psizes}}' +
              ' <option value="{{$value}}" {{if $value==cursize}} selected {{/if}}>{{$value}}条</option>' +
              '{{/each}}' +
              ' </select>' +
              '</div>' +
              '<div style="clear:both"></div>';
          }
          this.pagingBodyRender = template.compile(tmpl); ///共{{count}}条 
        }
      }
      this.itemRender = this.itemRender || template.compile(this.itemTemplate);
      if (!this.emptyHtml && this.emptyText && this.emptyText !== '') {
        var emptyRender = template.compile(this.emptyTemplate);
        this.emptyHtml = emptyRender({
          emptyText: this.emptyText
        });
      }
      var me = this;
      this.model.on('load', function (model, data, count) {
        if (me.renderBody) {
          me.renderBody(data, count);
        }
        me.setEmptyClass();
        me.fire('load', me, model, data);
      }).on('clear', function (model) {
        if (me.clearItemsUI) {
          me.clearItemsUI();
        }
        me.setEmptyClass();
        me.fire('clear', me, model);
      }).on('append', function (model, rec) {
        if (me.renderItem) {
          me.renderItem(rec);
        }
        me.setEmptyClass();
        me.fire('append', me, model, rec);
      }).on('insert', function (model, rec) { //增加insert方法
        if (me.renderItem) {
          me.renderItem(rec, -1);
        }
        me.setEmptyClass();
        me.fire('insert', me, model, rec);
      }).on('update', function (model, rec, idx) {
        if (me.renderItem) {
          me.renderItem(rec, idx);
        }
        me.fire('update', me, model, rec);
      }).on('remove', function (model, rec, idx) {
        if (me.removeItemUI) {
          me.removeItemUI(rec, idx);
        }
        me.setEmptyClass();
        if (me.showRemoveMessage !== false) {
          Dialog.showHint('删除成功！');
        }
        me.fire('remove', me, model, rec);
      }).on('beforeremove', function (model, rec, idx) {
        return me.fire('beforeremove', model, rec, idx);
      });
    },
    setEmptyClass: function () {
      if (this.emptyElement) {
        $(this.emptyElement).css('display', (this.model.items && this.model.items.length) ? 'none' : 'block');
      }
    },
    findItemUI: function (idx) {
      var bodyElm = this.bodyElement,
        slt = this.itemSelector,
        elm;
      if ($.isNumeric(idx)) {
        if ($.type(slt) === "string") {
          elm = $(slt, bodyElm)[idx];
        } else {
          var nodes = bodyElm.childNodes,
            i, j = -1,
            n;
          for (i = 0; i < nodes.length; i++) {
            n = nodes[i];
            if (parseInt(n.nodeType, 0) === 1) {
              j++;
              if (j === idx) {
                elm = n;
                break;
              }
            }
          }
        }
      }
      return elm;
    },
    renderContent: function () {
      if (!this.element || !this.itemRender) {
        return;
      }
      var me = this;
      if (!this.bodyElement) {
        this.bodyElement = this.bodySelector ? $(this.bodySelector, this.element)[0] : this.element;
      }
      if (this.emptyHtml) {
        this.emptyElement = $(this.emptyHtml).appendTo(this.parentElement)[0];
      }
      if (this.paging) {
        if (!this.pagingElement) {
          if (this.pagingSelector) {
            this.pagingElement = $(this.pagingSelector, this.element)[0];
          } else {
            this.pagingElement = $('<div class="ct-filter-page-bar" />').appendTo(this.parentElement)[0];
          }
        }
        $(this.pagingElement).on('click.spr.list.paging', 'li', function () {
          var idx;
          if ($(this).hasClass('disabled'))
            return false;
          if ($(this).hasClass('prev-page')) {
            idx = me.pageIndex - 1;
          } else if ($(this).hasClass('first-page')) {
            idx = 0;
          } else if ($(this).hasClass('last-page')) {
            idx = me.pageCount - 1;
          } else if ($(this).hasClass('next-page')) {
            idx = me.pageIndex + 1;
          } else {
            idx = parseInt($(this).attr('pageIndex'), 0);
          }
          if ((idx >= 0 && idx < me.pageCount && me.__requirePageIndex !== idx) || me.pagingStyle == 'simple') {
            me.__requirePageIndex = idx;
            me.load(me.__lastData, false);
          }
        });
        $(this.pagingElement).on('change', '.sel-set-pagesize', function () {
          var v = this.value;
          me.pageSize = parseInt(v, 0);
          me.__requirePageIndex = 0;
          me.load(me.__lastData, false);
        });
      }
      if (this.canSelect) {
        this.on('mousedown.spr.list.item', this.itemSelector || '.list-group-item', function () {
          me.selectItemUI(this, me);
        });
      }
      if (this.itemListeners) {
        var i, l;
        for (i = 0; i < this.itemListeners.length; i++) {
          l = this.itemListeners[i];
          if (l.length > 1) {
            if ($.isFunction(l[1])) {
              this.onItem(l[0], l[1]);
            } else {
              this.onItem(l[0], l[1], l[2]);
            }
          }
        }
      }
    },
    renderPagingBar: function (count) {
      if (this.paging && this.pagingElement) {
        var pageSectionCount = this.pageSectionCount || 10; //暂时先用常量
        var pCount;
        var countchange = false;

        if (count >= 0) {
          if (count != this.totalCount)
            countchange = true;
          this.totalCount = count;
        } else {
          count = this.totalCount
        }
        if (!isNaN(count) && count >= 0) {
          this.__minPageIndex = undefined;
          pCount = Math.ceil(parseInt(count, 0) / this.pageSize);
        }
        pCount = isNaN(pCount) ? this.pageCount : pCount;
        this.pageCount = pCount;
        //this.pagingElement.style.display = (isNaN(pCount) || this.totalCount<this.pageSize) ? 'none' : 'block';
        this.pagingElement.style.display = (isNaN(pCount) || count == 0) ? 'none' : 'block';

        var idx = (this.__requirePageIndex || 0);
        this.pageIndex = idx;
        if (pCount >= 1 && this.pagingBodyRender && ((this.__minPageIndex === undefined) || (idx < this.__minPageIndex) || (idx >= this.__minPageIndex + pageSectionCount))) {
          var tCount = this.totalCount;
          var min = idx - (idx % pageSectionCount);
          this.__minPageIndex = min;
          var ps = [];
          if (this.pageSizeArray && !countchange)
            ps = this.pageSizeArray;
          else {

            ps.push(this.pageSize);
            if (tCount > 10 && ps.indexOf(10) < 0) {
              ps.push(10);
            }
            if (tCount > 20 && ps.indexOf(20) < 0) {
              ps.push(20);
            }
            if (tCount > 50 && ps.indexOf(50) < 0) {
              ps.push(50);
            }
            if (tCount > 75 && ps.indexOf(75) < 0) {
              ps.push(75);
            }
            if (tCount > 100 && ps.indexOf(100) < 0) {
              ps.push(100);
            }
            if (tCount > 0 && ps.indexOf(tCount) < 0 && tCount < 300) {
              ps.push(tCount);
            }
            ps.sort(function (a, b) {
              return a - b
            });
            this.pageSizeArray = ps;
          }

          var p = {
            pageIdx: this.pageIndex || 0,
            pageCount: pCount,
            count: tCount,
            psizes: ps,
            cursize: this.pageSize || 25,
            pages: []
          };
          var i;
          for (i = min; i < min + pageSectionCount; i++) {
            if (i >= pCount) {
              break;
            }
            p.pages.push(i);
          }
          var s = this.pagingBodyRender(p);
          $(this.pagingElement).html(s);
        }
        if (idx > 0) {
          $('.prev-page', this.pagingElement).removeClass('disabled');
          $('.first-page', this.pagingElement).removeClass('disabled');
        } else {
          $('.prev-page', this.pagingElement).addClass('disabled');
          $('.first-page', this.pagingElement).addClass('disabled');
        }
        if (idx < pCount - 1) {
          $('.next-page', this.pagingElement).removeClass('disabled');
          $('.last-page', this.pagingElement).removeClass('disabled');
        } else {
          $('.next-page', this.pagingElement).addClass('disabled');
          $('.last-page', this.pagingElement).addClass('disabled');
        }
        $('[pageIndex]', this.pagingElement).removeClass('active');
        $('[pageIndex="' + idx + '"]', this.pagingElement).addClass('active');
      }
    },
    renderSimpleBar: function (data) {
      if (this.paging && this.pagingElement) {
        //this.pagingElement.style.display = (isNaN(pCount) || this.totalCount<this.pageSize) ? 'none' : 'block';
        var idx = (this.__requirePageIndex || 0);
        this.pagingElement.style.display = (idx == 0 && data && data.length < this.pageSize) ? 'none' : 'block';

        // if (idx > 0 && (!data || data.length == 0)) {
        //     this.__requirePageIndex--;
        //     idx--;

        // }
        this.pageIndex = idx;
        var p = {
          pageIdx: this.pageIndex
        };
        var s = this.pagingBodyRender(p);
        $(this.pagingElement).html(s);
        if (idx > 0) {
          $('.prev-page', this.pagingElement).removeClass('disabled');
        } else {
          $('.prev-page', this.pagingElement).addClass('disabled');
        }
        if ((!data || data.length == 0) || data.length < this.pageSize) {
          $('.next-page', this.pagingElement).addClass('disabled');
        } else {
          $('.next-page', this.pagingElement).removeClass('disabled');
        }
      }
    },
    renderBody: function (data, count) {
      var bodyElm = this.bodyElement;
      if (!bodyElm) {
        return this;
      }
      $(bodyElm).empty();
      if (this.pagingStyle === "simple") {
        this.renderSimpleBar(data);
      } else {
        this.renderPagingBar(count);
      }

      var i;
      for (i = 0; i < data.length; i++) {
        this.renderItem(data[i]);
      }
    },
    renderItem: function (rec, idx) {
      var bodyElm = this.bodyElement;
      if (!bodyElm) {
        return this;
      }
      var html = $.trim(this.itemRender({
          item: rec
        })),
        jElm = $(html);
      if (jElm.length) {
        if (idx < 0) {
          jElm.prependTo(bodyElm); //list增加insert方法
        } else if ($.isNumeric(idx) && idx < this.model.items.length) {
          var elm = this.findItemUI(idx);
          $(elm).replaceWith(jElm);
        } else {
          jElm.appendTo(bodyElm);
        }
        jElm[0].__rec = rec;
      }
    },
    selectItemUI: function (mix) {
      var elm = $.isNumeric(mix) ? this.findItemUI(mix) : mix;
      if (!elm) {
        return;
      }
      if (this.fire('beforeselect', elm) === false) {
        return;
      }
      var cls = this.activeClass || 'active';
      if (this.activeItem) {
        $(this.activeItem).removeClass(cls);
      }
      this.activeItem = elm;
      $(elm).addClass(cls);
      this.fire('itemselect', elm, elm.__rec);
    },
    clearItemsUI: function () {
      $(this.bodyElement).empty();
    },
    removeItemUI: function (rec, idx) {
      if ($.isNumeric(idx)) {
        var elm = this.findItemUI(idx);
        if (elm) {
          $(elm).remove();
        }
      }
    },
    load: function (data, initPages) {
      if (this.paging) {
        this.__lastData = data;
        if (initPages !== false) {
          this.__requirePageIndex = undefined;
        }
        this.model.load({
            pageIndex: this.__requirePageIndex,
            pageSize: this.pageSize
          },
          data);
      } else {
        this.model.load(data);
      }
    },
    clear: function () {
      this.model.clear();
    },
    append: function (data, callback) {
      this.model.append(data, false, callback);
    },
    insert: function (data, callback) { //增加insert方法
      this.model.insert(data, false, callback);
    },
    update: function (mix, data, callback) {
      this.model.update(mix, data, callback);
    },
    remove: function (mix, callback) {
      this.model.remove(mix, callback);
    },
    onItem: function (eventName, selector, handler, scope) {
      var slt = this.itemSelector || '.list-group-item';
      if ($.isFunction(selector)) {
        scope = handler;
        handler = selector;
        selector = slt;
      }
      var bElm = this.bodyElement,
        me = this;
      $(bElm).on(eventName, selector, function (event) {
        if (event.cancelBubble === true) {
          return;
        }
        var jElm = (this.parentNode === bElm) ? $(this) : $(this).parents(slt);
        if (jElm.length) {
          if (!jElm[0].__rec && me.irregularList && me.lastitemSelector) {
            jElm = $(this).parents(slt).prevAll(me.lastitemSelector + ':first');
          }
          handler.call(this, event, jElm[0], jElm[0].__rec, me);
        }
      });
    },
    itemListeners: [
      ['click.remove.spr.list.item', '[data-operation="remove"]',
        function (event, elm, rec, list) {
          if (list.confirmRemove === false) {
            list.remove(rec);
          } else {
            Dialog.confirm({
              title: '删除提示',
              message: list.removeConfirmMessage || '确认删除该记录吗？',
              callback: function () {
                list.remove(rec);
              }
            });
          }
        }
      ],
      ['click.modify.spr.list.item', '[data-operation="modify"]',
        function (event, elm, rec, list) {
          list.fire('requiremodify', list, rec);
        }
      ]
    ]
  });
  return ListView;
});

//Grid
define('Sparrow/Grid', [], function (require) {
  var List = require('Sparrow/ListView');

  var widthConst = {
    narrow: 50,
    normal: 80,
    wide: 100,
    wider: 150,
    widest: 200
  };

  var Grid = List.extend({
    init: function () {
      var h = '',
        s = '',
        i, col, w;
      for (i = 0; i < this.columns.length; i++) {
        col = this.columns[i];
        //组合标题单元格模板
        h += '<th';
        if (col.headerCls) {
          h += ' class="' + col.headerCls + '"';
        }
        switch (col.width) {
          case 'narrow':
          case 'normal':
          case 'wide':
          case 'wider':
          case 'widest':
            w = widthConst[col.width];
            break;
          case 'rest':
            break;
          default:
            w = col.width ? parseInt(col.width, 0) : 80;
            break;
        }
        if (w) {
          h += ' width="' + w + '"';
        }
        h += '>' + (col.name || col.field || '') + '</th>';
        //组合单元格模板
        s += '<td';
        if (col.cellClass) {
          s += ' class="' + col.cellClass + '"';
        }
        if (w && this.showHeader === false) {
          s += ' width="' + w + '"';
        }
        s += '>';
        if (col.template) {
          s += col.template;
        } else if (col.field) {
          s += '{{item.' + col.field + '}}';
        }
        s += '</td>';
      }
      if (!this.html) {
        this.html = '<table class="ct-table table ';
        this.html += (this.tableCls || 'table-hover fixed') + '"';
        if (this.width) {
          this.html += ' width="' + this.width + '"';
        }
        this.html += '>';
        if (this.showHeader !== false) {
          this.html += '<thead';
          if (this.headerCls) {
            this.html += ' class="' + this.headerCls + '"';
          }
          this.html += '><tr>' + h + '</tr></thead>';
        }
        this.html += '<tbody></tbody></table>';
      }
      this.itemTemplate = '<tr>' + s + '</tr>';
      List.prototype.init.call(this);
    },
    bodySelector: 'tbody',
    itemSelector: 'tr'
  });
  return Grid;
});

//Tree-View
define('Sparrow/TreeView', [], function (require) {
  var ListView = require('Sparrow/ListView'),
    TreeModel = require('Sparrow/TreeModel'),
    Dialog = require('Sparrow/ModalDialog');
  var TreeView = ListView.extend({
    init: function () {
      if (!this.model) {
        this.Model = this.Model || TreeModel;
        this.model = new this.Model({
          itemsAttr: this.itemsAttr || 'childNodes',
          Record: this.Record,
          service: this.service
        });
      }
      this.itemRender = this.itemRender || template.compile(this.itemTemplate);
      var me = this;
      this.model.on('load', function (model, data) {
        if (me.renderBody) {
          me.renderBody(data);
        }
        me.setEmptyClass();
        me.fire('load', me, model, data);
      }).on('clear', function (model) {
        if (me.clearItemsUI) {
          me.clearItemsUI();
        }
        me.setEmptyClass();
        me.fire('clear', me, model);
      }).on('append', function (model, parent, rec) {
        if (me.renderItem) {
          me.renderItem(parent, rec, true);
        }
        me.setEmptyClass();
        me.fire('append', me, model, parent, rec);
      }).on('update', function (model, parent, rec) {
        if (me.renderItem) {
          me.renderItem(parent, rec, false);
        }
        me.fire('update', me, model, parent, rec);
      }).on('remove', function (model, parent, rec) {
        if (me.removeItemUI) {
          me.removeItemUI(rec);
        }
        me.setEmptyClass();
        if (me.showRemoveMessage !== false) {
          Dialog.showHint('删除成功！');
        }
        me.fire('remove', me, model, parent, rec);
      }).on('beforeremove', function (model, parent, rec) {
        return me.fire('beforeremove', model, parent, rec);
      });
    },
    findItemUI: function (rec) {
      var elms = this.bodyElement.childNodes,
        i;
      for (i = 0; i < elms.length; i++) {
        if (elms[i].__rec === rec) {
          return elms[i];
        }
      }
      return null;
    },
    selectItemUI: function (mix) {
      var bodyElm = this.bodyElement,
        elm = mix.__rec ? mix : this.findItemUI(mix);
      if (!bodyElm || !elm) {
        return;
      }
      if (this.fire('beforeselect', elm, elm.__rec) === false) {
        return;
      }
      var cls = this.activeClass || 'active';
      if (this.activeItem) {
        $(this.activeItem).removeClass(cls);
      }
      this.activeItem = elm;
      $(elm).addClass(cls);
      this.fire('itemselect', elm, elm.__rec);
    },
    removeItemUI: function (rec) {
      var elm = this.findItemUI(rec);
      if (elm) {
        var level = elm.__rec.__level;
        var siblings = $(elm).nextAll();
        var i, sbl;
        for (i = 0; i < siblings.length; i++) {
          sbl = siblings[i];
          if (sbl.__rec.__level <= level) {
            break;
          }
          $(sbl).remove();
        }
        $(elm).remove();
      }
    },
    renderChildNodes: function (childNodes, insertBeforeElm) {
      var i = 0,
        rec, html, jElm, arr;
      for (i = 0; i < childNodes.length; i++) {
        rec = childNodes[i];
        html = $.trim(this.itemRender({
          item: rec
        }));
        if (insertBeforeElm) {
          jElm = $(html).insertBefore(insertBeforeElm);
        } else {
          jElm = $(html).appendTo(this.bodyElement);
        }
        jElm[0].__rec = rec;
        arr = rec[this.model.childNodesAttr];
        if (arr) {
          this.renderChildNodes(arr, insertBeforeElm);
        }
      }
    },
    renderItem: function (parent, rec, isNew) {
      var bodyElm = this.bodyElement;
      if (!bodyElm) {
        return this;
      }
      if (isNew) {
        var insertBeforeElm;
        if (parent) {
          var pElm = this.findItemUI(parent);
          if (!pElm) {
            return;
          }
          var level = pElm.__rec.__level;
          var siblings = $(pElm).nextAll();
          var i, sbl;
          for (i = 0; i < siblings.length; i++) {
            sbl = siblings[i];
            if (sbl.__rec.__level <= level) {
              insertBeforeElm = sbl;
              break;
            }
          }
        }
        this.renderChildNodes([rec], insertBeforeElm);
      } else {
        var elm = this.findItemUI(rec);
        if (elm) {
          var html = $.trim(this.itemRender({
            item: rec
          }));
          var newNode = $(html);
          newNode[0].__rec = rec;
          $(elm).replaceWith(newNode);
        }
      }
    },
    renderBody: function (data) {
      if (!this.bodyElement) {
        return this;
      }
      $(this.bodyElement).empty();
      this.renderChildNodes(data);
    },
    append: function (parent, data, callback) {
      this.model.append(parent, data, false, callback);
    },
    update: function (rec, data, callback) {
      this.model.update(rec, data, callback);
    },
    remove: function (rec, callback) {
      this.model.remove(rec, callback);
    }
  });
  return TreeView;
});

//formHelper
define('Sparrow/formHelper', [], function (require) {
  var Dialog = require('Sparrow/ModalDialog');
  return {
    parsePersonID: function (ID) {
      var sId = $.trim(ID);
      var ret = {
        ID: sId
      };
      var reg = /^\d{17}(\d|X)$/;
      if (!reg.test(sId)) {
        return false;
      }
      //加权常量  
      var w = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2, 1];
      //校验码
      var vc = [1, 0, 10, 9, 8, 7, 6, 5, 4, 3, 2];
      var sum = 0,
        arr = sId.split('');
      if (arr[17].toLowerCase() === 'x') {
        arr[17] = 10;
      }
      var i;
      for (i = 0; i < 17; i++) {
        sum += w[i] * arr[i];
      }
      var vcIdx = sum % 11; // 得到验证码所位置
      if (parseInt(arr[17], 0) !== parseInt(vc[vcIdx], 0)) {
        return false;
      }
      //省份字典
      var pvcDict = {
        11: "北京",
        12: "天津",
        13: "河北",
        14: "山西",
        15: "内蒙古",
        21: "辽宁",
        22: "吉林",
        23: "黑龙江",
        31: "上海",
        32: "江苏",
        33: "浙江",
        34: "安徽",
        35: "福建",
        36: "江西",
        37: "山东",
        41: "河南",
        42: "湖北",
        43: "湖南",
        44: "广东",
        45: "广西",
        46: "海南",
        50: "重庆",
        51: "四川",
        52: "贵州",
        53: "云南",
        54: "西藏",
        61: "陕西",
        62: "甘肃",
        63: "青海",
        64: "宁夏",
        65: "新疆",
        71: "台湾",
        81: "香港",
        82: "澳门",
        91: "国外"
      };
      var pvc = sId.substr(0, 2);
      ret.province = pvcDict[pvc];
      if (ret.province === undefined) {
        return false;
      }
      ret.gender = (sId.substring(14, 17) % 2 === 0) ? '女' : '男';
      var y = parseInt(sId.substring(6, 10), 0);
      var m = parseInt(sId.substring(10, 12), 0);
      var d = parseInt(sId.substring(12, 14), 0);
      var birth = new Date(y, m - 1, d);
      if (isNaN(birth.getFullYear()) || isNaN(birth.getMonth()) || isNaN(birth.getDate())) {
        return false;
      }
      ret.birth = birth;
      ret.birthString = y + '年' + m + '月' + d + '日';
      return ret;
    },
    verify: function (formElm, selector, fn) {
      function handleError(input, group, message) {
        group.addClass('has-error');
        input[0].focus();
        if (message) {
          Dialog.showHint(message, 'red-bg');
        }
      }
      if (arguments.length > 1) {
        if ($.isFunction(selector)) {
          fn = selector;
          selector = undefined;
        }
      }
      var jForm, arrInputs;
      if ($.type(formElm) === "string") {
        jForm = $(formElm);
      } else {
        jForm = formElm.jquery ? formElm : $(formElm);
      }
      if (!selector || $.type(selector) === "string") {
        arrInputs = $(selector || 'input,textarea,select', jForm);
      } else if (selector.length) {
        arrInputs = selector;
      }
      if (!arrInputs || !arrInputs.length) {
        return;
      }
      $('.form-group', jForm).removeClass('has-error');
      var i, v, vt, jInput, jGroup, hasError, errMsg, bPassword;
      var verifyType, reg, length, staticLength, minValue, maxValue, maxLength, minLength, decimalLenth;
      for (i = 0; i < arrInputs.length; i++) {
        jInput = $(arrInputs[i]);
        bPassword = jInput && (jInput.length > 0) && (jInput[0].type == 'password');
        jGroup = jInput.parent('.form-group');
        v = jInput.val();
        vt = $.trim(v);
        if (v !== vt) {
          if (!bPassword) jInput.val(vt);
          v = vt;
        }
        length = v.length;
        verifyType = jInput.attr('data-verify');
        errMsg = staticLength = maxLength = minLength = undefined;
        if ($.isFunction(fn) && fn(jInput[0], jGroup[0], v) === false) {
          hasError = true;
          break;
        }
        if ((jInput.hasClass('necessary') || jGroup.hasClass('necessary')) && bPassword && ((jInput.val().length < 6) || (jInput.val().length > 16))) {
          errMsg = $('label', jGroup).text() + '长度不能' + ((jInput.val().length < 6) ? '小于6个字符' : '大于16个字符。');
          hasError = true;
          break;
        }
        if ((jInput.hasClass('necessary') || jGroup.hasClass('necessary')) && ((bPassword && (jInput.val() === '')) || (!bPassword && (!v || ($.trim(v) === ''))))) {
          errMsg = ($('label', jGroup).text() || '该值') + '不能为空。';
          hasError = true;
          break;
        }
        if (v !== '') {
          switch (verifyType) {
            case "mobile-phone":
              if (!mobileIsValid(v)) {
                hasError = true;
                errMsg = '请输入有效的11位手机号码。';
              }
              break;
            case "numeric":
              reg = /^\d+$/;
              minValue = parseInt(jInput.attr('data-min-value'), 0);
              maxValue = parseInt(jInput.attr('data-max-value'), 0);
              var intErrorFormat = jInput.attr('verify-tip-format');
              if (!(reg.test(v)) || (!isNaN(minValue) && v < minValue) || (!isNaN(maxValue) && v > maxValue)) {
                hasError = true;
                if ($.isFunction(fn) && fn(jInput[0]))
                  errMsg = fn(jInput[0]);
                else {
                  if (intErrorFormat) {
                    errMsg = intErrorFormat.replace('{min}', minValue).replace('{max}', maxValue);
                  } else {
                    errMsg = '请输入';
                    if (!isNaN(minValue) || !isNaN(maxValue)) {
                      if (!isNaN(minValue)) {
                        errMsg += '大于' + (minValue - 1);
                      }
                      if (!isNaN(maxValue)) {
                        if (!isNaN(minValue)) {
                          errMsg += '，并且';
                        }
                        errMsg += '小于' + (maxValue + 1);
                      }
                    } else {
                      errMsg += '正确';
                    }
                    errMsg += '的' + ((jInput.attr('number-type') == 'int') ? '整数' : '数值') + '。';
                  }
                }
              }
              break;
            case "decimalic":
              reg = /^[0-9]+([.][1-9]{0,2})?$/;
              decimalLenth = parseInt(jInput.attr('decimal-len-value'), 0);
              if (decimalLenth > 0)
                reg = new RegExp("^[0-9]+([.][0-9]{1," + decimalLenth + "})?$");
              if (!(reg.test(v))) {
                hasError = true;
                errMsg = '请输入';
                if (!isNaN(decimalLenth)) {
                  errMsg += '最多' + decimalLenth + '位小数';
                } else {
                  errMsg += '最多2位小数';
                }
                errMsg += '的数值。';
              }
              break;
            case 'person-id':
              if (!this.parsePersonID(v)) {
                hasError = true;
                errMsg = '请输入有效的18位身份证号码。';
              }
              break;
            default:
              length = v.length;
              staticLength = parseInt(jInput.attr('data-static-length'), 0);
              if (isNaN(staticLength)) {
                minLength = parseInt(jInput.attr('data-min-length'), 0);
                maxLength = parseInt(jInput.attr('data-max-length'), 0);
                if ((!isNaN(minLength) && length < minLength) || (!isNaN(maxLength) && length > maxLength)) {
                  hasError = true;
                  errMsg = '请输入长度';
                  if (!isNaN(minLength)) {
                    errMsg += '大于' + minLength;
                  }
                  if (!isNaN(maxLength)) {
                    if (!isNaN(minLength)) {
                      errMsg += '，并且';
                    }
                    errMsg += '小于' + maxLength;
                  }
                  errMsg += '的有效字符';
                }
              } else {
                if (length !== staticLength) {
                  hasError = true;
                  errMsg = '请输入长度为' + staticLength + '的有效字符。';
                }
              }
          }
          if (hasError) {
            break;
          }
        }
      }
      if (hasError) {
        handleError(jInput, jGroup, errMsg);
        return false;
      }
      return true;
    }
  };
});

//Dropdown-Input
define('Sparrow/DropdownInput', [], function (require) {
  var View = require('Sparrow/View');
  var lastDropPanel; //记录最后一次弹出的下拉面板
  //清空所有的弹出层。通常是弹出后点击空白区域。
  var clearDrop = function (elm) {
    $(elm || '.ct-dropdown-group .ct-dropdown-panel').css('display', 'none');
  };
  //所有区域的点击, 隐藏弹出区域
  $(document).on('click.ct.input.dropdown', function () {
    clearDrop();
  });
  //若是点击在当前区域，不继续触发默认事件
  $(document).on('click.ct.input.dropdown', '.ct-dropdown-group>*', function (e) {
    e.stopPropagation();
  });
  //在弹出区域点击时，不触发下边的失去焦点事件
  var holdClearOnce;
  $(document).on('mousedown.ct.input.dropdown', '.ct-dropdown-panel', function () {
    holdClearOnce = true;
  });
  $(document).on('mousedown.ct.input.dropdown', '.ct-dropdown-input', function () {
    holdClearOnce = false;
    clearDrop();
  });
  //输入区域失去焦点则隐藏
  $(document).on('blur.ct.input.dropdown', '.ct-dropdown-input', function () {
    if (holdClearOnce) {
      holdClearOnce = false;
      return;
    }
    clearDrop();
  });
  var Input = View.extend({
    render: function () {
      var me = this,
        elm = this.element;
      if ($.type(elm) === 'string') {
        elm = this.element = $(elm)[0];
      }
      if (!elm || !$(elm).hasClass('ct-dropdown-group')) {
        return this;
      }
      var iptElm = $('.ct-dropdown-input', elm)[0];
      this.inputElement = iptElm;
      if (!iptElm) {
        return this;
      }
      var bElm = $('.ct-dropdown-panel', elm)[0] || elm;
      if (this.dropdownPanel && this.dropdownPanel.render) {
        this.dropdownPanel.render(bElm);
      }
      $('.ct-dropdown-panel', elm).css('display', 'none');
      View.prototype.render.call(this);
      $(elm).on('click.ct.input.dropdown', '[click-operation="dropdown"]', function () {
        me.expand();
      });
    },
    collapse: function () {
      clearDrop(this.getOne('.ct-dropdown-panel'));
    },
    expand: function () {
      var jPnl = this.get('.ct-dropdown-panel');
      if (lastDropPanel && lastDropPanel !== jPnl[0]) {
        clearDrop(lastDropPanel);
      }
      lastDropPanel = jPnl[0];
      jPnl.css('display', 'block');
    },
    val: function (v) {
      return arguments.length ? $(this.inputElement).val(v) : $(this.inputElement).val();
    }
  });
  //附加
  Input.attach = function (elm) {
    return new Input({
      element: elm
    });
  };
  return Input;
});

//QueryInput
define('Sparrow/QueryInput', [], function (require) {
  var Input = require('Sparrow/DropdownInput');
  var keyTimer;
  var QueryInput = Input.extend({
    render: function () {
      Input.prototype.render.call(this);
      if (!this.element) {
        return;
      }
      //输入的时候触发事件
      var me = this;
      $(this.element).on('keydown.ct.input.dropdown', '.ct-dropdown-input', function (event) {
        if (event.keyCode < 46) {
          return;
        }
        var input = this;
        if (keyTimer) {
          clearTimeout(keyTimer);
        }
        keyTimer = setTimeout(function () {
          if (input.value.length > 0) {
            me.fire('requirequery', input.value, input, me);
          } else {
            me.collapse();
          }
        }, 500);
      });
    }
  });
  QueryInput.attach = function (elm) {
    return new QueryInput(elm);
  };
  return QueryInput;
});

//Dropdown-List-Input
define('Sparrow/DropdownListInput', [], function (require) {
  var DropdownInput = require('Sparrow/DropdownInput');
  var ListView = require('Sparrow/ListView');

  var keyTimer;
  var Input = DropdownInput.extend({
    listHtml: '<div class="list-group"></div>',
    listItemTemplate: '<a class="list-group-item">{{item.name}}</a>',
    renderSelectValue: function (rec) {
      this.val(rec.name);
      $(this.inputElement).addClass('has-value');
      this.record = this.inputElement.record = rec;
      this.fire('itemselect', this, rec);
    },
    renderList: function () {
      var me = this;
      var list = new ListView({
        html: this.listHtml,
        itemTemplate: this.listItemTemplate,
        service: {
          load: this.queryFn
        },
        canSelect: true,
        itemListeners: [
          [
            'click',
            function (event, elm, rec) {
              if (event.cancelBubble) {
                return;
              }
              me.collapse();
              me.renderSelectValue(rec);
            }
          ]
        ]
      });
      this.dropdownPanel = list;
      list.model.on('load', function (model, data) {
        if (data && data.length) {
          me.expand();
        } else {
          me.collapse();
        }
      });
      return list;
    },
    render: function () {
      //创建查找列表
      var list = this.renderList();
      DropdownInput.prototype.render.call(this);
      $(list.element).addClass('ct-dropdown-panel same-width');
      if (!this.element) {
        return;
      }
      //输入的时候触发事件
      var me = this;
      $(this.element).on('keydown.ct.input.dropdown', '.ct-dropdown-input', function (event) {
        if (event.keyCode < 46 && event.keyCode != 8) {
          return;
        }
        var input = this;
        $(this).removeClass('has-value');
        if (keyTimer) {
          clearTimeout(keyTimer);
        }
        keyTimer = setTimeout(function () {
          var v = $.trim(input.value);
          input.record = undefined;
          me.record = undefined;
          if (v !== '') {
            list.load($.trim(v));
          } else {
            me.collapse();
          }
        }, 500);
      });
    },
    clear: function () {
      var input = this.inputElement;
      input.record = undefined;
      $(input).removeClass('has-value').val('');
    }
  });
  Input.attach = function (elm) {
    return new Input({
      element: elm
    });
  };
  return Input;
});

define('Sparrow/CalendarPanel', [], function (require) {
  var View = require('Sparrow/View'),
    arrMonthDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  var CalendarPanel = View.extend({
    fillCells: function () {
      var y = this.year,
        m = this.month;
      var today = new Date(),
        todayY = today.getFullYear(),
        todayM = today.getMonth() + 1,
        todayD = today.getDate();
      var selDate = this.value,
        selY, selM, selD;
      if (selDate) {
        selY = selDate.getFullYear();
        selM = selDate.getMonth() + 1;
        selD = selDate.getDate();
      }
      $('.calendar-body td', this.element).removeClass('today selected');
      $('.nav-header-text', this.element).html(y + "&nbsp;年" + "&nbsp;" + m + "&nbsp;月");
      var iMonthDays = ((m === 2) && (((y % 4 === 0) && (y % 100 !== 0)) || (y % 400 === 0))) ? 29 : arrMonthDays[m - 1];
      var dFirstDate = new Date(y, m - 1, 1);
      var d = dFirstDate.getDay();
      var i, cell, jCell, sValue;
      for (i = 0; i < 42; i++) {
        cell = this.cells[i];
        jCell = $(cell);
        sValue = ((i > d - 1) && (i < iMonthDays + d)) ? i - d + 1 : null;
        cell.__value = sValue;
        if (sValue) {
          jCell.removeClass('empty').html(sValue);
          if (todayY === y && todayM === m && todayD === sValue) {
            jCell.addClass('today');
          }
          if (selY === y && selM === m && selD === sValue) {
            jCell.addClass('selected');
          }
        } else {
          jCell.addClass('empty').html("&nbsp");
        }
      }
    },
    setDate: function (v) {
      this.value = v;
      this.year = v.getFullYear();
      this.month = v.getMonth() + 1;
      this.fillCells();
    },
    render: function (pElm) {
      pElm = pElm || this.parent || this.parentElement;
      if (!pElm) {
        return;
      }
      var jWrap = $('<div class="ct-dropdown-calendar ct-box-shadow-small"></div>');
      var jNav = $('<div class="nav-header ct-box-shadow-tiny">' + '<div class="nav-header-left">' + '<span class="glyphicon glyphicon-backward prev-year" />' + '<span class="glyphicon glyphicon-triangle-left prev-month" />' + '</div>' + '<div class="nav-header-text"></div>' + '<div class="nav-header-right">' + '<span class="glyphicon glyphicon-triangle-right next-month" />' + '<span class="glyphicon glyphicon-forward next-year"/>' + '</div>' + '</div>').appendTo(jWrap);
      //显示星期头
      $('<table class="week-header" cellPadding="0" cellSpacing="0" width="100%">' + '<tr><td>日</td><td>一</td><td>二</td><td>三</td><td>四</td><td>五</td><td>六</td></tr>' + '</table>').appendTo(jWrap);
      var jCldBody = $('<table class="calendar-body" cellPadding="0" cellSpacing="0" width="100%"></table>').appendTo(jWrap);
      this.cells = [];
      var me = this,
        tbody = jCldBody[0];
      var i, j, tr, td;
      for (i = 0; i < 6; i++) {
        tr = tbody.insertRow(i);
        for (j = 0; j < 7; j++) {
          td = tr.insertCell(j);
          this.cells.push(td);
        }
      }
      //导航交互事件
      jNav.on('click', 'span', function () {
        var jElm = $(this);
        if (jElm.hasClass('prev-year')) {
          me.year--;
        } else if (jElm.hasClass('prev-month')) {
          me.month--;
          if (me.month < 1) {
            me.month = 12;
            me.year--;
          }
        } else if (jElm.hasClass('next-month')) {
          me.month++;
          if (me.month > 12) {
            me.month = 1;
            me.year++;
          }
        } else if (jElm.hasClass('next-year')) {
          me.year++;
        }
        me.fillCells();
      });
      //日期选择事件
      jCldBody.on('click', 'td:not(.empty)', function () {
        var jElm = $(this);
        $('td', jCldBody).removeClass('selected');
        jElm.addClass('selected');
        var v = new Date();
        v.setFullYear(me.year, me.month - 1, parseInt(jElm.text(), 0));
        me.value = v;
        me.fire('change', me, v);
      });
      jWrap.appendTo(pElm);
      this.element = jWrap[0];
      this.fillCells();
    }
  }, function () {
    this.date = new Date();
    this.year = this.date.getFullYear();
    this.month = this.date.getMonth() + 1;
  });
  CalendarPanel.attach = function (elm) {
    return new CalendarPanel({
      element: elm
    });
  };
  return CalendarPanel;
});

//Dropdown-Date-Input
define('Sparrow/DropdownDateInput', [], function (require) {
  var View = require('Sparrow/View'),
    DropdownInput = require('Sparrow/DropdownInput'),
    CalendarPanel = require('Sparrow/CalendarPanel');

  var Input = DropdownInput.extend({
    expand: function () {
      if (this.value && this.value !== this.calendar.value) {
        this.calendar.setDate(this.value);
      }
      DropdownInput.prototype.expand.call(this);
    },
    render: function () {
      //创建查找列表
      var calendar = new CalendarPanel();
      this.calendar = this.dropdownPanel = calendar;
      DropdownInput.prototype.render.call(this);
      var iptElm = this.inputElement;
      iptElm.__dateInput = this;
      $(iptElm).attr('readOnly', true);
      $(calendar.element).addClass('ct-dropdown-panel');
      if (!this.element) {
        return;
      }
      //输入的时候触发事件
      var me = this;
      calendar.on('change', function (obj, value) {
        var text = me.getDateString(value);

        me.value = value;
        me.text = text;
        $(iptElm).val(text);
        me.fire('change', this, value, text);
        me.collapse();
      });
    },
    clear: function () {
      this.value = undefined;
      this.text = undefined;
      $(this.inputElement).val(null);
    },
    setDate: function (v) {
      if (!v || v === '') {
        return;
      }
      var y, m, d;
      if ($.type(v) === 'string') {
        var arr = $.trim(v).split('-');
        if (arr.length !== 3) {
          return;
        }
        y = parseInt(arr[0], 0);
        m = parseInt(arr[1], 0);
        d = parseInt(arr[2], 0);
        if (isNaN(y) || isNaN(m) || m > 12 || m < 1 || isNaN(d) || d < 1 || d > 31) {
          return;
        }
        v = new Date();
        v.setFullYear(y, m - 1, d);
        if (!v) {
          return;
        }
      }
      this.value = v;
      this.calendar.setDate(v);

      var text = this.getDateString(v);
      this.text = text;
      $(this.inputElement).val(text);
    },
    getDateString: function (value) {
      var y = value.getFullYear(),
        m = value.getMonth() + 1,
        d = value.getDate(),
        text = y + '-' + (m < 10 ? '0' + m : m) + '-' + (d < 10 ? '0' + d : d);

      return text;
    }
  });
  Input.attach = function (elm) {
    return new Input({
      element: elm
    });
  };
  return Input;
});

//Ajax
define('Sparrow/ajax', [], function (require) {
  var Dialog = require('Sparrow/ModalDialog');
  var ajax = {
    request: function (o) {
      var url = o.url,
        reqType = o.method || (o.data ? "POST" : "GET");
      var successFn = o.success || o.callback;

      function errorFn(hr, code, msg, parseDetailMsg, data) {
        if ((!code && !msg) || parseDetailMsg !== false) {
          var rspJson = hr.responseJSON;
          var s = hr.responseText;
          if (!rspJson) {
            if (s.indexOf('{') >= 0 && s.indexOf('errorMsg') >= 0) {
              try {
                rspJson = JSON.parse(s);
              } catch (ignore) {}
            }
          }
          if (rspJson && rspJson.errorMsg) {
            code = rspJson.errorCode;
            msg = (msg || '') + '<br>' + rspJson.errorMsg;
          }
        }
        if (!msg) {
          switch (hr.status) {
            case 0:
              return false;
            case -1:
              msg = "请求超时";
              break;
            case 400:
              msg = "400错误：请求失败";
              break;
            case 403:
              msg = "403错误：禁止访问";
              break;
            case 404:
              msg = "404错误：资源未找到";
              break;
            case 500:
              msg = "500错误：服务器内部错误";
              break;
            case 503:
              msg = "503错误：服务器不可用";
              break;
            default:
              msg = "未知错误";
              break;
          }
        }
        if (o.error) {
          o.error(msg, hr, code, parseDetailMsg, data);
        } else if (code == 'HTTP_401') {
          if (window.sessionStorage) {
            sessionStorage.clear();
          }
          window.location.replace("/logout");
        } else if (hr.status === 400 && hr.responseJSON && hr.responseJSON.message) {
          Dialog.showMessage({
            title: '警告', //'请求出错' + (code ? '(' + code + ')' : ''),
            message: hr.responseJSON.message
          });
        } else {
          Dialog.showMessage({
            title: '警告', //'请求出错' + (code ? '(' + code + ')' : ''),
            message: msg
          });
        }
      }
      if (o.noCache !== false) {
        url += ((url.indexOf('?') < 0) ? '?' : '&') + 'ts=' + new Date().getTime();
      }
      $.ajax({
        async: o.async === false ? false : true,
        url: url,
        type: reqType,
        data: (o.data !== undefined && o.data !== null) ? JSON.stringify(o.data) : (o.data || undefined),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        error: errorFn,
        success: function (data, hr) {
          if (data) {
            if (data.success) {
              if (successFn) {
                successFn(data.data, o.callbackArgs);
              }
            } else {
              errorFn(hr, data.errorCode, data.errorMsg, false, data);
            }
          }
        }
      });
    }
  };
  return ajax;
});


jQuery.fn.isIE = function () {
  var reg = /(msie\s(\d+)\.0;)|((Trident)(.*?)rv:(\d+))/i,
    browserInfo = reg.exec(navigator.userAgent);

  if (browserInfo !== null) {
    if (browserInfo[6]) {
      return parseInt(browserInfo[6]);
    } else if (browserInfo[2]) {
      return parseInt(browserInfo[2]);
    }
  } else {
    return false;
  }
};

jQuery.fn.buildDate = function (val) {
  if (Object.prototype.toString.call(val) === "[object Date]") {
    return val;
  }

  var ie = this.isIE();

  if (ie === false) {
    return new Date(val);
  } else {
    return new Date(val.replace(/\-/g, '/'));
  }

  return val;
};

//让ArtTemplate显示时间，使用方法：{{itrm.dateTime | formatDateTime:"yyyy-MM-dd hh:mm:ss"}}
template.helper('formatDateTime', function (dateTime, dateTimeFormat) {
  if (!dateTime) return '';
  var date = new Date(dateTime);
  var map = {
    "M": date.getMonth() + 1, //月份
    "d": date.getDate(), //日
    "h": date.getHours(), //小时
    "m": date.getMinutes(), //分
    "s": date.getSeconds(), //秒
    "q": Math.floor((date.getMonth() + 3) / 3), //季度
    "S": date.getMilliseconds() //毫秒
  };

  var format = dateTimeFormat.replace(/([yMdhmsqS])+/g, function (all, t) {
    var v = map[t];
    if (v !== undefined) {
      if (all.length > 1) {
        v = '0' + v;
        v = v.substr(v.length - 2);
      }
      return v;
    } else if (t === 'y') {
      return (date.getFullYear() + '').substr(4 - all.length);
    }
    return all;
  });
  return format;
});

function mobileIsValid(mobile) {
  var reg = /^1(3|4|5|6|7|8|9)[0-9]{9}$/;
  return reg.test(mobile);
}

//添加动态请求脚本相应版本信息，解决缓存问题
;
(function () {
  seajs.config({
    map: [
      [/^(?!.*Sparrow\/|.*IScroll\/|.*\.html$|.*\.tpl$).*$/i, function (url) {
        var version;

        if (/^((?!.*lib\/3rd\/seajs\/|.*\/treegrid)).*$/i.test(url) == false) { //合并脚本已经添加版本，此处无需再处理里面相关脚本
          return url;
        }

        if (/\/js\/frame\/page-frame|\/cloudt\//i.test(url)) { //部分平台脚本通过require获取
          version = window.cloudtVersion;
        } else {
          version = window.productVersion;
        }

        return url += (url.indexOf('?') === -1 ? '?' : '&') + '__ver=' + (version || '');
      }]
    ]
  });
})();
