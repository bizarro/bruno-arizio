export default class {
  constructor () {
    this.element = document.querySelector('#webgl-screen')

    this.show()
  }

  show () {
    this.element.classList.remove('unsupported--disabled')
  }

  hide () {
    this.element.classList.add('unsupported--disabled')
  }
}
