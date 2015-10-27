/* ------------------------------------------
imgover
--------------------------------------------*/
(function(){
    window.addEventListener("load",initRollovers,false);
    function initRollovers() {
        if (!document.getElementById && document.createElement) return;
        var thc = document.getElementsByTagName('img');
        imgReplace(thc, 'img');
        thc = document.getElementsByTagName('input');
        imgReplace(thc, 'input');
        thc=null;
    }
    function imgReplace(hc, el){
        var loader = new Array();
        var n = hc.length;
        for (var i = 0; i < n; i++) {
            if (hc[i].className.match(/(^imgover\s|^imgover$|\simgover\s|\simgover$)/)){
                switch(el){
                    case 'input': if(hc[i].getAttribute('type')!=='image') return;
                                    hc[i].onfocus = function (){
                                        this.setAttribute('src', this.getAttribute('data-src'));
                                    };
                                hc[i].onblur = function (){
                                    this.setAttribute('src', this.getAttribute('data-src'));
                                };
                    default     : var src = hc[i].getAttribute('src');
                                var hsrc = src.replace(/^(.*)(\.[^.]*)$/,function(str, path, extension){return path+"_on"+extension;});
                                loader[loader.length] = new Image();
                                loader[loader.length-1].src = hsrc; hc[i].setAttribute('data-src', src);
                                hc[i].setAttribute('data-osrc', hsrc);
                                hc[i].onmouseover = function (){
                                    this.setAttribute('src', this.getAttribute('data-osrc'));
                                };
                                hc[i].onmouseout = function (){
                                    this.setAttribute('src', this.getAttribute('data-src'));
                                };
                                break;
                }
            }
        }
        n = null;
    }
    function addEventListener( EventName, fn, useCapture) {
        if(window.addEventListener) window.addEventListener( EventName, fn, false );
        else if(window.attachEvent) window.attachEvent( "on"+EventName, fn );
        else window["on"+EventName] = fn;
    }
})();

