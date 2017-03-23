var Symbol = cc.Class({
    extends: cc.Component,
    editor: {
        disallowMultiple: false,
        executeInEditMode: true
    },
    properties: {
        _symbolIndex: 0,
        symbolIndex: {
            get: function () {
                return this._symbolIndex;
            },
            set: function (value) {
                var index = value % this.symbolRollSF.length;
                this._symbolIndex = isNaN(index) ? value : index;
                this.isBlur = this.isBlur;
            },
            min: 0,
            step: 1
        },
        _isBlur: false,
        isBlur: {
            get: function () {
                return this._isBlur;
            },
            set: function (value) {
                this._isBlur = value;
                if (this._isBlur && this.symbolBlurSF[this._symbolIndex]) {
                    this._sprite.spriteFrame = this.symbolBlurSF[this._symbolIndex]
                } else if (this.symbolRollSF[this._symbolIndex]) {
                    this._sprite.spriteFrame = this.symbolRollSF[this._symbolIndex]
                } else {
                    this._sprite.spriteFrame = this.symbolEmptySF;
                }
            }
        },
        _symbolWidth: 120,
        symbolWidth: {
            get: function () {
                return this.node.width;
            },
            set: function (value) {
                this.node.width = value;
            },
            min: 0,
            step: 1
        },
        _symbolHeight: 120,
        symbolHeight: {
            get: function () {
                return this.node.height;
            },
            set: function (value) {
                this.node.height = value;
            },
            min: 0,
            step: 1
        },
        _isBlur: false,
        symbolEmptySF: {
            default: null,
            type: cc.SpriteFrame,
            notify: function () {
                this.emptySymbol();
            }
        },
        symbolRollSF: [cc.SpriteFrame],
        symbolBlurSF: [cc.SpriteFrame],
    },

    onLoad: function () {

        this.node.anchorX = 0.5;
        this.node.anchorY = 0.5;

        var spriteNode = this.node.getChildByName('symbolSprite') || new cc.Node();
        spriteNode.name = 'symbolSprite';
        spriteNode.removeFromParent(false);
        this.node.addChild(spriteNode);

        this._sprite = spriteNode.getComponent(cc.Sprite) || spriteNode.addComponent(cc.Sprite);
        this._sprite.type = 0;
        this._sprite.sizeMode = cc.Sprite.SizeMode.RAW;
        this._sprite.trim = false;

    },

    randomSymbol: function () {
        var randomIndex = Math.floor(this.symbolRollSF.length * Math.random());
        this.symbolIndex = randomIndex;
    },

    emptySymbol: function () {
        this._sprite.spriteFrame = this.symbolEmptySF;
    }

});
