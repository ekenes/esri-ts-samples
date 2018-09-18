/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define(["require", "exports", "esri/core/tsSupport/declareExtendsHelper", "esri/core/tsSupport/decorateHelper", "esri/core/accessorSupport/decorators", "esri/widgets/Widget", "esri/widgets/support/widget"], function (require, exports, __extends, __decorate, decorators_1, Widget, widget_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var CSS = {
        base: "widgets-drop-target",
        background: "widgets-drop-target--background",
        modal: "widgets-drop-target--modal",
        dropbox: "widgets-drop-target--dropbox",
        dropboxIcon: "widgets-drop-target--dropboxIcon",
        loaderContainer: "widgets-drop-target--loaderContainer",
        loader: "widgets-drop-target--loader",
        label: "widgets-drop-target--label",
        // States
        visible: "widgets-drop-target--visible",
        dragging: "widgets-drop-target--dragging",
        hover: "widgets-drop-target--hover",
        loading: "widgets-drop-target--loading"
    };
    function isThenable(obj) {
        return obj && typeof obj.then === "function";
    }
    var DropTarget = /** @class */ (function (_super) {
        __extends(DropTarget, _super);
        function DropTarget(props) {
            var _this = _super.call(this, props) || this;
            _this.state = "ready";
            _this.loading = false;
            _this._dragEnterHandler = _this._dragEnterHandler.bind(_this);
            _this._dragExitHandler = _this._dragExitHandler.bind(_this);
            _this._dropHandler = _this._dropHandler.bind(_this);
            _this._dragOverHandler = _this._dragOverHandler.bind(_this);
            _this.own(_this.watch("view.container", function (value, oldValue) {
                if (oldValue) {
                    //oldValue.removeEventListener("drag", this._dragEnterHandler);
                    oldValue.removeEventListener("dragend", _this._dragExitHandler);
                    oldValue.removeEventListener("dragenter", _this._dragEnterHandler);
                    oldValue.removeEventListener("dragexit", _this._dragExitHandler);
                    oldValue.removeEventListener("dragleave", _this._dragExitHandler);
                    oldValue.removeEventListener("dragover", _this._dragOverHandler);
                    // oldValue.removeEventListener("dragstart", this._dragEnterHandler);
                    oldValue.removeEventListener("drop", _this._dropHandler);
                }
                if (value) {
                    //value.addEventListener("drag", this._dragEnterHandler);
                    value.addEventListener("dragend", _this._dragExitHandler);
                    value.addEventListener("dragenter", _this._dragEnterHandler);
                    value.addEventListener("dragexit", _this._dragExitHandler);
                    value.addEventListener("dragleave", _this._dragExitHandler);
                    value.addEventListener("dragover", _this._dragOverHandler);
                    // value.addEventListener("dragstart", this._dragEnterHandler);
                    value.addEventListener("drop", _this._dropHandler);
                }
            }));
            return _this;
        }
        DropTarget.prototype.render = function () {
            var classes = (_a = {},
                _a[CSS.visible] = this.state !== "ready",
                _a[CSS.dragging] = this.state === "dragging",
                _a[CSS.hover] = this.state === "hover",
                _a[CSS.loading] = this.state === "loading",
                _a);
            var iconClasses = (_b = {
                    "esri-icon-upload": true
                },
                _b[CSS.dropboxIcon] = true,
                _b);
            return (widget_1.tsx("div", { bind: this, class: CSS.base, classes: classes },
                widget_1.tsx("div", { class: CSS.background },
                    widget_1.tsx("div", { class: CSS.modal },
                        widget_1.tsx("div", { class: CSS.label }, "Drop here your geo data"),
                        widget_1.tsx("div", { class: CSS.dropbox },
                            widget_1.tsx("span", { classes: iconClasses })),
                        widget_1.tsx("div", { class: CSS.loaderContainer },
                            widget_1.tsx("div", { class: CSS.loader }, "Loading..."))))));
            var _a, _b;
        };
        DropTarget.prototype._dragEnterHandler = function (event) {
            this._receiveEvent(event);
            this.state = "dragging";
        };
        DropTarget.prototype._dragExitHandler = function (event) {
            if (event.currentTarget !== this.view.container) {
                this.state = "ready";
            }
        };
        DropTarget.prototype._dropHandler = function (event) {
            var _this = this;
            this._receiveEvent(event);
            var dataTransfer = event.dataTransfer;
            if (this.drop) {
                var dropped = this.drop(dataTransfer);
                if (isThenable(dropped)) {
                    this.state = "loading";
                    dropped
                        .then(function (dropped) {
                        _this.state = "ready";
                        _this.emit("drop", {
                            item: dropped
                        });
                    })
                        .catch(function () {
                        _this.state = "ready";
                    });
                }
                else {
                    this.state = "ready";
                    this.emit("drop", {
                        item: dropped
                    });
                }
            }
            else {
                this.state = "ready";
                this.emit("drop", {
                    item: dataTransfer
                });
            }
        };
        DropTarget.prototype._dragOverHandler = function (event) {
            this._receiveEvent(event);
        };
        DropTarget.prototype._receiveEvent = function (event) {
            var target = event.target;
            if (target.classList.contains(CSS.dropbox)) {
                event.preventDefault();
                this.state = "hover";
            }
            else {
                this.state = "dragging";
            }
        };
        __decorate([
            decorators_1.property()
        ], DropTarget.prototype, "drop", void 0);
        __decorate([
            decorators_1.property(),
            widget_1.renderable()
        ], DropTarget.prototype, "state", void 0);
        __decorate([
            decorators_1.property(),
            widget_1.renderable()
        ], DropTarget.prototype, "loading", void 0);
        __decorate([
            decorators_1.property()
        ], DropTarget.prototype, "view", void 0);
        DropTarget = __decorate([
            decorators_1.subclass("widgets.DropTarget")
        ], DropTarget);
        return DropTarget;
    }(decorators_1.declared(Widget)));
    exports.default = DropTarget;
});
//# sourceMappingURL=DropTarget.js.map