
; (function ($, window, undefined) {

    'use strict';

    var $window = $(window),
        Modernizr = window.Modernizr;


    Modernizr.addTest('csstransformspreserve3d', function () {
        var prop = Modernizr.prefixed('transformStyle');
        var val = 'preserve-3d';
        var computedStyle;
        if (!prop) return false;

        prop = prop.replace(/([A-Z])/g, function (str, m1) { return '-' + m1.toLowerCase(); }).replace(/^ms-/, '-ms-');

        Modernizr.testStyles('#modernizr{' + prop + ':' + val + ';}', function (el, rule) {
            computedStyle = window.getComputedStyle ? getComputedStyle(el, null).getPropertyValue(prop) : '';
        });

        return (computedStyle === val);
    });


    var $event = $.event,
        $special,
        resizeTimeout;
    // 定義一個名為 debouncedresize 的特殊事件
    $special = $event.special.debouncedresize = {
        // 設置事件處理函數
        setup: function () {
            $(this).on("resize", $special.handler);
        },
        // 移除事件處理函數
        teardown: function () {
            $(this).off("resize", $special.handler);
        },
        // 實際的事件處理函數
        handler: function (event, execAsap) {
            // 保存上下文
            var context = this,
                args = arguments,
                dispatch = function () {
                    // 設置正確的事件類型
                    event.type = "debouncedresize";
                    $event.dispatch.apply(context, args);
                };

            if (resizeTimeout) {
                clearTimeout(resizeTimeout);
            }

            execAsap ?
                dispatch() :
                // 設置定時器以延遲執行事件處理函數
                resizeTimeout = setTimeout(dispatch, $special.threshold);
        },
        // 定義延遲時間的閾值
        threshold: 150
    };

    // 定義一個名為 BookBlock 的 jQuery 插件
    $.BookBlock = function (options, element) {
        this.$el = $(element);
        this._init(options);
    };

    // 插件的默認選項
    $.BookBlock.defaults = {
        // 翻頁的方向，可以是 'vertical' 或 'horizontal'
        orientation: 'vertical',
        // 文字方向，可以是 'ltr'（從左到右）或 'rtl'（從右到左）
        direction: 'ltr',
        // 翻頁過渡的速度（毫秒）
        speed: 1000,
        // 翻頁過渡的緩動函數
        easing: 'ease-in-out',
        // 如果設置為 true，翻頁的頁面和兩側將有一個覆蓋以模擬陰影
        shadows: true,
        // 兩側的“陰影”（當翻頁頁面在其上時）的透明度值
        // 值：0.1 - 1
        shadowSides: 0.2,
        // 翻頁頁面的“陰影”（當它正在翻轉時）的透明度值
        // 值：0.1 - 1
        shadowFlip: 0.1,
        // 是否在到達末尾時顯示第一項
        circular: false,
        // 觸發 next() 函數的選擇器
        nextEl: '',
        // 觸發 prev() 函數的選擇器
        prevEl: '',
        // 自動播放。如果為 true，將覆寫 circular 選項為 true
        autoplay: false,
        // 自動切換頁面之間的時間（毫秒），如果 autoplay 為 true
        interval: 3000,
        // 翻頁過渡之後的回調函數
        // old 是前一項的索引
        // page 是當前項的索引
        // isLimit 為 true 表示當前頁是最後一頁（或第一頁）
        onEndFlip: function (old, page, isLimit) { return false; },
        // 翻頁過渡之前的回調函數
        // page 是當前項的索引
        onBeforeFlip: function (page) { return false; }
    };

    $.BookBlock.prototype = {
        _init: function (options) {
            // 選項
            this.options = $.extend(true, {}, $.BookBlock.defaults, options);
            // 方向類別
            this.$el.addClass('bb-' + this.options.orientation);
            // 項目
            this.$items = this.$el.children('.bb-item').hide();
            // 總項目數
            this.itemsCount = this.$items.length;
            // 當前項目的索引
            this.current = 0;
            // 上一個項目的索引
            this.previous = -1;
            // 顯示第一個項目
            this.$current = this.$items.eq(this.current).show();
            // 獲取 this.$el 的寬度
            // 這將有助於創建翻轉布局
            this.elWidth = this.$el.width();
            var transEndEventNames = {
                'WebkitTransition': 'webkitTransitionEnd',
                'MozTransition': 'transitionend',
                'OTransition': 'oTransitionEnd',
                'msTransition': 'MSTransitionEnd',
                'transition': 'transitionend'
            };
            this.transEndEventName = transEndEventNames[Modernizr.prefixed('transition')] + '.bookblock';
            // 支援 CSS 3D 轉換和 CSS 過渡以及 Modernizr.csstransformspreserve3d
            this.support = Modernizr.csstransitions && Modernizr.csstransforms3d && Modernizr.csstransformspreserve3d;
            // 初始化/綁定一些事件
            this._initEvents();
            // 開始幻燈片播放
            if (this.options.autoplay) {
                this.options.circular = true;
                this._startSlideshow();
            }
        },
        _initEvents: function () {
            var self = this;

            if (this.options.nextEl !== '') {
                $(this.options.nextEl).on('click.bookblock touchstart.bookblock', function () { self._action('next'); return false; });
            }

            if (this.options.prevEl !== '') {
                $(this.options.prevEl).on('click.bookblock touchstart.bookblock', function () { self._action('prev'); return false; });
            }

            $window.on('debouncedresize', function () {
                // 更新寬度值
                self.elWidth = self.$el.width();
            });
        },
        _action: function (dir, page) {
            this._stopSlideshow();
            this._navigate(dir, page);
        },
        _navigate: function (dir, page) {
            if (this.isAnimating) {
                return false;
            }

            // 回調觸發
            this.options.onBeforeFlip(this.current);

            this.isAnimating = true;
            // 更新當前值
            this.$current = this.$items.eq(this.current);

            if (page !== undefined) {
                this.current = page;
            } else if (dir === 'next' && this.options.direction === 'ltr' || dir === 'prev' && this.options.direction === 'rtl') {
                if (!this.options.circular && this.current === this.itemsCount - 1) {
                    this.end = true;
                } else {
                    this.previous = this.current;
                    this.current = this.current < this.itemsCount - 1 ? this.current + 1 : 0;
                }
            } else if (dir === 'prev' && this.options.direction === 'ltr' || dir === 'next' && this.options.direction === 'rtl') {
                if (!this.options.circular && this.current === 0) {
                    this.end = true;
                } else {
                    this.previous = this.current;
                    this.current = this.current > 0 ? this.current - 1 : this.itemsCount - 1;
                }
            }

            this.$nextItem = !this.options.circular && this.end ? this.$current : this.$items.eq(this.current);

            if (!this.support) {
                this._layoutNoSupport(dir);
            } else {
                this._layout(dir);
            }
        },
        _layoutNoSupport: function (dir) {
            this.$items.hide();
            this.$nextItem.show();
            this.end = false;
            this.isAnimating = false;
            var isLimit = dir === 'next' && this.current === this.itemsCount - 1 || dir === 'prev' && this.current === 0;
            // 回調觸發
            this.options.onEndFlip(this.previous, this.current, isLimit);
        },
        // 創建 3D 結構所需的佈局
        _layout: function (dir) {
            var self = this,
                // 基本結構：左側 1 個元素。
                $s_left = this._addSide('left', dir),
                // 翻轉/中間頁面的 1 個元素
                $s_middle = this._addSide('middle', dir),
                // 右側的 1 個元素
                $s_right = this._addSide('right', dir),
                // 遮罩
                $o_left = $s_left.find('div.bb-overlay'),
                $o_middle_f = $s_middle.find('div.bb-flipoverlay:first'),
                $o_middle_b = $s_middle.find('div.bb-flipoverlay:last'),
                $o_right = $s_right.find('div.bb-overlay'),
                speed = this.end ? 400 : this.options.speed;

            this.$items.hide();
            this.$el.prepend($s_left, $s_middle, $s_right);

            $s_middle.css({
                transitionDuration: speed + 'ms',
                transitionTimingFunction: this.options.easing
            }).on(this.transEndEventName, function (event) {
                if ($(event.target).hasClass('bb-page')) {
                    self.$el.children('.bb-page').remove();
                    self.$nextItem.show();
                    self.end = false;
                    self.isAnimating = false;
                    var isLimit = dir === 'next' && self.current === self.itemsCount - 1 || dir === 'prev' && self.current === 0;
                    // 回調觸發
                    self.options.onEndFlip(self.previous, self.current, isLimit);
                }
            });
            if (dir === 'prev') {
                $s_middle.addClass('bb-flip-initial');
            }

            // 遮罩
            if (this.options.shadows && !this.end) {

                var o_left_style = (dir === 'next') ? {
                    transition: 'opacity ' + this.options.speed / 2 + 'ms ' + 'linear' + ' ' + this.options.speed / 2 + 'ms'
                } : {
                    transition: 'opacity ' + this.options.speed / 2 + 'ms ' + 'linear',
                    opacity: this.options.shadowSides
                },
                    o_middle_f_style = (dir === 'next') ? {
                        transition: 'opacity ' + this.options.speed / 2 + 'ms ' + 'linear'
                    } : {
                        transition: 'opacity ' + this.options.speed / 2 + 'ms ' + 'linear' + ' ' + this.options.speed / 2 + 'ms',
                        opacity: this.options.shadowFlip
                    },
                    o_middle_b_style = (dir === 'next') ? {
                        transition: 'opacity ' + this.options.speed / 2 + 'ms ' + 'linear' + ' ' + this.options.speed / 2 + 'ms',
                        opacity: this.options.shadowFlip
                    } : {
                        transition: 'opacity ' + this.options.speed / 2 + 'ms ' + 'linear'
                    },
                    o_right_style = (dir === 'next') ? {
                        transition: 'opacity ' + this.options.speed / 2 + 'ms ' + 'linear',
                        opacity: this.options.shadowSides
                    } : {
                        transition: 'opacity ' + this.options.speed / 2 + 'ms ' + 'linear' + ' ' + this.options.speed / 2 + 'ms'
                    };

                $o_middle_f.css(o_middle_f_style);
                $o_middle_b.css(o_middle_b_style);
                $o_left.css(o_left_style);
                $o_right.css(o_right_style);

            }

            setTimeout(function () {
                // 到底時，第一個 && 最後一個頁面略微上升
                $s_middle.addClass(self.end ? 'bb-flip-' + dir + '-end' : 'bb-flip-' + dir);

                // 遮罩
                if (self.options.shadows && !self.end) {

                    $o_middle_f.css({
                        opacity: dir === 'next' ? self.options.shadowFlip : 0
                    });

                    $o_middle_b.css({
                        opacity: dir === 'next' ? 0 : self.options.shadowFlip
                    });

                    $o_left.css({
                        opacity: dir === 'next' ? self.options.shadowSides : 0
                    });

                    $o_right.css({
                        opacity: dir === 'next' ? 0 : self.options.shadowSides
                    });

                }
            }, 25);
        },
        // adds the necessary sides (bb-page) to the layout 
        _addSide: function (side, dir) {
            var $side;

            switch (side) {
                case 'left':

                    $side = $('<div class="bb-page"><div class="bb-back"><div class="bb-outer"><div class="bb-content"><div class="bb-inner">' + (dir === 'next' ? this.$current.html() : this.$nextItem.html()) + '</div></div><div class="bb-overlay"></div></div></div></div>').css('z-index', 102);
                    break;
                case 'middle':

                    $side = $('<div class="bb-page"><div class="bb-front"><div class="bb-outer"><div class="bb-content"><div class="bb-inner">' + (dir === 'next' ? this.$current.html() : this.$nextItem.html()) + '</div></div><div class="bb-flipoverlay"></div></div></div><div class="bb-back"><div class="bb-outer"><div class="bb-content" style="width:' + this.elWidth + 'px"><div class="bb-inner">' + (dir === 'next' ? this.$nextItem.html() : this.$current.html()) + '</div></div><div class="bb-flipoverlay"></div></div></div></div>').css('z-index', 103);
                    break;
                case 'right':

                    $side = $('<div class="bb-page"><div class="bb-front"><div class="bb-outer"><div class="bb-content"><div class="bb-inner">' + (dir === 'next' ? this.$nextItem.html() : this.$current.html()) + '</div></div><div class="bb-overlay"></div></div></div></div>').css('z-index', 101);
                    break;
            }

            return $side;
        },
        _startSlideshow: function () {
            var self = this;
            this.slideshow = setTimeout(function () {
                self._navigate('next');
                if (self.options.autoplay) {
                    self._startSlideshow();
                }
            }, this.options.interval);
        },
        _stopSlideshow: function () {
            if (this.options.autoplay) {
                clearTimeout(this.slideshow);
                this.options.autoplay = false;
            }
        },
        // public method: flips next
        next: function () {
            this._action(this.options.direction === 'ltr' ? 'next' : 'prev');
        },
        // public method: flips back
        prev: function () {
            this._action(this.options.direction === 'ltr' ? 'prev' : 'next');
        },
        // public method: goes to a specific page
        jump: function (page) {

            page -= 1;

            if (page === this.current || page >= this.itemsCount || page < 0) {
                return false;
            }

            var dir;
            if (this.options.direction === 'ltr') {
                dir = page > this.current ? 'next' : 'prev';
            }
            else {
                dir = page > this.current ? 'prev' : 'next';
            }
            this._action(dir, page);

        },
        // public method: goes to the last page
        last: function () {
            this.jump(this.itemsCount);
        },
        // public method: goes to the first page
        first: function () {
            this.jump(1);
        },
        // public method: check if isAnimating is true
        isActive: function () {
            return this.isAnimating;
        },
        // public method: dynamically adds new elements
        // call this method after inserting new "bb-item" elements inside the BookBlock
        update: function () {
            var $currentItem = this.$items.eq(this.current);
            this.$items = this.$el.children('.bb-item');
            this.itemsCount = this.$items.length;
            this.current = $currentItem.index();
        },
        destroy: function () {
            if (this.options.autoplay) {
                this._stopSlideshow();
            }
            this.$el.removeClass('bb-' + this.options.orientation);
            this.$items.show();

            if (this.options.nextEl !== '') {
                $(this.options.nextEl).off('.bookblock');
            }

            if (this.options.prevEl !== '') {
                $(this.options.prevEl).off('.bookblock');
            }

            $window.off('debouncedresize');
        }
    }

    var logError = function (message) {
        if (window.console) {
            window.console.error(message);
        }
    };

    $.fn.bookblock = function (options) {
        if (typeof options === 'string') {
            var args = Array.prototype.slice.call(arguments, 1);
            this.each(function () {
                var instance = $.data(this, 'bookblock');
                if (!instance) {
                    logError("cannot call methods on bookblock prior to initialization; " +
                        "attempted to call method '" + options + "'");
                    return;
                }
                if (!$.isFunction(instance[options]) || options.charAt(0) === "_") {
                    logError("no such method '" + options + "' for bookblock instance");
                    return;
                }
                instance[options].apply(instance, args);
            });
        }
        else {
            this.each(function () {
                var instance = $.data(this, 'bookblock');
                if (instance) {
                    instance._init();
                }
                else {
                    instance = $.data(this, 'bookblock', new $.BookBlock(options, this));
                }
            });
        }
        return this;
    };

})(jQuery, window);


