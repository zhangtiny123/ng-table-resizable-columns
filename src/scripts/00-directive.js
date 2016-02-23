// based on https://github.com/dobtco/jquery-resizable-columns
angular.module('ngTableResizableColumns', [])
    .directive('ngTableResizableColumns', ['$timeout',function($timeout) {

        var parseWidth = function(node) {
            return parseFloat(node.style.width.replace('px', ''));
        }, setWidth = function(node, width) {
            return node.style.width = "" + width + "px";
        }, pointerX = function(e) {
            return (e.type.indexOf('touch') === 0) ? (e.originalEvent.touches[0] || e.originalEvent.changedTouches[0]).pageX : e.pageX;
        };

        function ResizableColumns($table) {
            var __bind = function(fn, me){
                return function(){
                    return fn.apply(me, arguments);
                };
            };

            this.pointerdown = __bind(this.pointerdown, this);
            var _this = this;
            this.options = {
                store: window.store,
                rigidSizing: false,
                resizeFromBody: true
            };
            this.$table = $table;
            this.setHeaders();
            this.restoreColumnWidths();
            this.syncHandleWidths();
            $(window).on('resize.rc', (function() {
                return _this.syncHandleWidths();
            }));
        }

        ResizableColumns.prototype.getColumnId = function($el) {
            return this.$table.data('resizable-columns-id') + '-' + $el.data('resizable-column-id');
        };

        ResizableColumns.prototype.setHeaders = function() {
            this.$tableHeaders = this.$table.find('thead tr:first th:visible');
            this.assignInitWidths();
            return this.createHandles();
        };

        ResizableColumns.prototype.destroy = function() {
            this.$handleContainer.remove();
            this.$table.removeData('resizableColumns');
            return $(window).off('.rc');
        };

        ResizableColumns.prototype.assignInitWidths = function() {
            var _this = this;
            return this.$tableHeaders.each(function(index, el) {
                var $el;
                $el = $(el);
                if (!$el[0].style.width) {
                    if (index == 0) {
                        $el[0].style.width = 50 + 'px';
                    }
                    else {
                        $el[0].style.width = 180 + 'px';
                    }
                }
                else {
                    $el[0].style.width = $el[0].offsetWidth + 'px';
                }
            });
        };

        ResizableColumns.prototype.createHandles = function() {
            var _ref,
                _this = this;
            if ((_ref = this.$handleContainer) != null) {
                _ref.remove();
            }
            this.$table.before((this.$handleContainer = $("<div class='rc-handle-container' />")));
            this.$tableHeaders.each(function(i, el) {
                var $handle;
                if (_this.$tableHeaders.eq(i + 1).length === 0 || (_this.$tableHeaders.eq(i).attr('data-noresize') != null) || (_this.$tableHeaders.eq(i + 1).attr('data-noresize') != null)) {
                    return;
                }
                $handle = $("<div class='rc-handle' />");
                $handle.data('th', $(el));
                return $handle.appendTo(_this.$handleContainer);
            });
            return this.$handleContainer.on('mousedown touchstart', '.rc-handle', this.pointerdown);
        };

        ResizableColumns.prototype.syncHandleWidths = function() {
            var _this = this;
            this.setHeaders();
            return this.$handleContainer.width(this.$table.width()).find('.rc-handle').each(function(_, el) {
                var $el;
                $el = $(el);
                return $el.css({
                    left: $el.data('th').outerWidth() + ($el.data('th').offset().left - _this.$handleContainer.offset().left),
                    height: _this.options.resizeFromBody ? _this.$table.height() : _this.$table.find('thead').height()
                });
            });
        };

        ResizableColumns.prototype.saveColumnWidths = function() {
            var _this = this;
            return this.$tableHeaders.each(function(_, el) {
                var $el;
                $el = $(el);
                if ($el.attr('data-noresize') == null) {
                    if (_this.options.store != null) {
                        return _this.options.store.set(_this.getColumnId($el), parseWidth($el[0]));
                    }
                }
            });
        };

        ResizableColumns.prototype.restoreColumnWidths = function() {
            var _this = this;
            return this.$tableHeaders.each(function(_, el) {
                var $el, width;
                $el = $(el);
                if ((_this.options.store != null) && (width = _this.options.store.get(_this.getColumnId($el)))) {
                    return setWidth($el[0], width);
                }
            });
        };

        ResizableColumns.prototype.pointerdown = function(e) {
            var $currentGrip, $leftColumn, startPosition, leftWidth,
                _this = this;
            e.preventDefault();
            startPosition = pointerX(e);
            $currentGrip = $(e.currentTarget);
            $leftColumn = $currentGrip.data('th');
            leftWidth =  parseWidth($leftColumn[0]);
            this.$table.addClass('rc-table-resizing');
            $(document).on('mousemove.rc touchmove.rc', function(e) {
                var difference = pointerX(e) - startPosition;
                return setWidth($leftColumn[0], leftWidth + difference);
            });
            return $(document).one('mouseup touchend', function() {
                $(document).off('mousemove.rc touchmove.rc');
                _this.$table.removeClass('rc-table-resizing');
                _this.syncHandleWidths();
                return _this.saveColumnWidths();
            });
        };


        return {
            restrict: 'EA',
            priority: 999,
            require: 'ngTable',
            link: function(scope, element) {
                var data;
                scope.$watch('$data', function() {
                    data.destroy();
                    data = new ResizableColumns(element);
                });
                scope.$watch('columns', function() {
                    $timeout(function(){
                        data.destroy();
                        data = new ResizableColumns(element);
                    }, 100);
                }, true);
                data = new ResizableColumns(element);
            }
        };

    }]);