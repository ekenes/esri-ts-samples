/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

import { subclass, declared, property } from "esri/core/accessorSupport/decorators";
import Widget = require("esri/widgets/Widget");
import { renderable, tsx } from "esri/widgets/support/widget";

const CSS = {
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

function isThenable<T>(obj: any): obj is IPromise<T> {
  return obj && typeof obj.then === "function";
}

interface DropTarget<T> {
  on(name: "drop", eventHandler: (event: { item: T }) => void): IHandle;
}

@subclass("widgets.DropTarget")
class DropTarget<T = any> extends declared(Widget) {

  constructor(props: Partial<Pick<DropTarget<T>, "drop" | "view">>) {
    super(props as any);

    this._dragEnterHandler = this._dragEnterHandler.bind(this);
    this._dragExitHandler = this._dragExitHandler.bind(this);
    this._dropHandler = this._dropHandler.bind(this);
    this._dragOverHandler = this._dragOverHandler.bind(this);

    this.own(this.watch("view.container", (value: HTMLElement, oldValue: HTMLElement) => {
      if (oldValue) {
        //oldValue.removeEventListener("drag", this._dragEnterHandler);
        oldValue.removeEventListener("dragend", this._dragExitHandler);
        oldValue.removeEventListener("dragenter", this._dragEnterHandler);
        oldValue.removeEventListener("dragexit", this._dragExitHandler);
        oldValue.removeEventListener("dragleave", this._dragExitHandler);
        oldValue.removeEventListener("dragover", this._dragOverHandler);
        // oldValue.removeEventListener("dragstart", this._dragEnterHandler);
        oldValue.removeEventListener("drop", this._dropHandler);
      }

      if (value) {
        //value.addEventListener("drag", this._dragEnterHandler);
        value.addEventListener("dragend", this._dragExitHandler);
        value.addEventListener("dragenter", this._dragEnterHandler);
        value.addEventListener("dragexit", this._dragExitHandler);
        value.addEventListener("dragleave", this._dragExitHandler);
        value.addEventListener("dragover", this._dragOverHandler);
        // value.addEventListener("dragstart", this._dragEnterHandler);
        value.addEventListener("drop", this._dropHandler);
      }
    }));
  }

  @property()
  drop: (dataTransfer: DataTransfer) => T | IPromise<T> | Promise<T>;

  @property()
  @renderable()
  private state: "ready" | "dragging" | "hover" | "loading" = "ready";

  @property()
  @renderable()
  private loading = false;

  @property()
  view: any;

  render() {
    const classes = {
      [CSS.visible]: this.state !== "ready",
      [CSS.dragging]: this.state === "dragging",
      [CSS.hover]: this.state === "hover",
      [CSS.loading]: this.state === "loading"
    };

    const iconClasses = {
      "esri-icon-upload": true,
      [CSS.dropboxIcon]: true
    };

    return (
      <div bind={this}
        class={CSS.base}
        classes={classes}>
        <div class={CSS.background}>
          <div class={CSS.modal}>
            <div class={CSS.label}>Drop here your geo data</div>
            <div class={CSS.dropbox}>
              <span classes={iconClasses}></span>
            </div>
            <div class={CSS.loaderContainer}>
              <div class={CSS.loader}>Loading...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  private _dragEnterHandler(event: DragEvent): void {
    this._receiveEvent(event);
    this.state = "dragging";
  }

  private _dragExitHandler(event: DragEvent): void {
    if (event.currentTarget !== this.view.container) {
      this.state = "ready";
    }
  }

  private _dropHandler(event: DragEvent): void {
    this._receiveEvent(event);

    const dataTransfer = event.dataTransfer;

    if (this.drop) {
      const dropped = this.drop(dataTransfer);

      if (isThenable(dropped)) {
        this.state = "loading";

        dropped
          .then((dropped) => {
            this.state = "ready";
            this.emit("drop", {
              item: dropped
            });
          })
          .catch(() => {
            this.state = "ready";
          })
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
  }

  private _dragOverHandler(event: DragEvent): void {
    this._receiveEvent(event);
  }

  private _receiveEvent(event: DragEvent): void {
    const target = event.target as HTMLElement;

    if (target.classList.contains(CSS.dropbox)) {
      event.preventDefault();
      this.state = "hover";
    }
    else {
      this.state = "dragging";
    }
  }
}

export default DropTarget;