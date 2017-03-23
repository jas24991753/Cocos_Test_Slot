var Symbol = require('slot.Symbol');
var Roller = cc.Class({
    extends: cc.Component,
    editor: {
        disallowMultiple: false,
        executeInEditMode: true
    },
    properties: {
        _rollerRows: 0,
        rollerRows: {
            get: function () {
                return this._rollerRows;
            },
            set: function (value) {
                this._rollerRows = value;
                this._createSymbols();
            },
            min: 0,
            step: 1
        },
        _rollerWidth: 180,
        rollerWidth: {
            get: function () {
                return this._rollerWidth;
            },
            set: function (value) {
                this._rollerWidth = value;
                this._updateScroller();
            },
            min: 0,
            step: 1
        },
        _rollerHeight: 540,
        rollerHeight: {
            get: function () {
                return this._rollerHeight;
            },
            set: function (value) {
                this._rollerHeight = value;
                this._updateScroller();
            },
            min: 0,
            step: 1
        },
        rollerScrollRate: {
            default: 1,
            min: 0.1,
            max: 2,
            step: 0.05,
            slide: true
        },
        _rollerSymbolResult: [],
        rollerSymbolResult: {
            get: function () {
                return this._rollerSymbolResult;
            },
            set: function (value) {
                this._rollerSymbolResult = value;
                var symbols = this._scroller.getComponentsInChildren(Symbol);
                for (var symbolIndex, symbol, i = 0; i < symbols.length - 1; i++) {
                    symbol = symbols[i + 1];
                    symbolIndex = parseInt(this._rollerSymbolResult[i]);
                    if (isNaN(symbolIndex) || symbolIndex < 0) {
                        symbol.randomSymbol();
                    } else {
                        symbol.symbolIndex = symbolIndex
                    }
                }
            }
        },
        _symbolWidth: 180,
        symbolWidth: {
            get: function () {
                return this._symbolWidth;
            },
            set: function (value) {
                this._symbolWidth = value;
                this.rollerWidth = this._symbolWidth;
                this._updateSymbolSize();
            },
            min: 0,
            step: 1
        },
        _symbolHeight: 180,
        symbolHeight: {
            get: function () {
                return this._symbolHeight;
            },
            set: function (value) {
                this._symbolHeight = value;
                this._updateSymbolSize();
            },
            min: 0,
            step: 1
        },
        symbolEmptySF: {
            default: null,
            type: cc.SpriteFrame,
            notify: function () {
                this._updateSymbolSpriteFrame();
            }
        },
        symbolRollSF: [cc.SpriteFrame],
        symbolBlurSF: [cc.SpriteFrame],

        _doScrollling: false,
        _isScrolling: false,
        isSpinning: {
            readonly: true,
            get: function () {
                return this._doScrollling == true || this._isScrolling == true;
            }
        },
    },

    onLoad: function () {

        this._scroller = this.node.getChildByName('scroller') || new cc.Node();
        this._scroller.name = 'scroller';
        this._scroller.removeFromParent(false);
        this.node.addChild(this._scroller);

        var mask = this._scroller.getComponent(cc.Mask) || this._scroller.addComponent(cc.Mask);

        this._updateScroller();
        this._updateSymbolSize();
        this._updateSymbolSpriteFrame();
        this.rollerSymbolResult = [];

        this._customRollerResult = [];
    },

    setRollerSize: function (width, height) {
        this._rollerWidth = width;
        this._rollerHeight = height;
        this._updateScroller();
    },

    _updateScroller: function () {
        this.node.width = this._scroller.width = this.rollerWidth;
        this.node.height = this._scroller.height = this.rollerHeight;
    },

    _createSymbols: function () {
        this._scroller.removeAllChildren();
        if (this.rollerRows > 0) {
            for (var symbol, i = 0; i < this.rollerRows + 1; i++) {
                symbol = new cc.Node()
                symbol.name = 'symbol_' + i;
                symbol.addComponent(Symbol);
                this._scroller.addChild(symbol);
            }
            this._updateSymbolSize();
            this._updateSymbolSpriteFrame();
        }
    },

    _updateSymbolSize: function () {
        var symbols = this._scroller.getComponentsInChildren(Symbol);

        // 計算滾動的上下邊界
        this._rollerTopBound = this.symbolHeight * (this.rollerRows + 1) / 2;
        this._rollerBottomBound = -this.symbolHeight * (this.rollerRows + 1) / 2;

        symbols.forEach(function (symbol, index, array) {
            symbol.symbolWidth = this.symbolWidth;
            symbol.symbolHeight = this.symbolHeight;
            symbol.node.y = this._rollerTopBound - symbol.symbolHeight * index;
        }, this);

        this.rollerHeight = this.symbolHeight * this.rollerRows;
    },

    _updateSymbolSpriteFrame: function () {
        var symbols = this._scroller.getComponentsInChildren(Symbol);
        symbols.forEach(function (symbol, index, array) {
            symbol.isBlur = false;
            symbol.symbolEmptySF = this.symbolEmptySF;
            symbol.symbolRollSF = this.symbolRollSF;
            symbol.symbolBlurSF = this.symbolBlurSF;
        }, this);
    },

    setSymbolSize: function (width, height) {
        this._symbolWidth = width;
        this._symbolHeight = height;
        this._updateSymbolSize();
    },

    update: function (dt) {
        var step = Math.ceil(this.symbolHeight * 0.15 * this.rollerScrollRate);
        if (this._isScrolling) {
            var symbols = this._scroller.getComponentsInChildren(Symbol);
            symbols.forEach(function (symbol, index, array) {
                var nextPosition = symbol.node.y - step;
                if (nextPosition < this._rollerBottomBound) {
                    if (this._doScrollling || this._rollerSymbolResult.length < this.rollerRows) {
                        symbol.randomSymbol();
                        this._rollerSymbolResult.unshift(symbol.symbolIndex);
                    } else if (this._customRollerResult.length > 0) {
                        symbol.symbolIndex = this._customRollerResult.pop();
                        this._rollerSymbolResult.unshift(symbol.symbolIndex);
                    } else {
                        this._isScrolling = false;
                    }

                    nextPosition = this._rollerTopBound - (this._rollerBottomBound - nextPosition);
                }

                symbol.node.y = nextPosition;
            }, this);

            if (this._isScrolling == false) {
                this._rollerSymbolResult = this._rollerSymbolResult.slice(0, this.rollerRows);
                this._readyStopSpin();
            }
        }
    },

    _readyStartSpin: function () {
        var symbols = this._scroller.getComponentsInChildren(Symbol);
        symbols.forEach(function (symbol, index, array) {
            var shakeStep = Math.ceil(this.symbolHeight * 0.2 * this.rollerScrollRate);
            var action = cc.sequence(
                cc.moveBy(0.1, 0, shakeStep),
                cc.callFunc(function () {
                    symbol.isBlur = true;
                    symbol.node.y = Math.ceil(symbol.node.y);
                    if (index == array.length - 1) {
                        this._isScrolling = true;
                    }
                }, this)
            );
            symbol.node.runAction(action);
        }, this);
    },

    _readyStopSpin: function () {
        var symbols = this._scroller.getComponentsInChildren(Symbol);
        symbols.forEach(function (symbol, index, array) {
            var remain = this._rollerBottomBound - symbol.node.y;
            var adjustment = symbol.symbolHeight - Math.abs(Math.ceil(remain % symbol.symbolHeight));
            var action = cc.sequence(
                cc.moveBy(0.05, 0, adjustment),
                cc.callFunc(function () {
                    symbol.isBlur = false;
                    symbol.node.y = Math.ceil(symbol.node.y);
                    if (index == array.length - 1) {
                        cc.log('Final Result:', this._rollerSymbolResult)
                        this._doScrollling = false;
                        
                    }
                }, this)
            );
            symbol.node.runAction(action);
        }, this);
    },

    _startSpin: function () {
        this._doScrollling = true;
        this._rollerSymbolResult = [];
        this._readyStartSpin();
    },


    _stopSpin: function () {
        this._doScrollling = false;

    },

    spin: function () {
        if (!this._doScrollling && !this._isScrolling) {
            this._startSpin();
        }
    },

    stop: function (customResult) {
        if (this._doScrollling && this._isScrolling) {
            this._customRollerResult = customResult || [];
            this._stopSpin();
        }
    },

    toggleSpin: function () {
        if (!this.isSpinning) {
            this.spin();
        } else {
            this.stop();
        }
    },

});
