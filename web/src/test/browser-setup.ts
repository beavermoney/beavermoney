// jsdom does not implement the native dialog APIs used by Astryx.
if (typeof HTMLDialogElement !== 'undefined') {
  HTMLDialogElement.prototype.showModal ??= function () {
    this.open = true
  }
  HTMLDialogElement.prototype.close ??= function () {
    this.open = false
    this.dispatchEvent(new Event('close'))
  }
}