var currentPage = 1; // 初始化當前頁數

function showContent(pageNumber) {
    // 隱藏所有内容
    document.querySelectorAll('.content').forEach(function (content) {
        content.style.display = 'none';
    });
    // 顯示索選頁數的内容
    document.getElementById('page' + pageNumber).style.display = 'block';

    // 更新當前頁數
    currentPage = pageNumber;
    // 更新頁數導覽頁樣式
    updateNavStyle();
}

function changeContent(direction) {
    // 計算新的頁數
    var newPage = currentPage + direction;
    // 確保新頁數的在可用的範圍內
    if (newPage >= 1 && newPage <= 13) {
        // 更新當前頁數
        currentPage = newPage;
        // 顯示相應頁數的內容
        showContent(newPage);
    }
}

// 更新頁數導覽列樣式
function updateNavStyle() {
    //移除所有頁數導覽列的 .active 類
    document.querySelectorAll('.pagination li.page-item a').forEach(function (link) {
        link.classList.remove('active');
    });

    // 添加當前導覽列的 .active 類
    document.querySelector('.pagination li.page-item:nth-child(' + (currentPage + 1) + ') a').classList.add('active');
}

// 在頁面一開始顯示初始化
document.addEventListener("DOMContentLoaded", function () {
    // 初始化時將頁面導覽列 "1" 添加 .active 類(讓"1"變深灰)
    document.querySelector('.pagination li.page-item:nth-child(2) a').classList.add('active');
});



var Page = (function () {
    var $grid = $('#bb-custom-grid');
    return {
        init: function () {
            $grid.find('div.bb-bookblock').each(function (i) {
                var $bookBlock = $(this),
                    $nav = $bookBlock.next().children('span'),
                    bb = $bookBlock.bookblock({
                        speed: 500,
                        shadows: false
                    });

                //滑鼠翻頁（滑鼠在圖片右方往右翻，左方往左翻）
                $bookBlock.find('.bb-item').on('mouseover', function (event) {
                    var mouseX = event.pageX - $(this).offset().left;
                    var halfWidth = $(this).width() / 2;

                    if (mouseX < halfWidth) {
                        $bookBlock.bookblock('prev');
                    } else {
                        $bookBlock.bookblock('next');
                    }
                });
            });
        }
    };
})();

Page.init();