/* Information
----------------------------------------------
File Name : smoothscroll.js
URL : http://www.atokala.com/
Copyright : (C)atokala
Author : Masahiro Abe
--------------------------------------------*/
var ATScroll = function(vars) {
    //�R���X�g���N�^
    var _self = this;
    var _timer;

    //�f�t�H���g�I�v�V����
    var options = {
        noScroll : 'noSmoothScroll',
        setHash : false,
        duration : 800,
        interval : 10,
        animation : 'liner',
        callback : function(){}
    };

    //�I�v�V�����̏㏑���ݒ�
    this.config = function(property) {
        for (var i in property) {
            //�ݒ肳��Ă��Ȃ����͏㏑�����Ȃ�
            if (!vars.hasOwnProperty(i)) {
                continue;
            }
            options[i] = property[i];
        }
    }

    //�u���E�U�`�F�b�N
    var browser = {
        ua : function() {
            return navigator.userAgent;
        },
        //IE
        ie : function() {
            return browser.ua.indexOf('MSIE') >= 0;
        },
        //IE6
        ie6 : function() {
            return browser.ua.indexOf('MSIE 6') >= 0;
        },
        //�W�����[�h
        ieStandard : function() {
            return (document.compatMode && document.compatMode == 'CSS1Compat');
        }
    };

    //�X�N���[���ʒu�̎擾
    var scroll = {
        top : function() {
            return (document.documentElement.scrollTop || document.body.scrollTop);
        },
        left : function() {
            return (document.documentElement.scrollLeft || document.body.scrollLeft);
        },
        width : function() {
            if (browser.ie && !browser.ieStandard) {
                return document.body.scrollWidth;
            }
            //���_���u���E�U
            else {
                return document.documentElement.scrollWidth;
            }
        },
        height : function() {
            if (browser.ie && !browser.ieStandard) {
                return document.body.scrollHeight;
            }
            //���_���u���E�U
            else {
                return document.documentElement.scrollHeight;
            }
        }
    };

    //�E�C���h�E�̃T�C�Y�擾
    var inner = {
        width : function() {
            //���_��
            if (window.innerWidth) {
                return window.innerWidth;
            }
            //IE
            else if (browser.ie) {
                //IE6 && �W�����[�h
                if (browser.ie6 && browser.ieStandard) {
                    return document.documentElement.clientWidth;
                }
                //IE6�݊����[�h && ��IE
                else {
                    //IE6�ȉ�
                    if (!document.documentElement.clientWidth) {
                        return document.body.clientWidth;
                    }
                    //IE6�ȏ�
                    else {
                        return document.documentElement.clientWidth;
                    }
                }
            }
        },
        height : function() {
            //���_��
            if (window.innerHeight) {
                return window.innerHeight;
            }
            //IE
            else if (browser.ie) {
                //IE6 && �W�����[�h
                if (browser.ie6 && browser.ieStandard) {
                    return document.documentElement.clientHeight;
                }
                //IE6�݊����[�h && ��IE
                else {
                    //IE6�ȉ�
                    if (!document.documentElement.clientHeight) {
                        return document.body.clientHeight;
                    }
                    //IE6�ȏ�
                    else {
                        return document.documentElement.clientHeight;
                    }
                }
            }
        }
    };

    //�I�u�W�F�N�g�ʒu�̎擾
    this.getElementPosition = function(ele) {
        var obj = new Object();
        obj.x = 0;
        obj.y = 0;

        while(ele) {
            obj.x += ele.offsetLeft || 0;
            obj.y += ele.offsetTop || 0;
            ele = ele.offsetParent;
        }
        return obj;
    }


    //�C�x���g�ǉ�
    this.addEvent = function(eventTarget, eventName, func) {
        // ���_���u���E�U
        if(eventTarget.addEventListener) {
            eventTarget.addEventListener(eventName, func, false);
        }
        // IE
        else if(window.attachEvent) {
            eventTarget.attachEvent('on'+eventName, function(){func.apply(eventTarget);});
        }
    }

    //�C�x���g�L�����Z��
    this.eventCancel = function(e) {
        //for IE
        if (!e) e = window.event;

        if (e.preventDefault) {
            e.preventDefault()
        }
        else{
            e.returnValue = false;
        }
    }

    this.setSmoothScrollY = function(e) {
        _self.eventCancel(e);
        clearTimeout(_timer);
        var hash = this.hash;
        var idName = hash.replace('#', '');
        var targetId = document.getElementById(idName);

        //var toX = _self.getElementPosition(targetId).x;
        var toY = _self.getElementPosition(targetId).y;

        //�����N�悪�͈͊O��
        var limitH = scroll.height() - inner.height();
        if (limitH < toY) {
            toY = limitH;
        }
        if (toY < 0) {
            toY = 0;
        }

        if (options.setHash) {
            options.callback = function(){
                window.location.hash = hash;
            }
        }
        _self.scroll(toY);
    }

    var easing = {
        /*
        time = ���ݕb (����
        begin = �ŏ��̒l
        change = �ϓ�����l
        duration = ���b�����ē�����
        */
        liner : function(t, b, c, d) {
            return c * t / d + b;
        },
        quinticIn : function(t, b, c, d) {
            t /= d;
            return c * t * t * t * t * t + b;
        },
        quinticOut : function(t, b, c, d) {
            t /= d;
            t = t - 1;
            return -c * (t * t * t * t - 1) + b;
        }
    };

    this.scroll = function(toY) {
        var now = new Date();
        var fromY = scroll.top();
        var run = function() {
            var time = new Date() - now;
            var next = easing[options.animation](time, fromY, toY - fromY, options.duration);

            if (time < options.duration - options.interval) {
                window.scrollTo(scroll.left(), parseInt(next));
                _timer = setTimeout(function(){run()}, options.interval);
            }
            else {
                clearTimeout(_timer);
                window.scrollTo(scroll.left(), parseInt(toY));
                options.callback();
            }
        }
        run();
    }

    this.load = function() {
        //�R���X�g���N�^
        this.config(vars);

        this.addEvent(window, 'load', function() {
            var allLinks = document.links;

            //�y�[�W�������N
            for (var i = 0; i < allLinks.length; i++) {
                var a = allLinks[i]
                var hash = a.href.split('#')[1];

                if (a.className.indexOf(options.noScroll) >= 0) {
                    continue;
                }
                if (a.href.match('#') && document.getElementById(hash)) {
                    _self.addEvent(a, 'click', _self.setSmoothScrollY);
                }
            }
        });
    }
};
var atscroll = new ATScroll();
atscroll.load();
