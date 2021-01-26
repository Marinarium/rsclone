import Mixin from '@helpers/Mixin';

const templateGameDescription = require('./assets/templates/game-description.html');
const templateGameEnd = require('./assets/templates/game-end.html');

export default class ModalWindow {
  /**
   * @param {object} app
   */
  constructor(app) {
    this.$app = app;
    this.$modalConfig = app.config.modalWindow;
    this.types = this.$modalConfig.types;

    this.templates = {
      [this.types.gameDescription]: templateGameDescription,
      [this.types.gameEnd]: templateGameEnd,
    };
    this.elements = {};

    Mixin.listen(this.$app.config.events.routeChange, this.destroyModal.bind(this));
  }

  /**
   * @param {object} params
   */
  getModalContainer(params) {
    const {type} = params;
    const node = Mixin.getNode(this.templates[type]);
    this.elements = this.getModalElements(type, node);

    this.fillElementsByParams(params.text, this.elements);
    this.setModalListeners(params.callback, this.elements);

    return node;
  }

  /**
   * @param {object} params
   * @param {object} elements
   */
  setModalListeners(params, elements) {
    Object.entries(elements.buttons).forEach(([, element]) => {
      if (!element) return;

      element.addEventListener('click', () => {
        elements.node.classList.remove('show');
        elements.node.ontransitionend = () => {
          this.destroyModal();
        };
      });
    });

    if (!params) return;

    Object.entries(params).forEach(([key, callback]) => {
      if (elements.buttons[key]) elements.buttons[key].addEventListener('click', callback);
    });
  }

  /**
   * @param {object} config
   * @param {object} elements
   */
  fillElementsByParams(config, elements) {
    if (!config) return;

    Object.entries(config).forEach(([key, value]) => {
      if (elements.text[key]) elements.text[key].innerText = value;
    });
  }

  /**
   * @param {string} type
   * @param {HTMLElement} node
   */
  getModalElements(type, node) {
    if (type === this.types.gameDescription) {
      return {
        node,
        text: {
          title: node.querySelector('.text-title'),
          gameDescription: node.querySelector('.text-description'),
          rule: node.querySelector('.text-rule'),
        },
        buttons: {
          close: node.querySelector('.button-close'),
          play: node.querySelector('.button-play'),
          background: node.querySelector('.modal__background'),
        },
      };
    }

    if (type === this.types.gameEnd) {
      return {
        node,
        text: {
          title: node.querySelector('.text-title'),
          score: node.querySelector('.text-score'),
          time: node.querySelector('.text-time'),
          achievement: node.querySelector('.text-achievements'),
        },
        buttons: {
          close: node.querySelector('.button-close'),
          background: node.querySelector('.modal__background'),
          restart: node.querySelector('.button-restart'),
          quit: node.querySelector('.button-quit'),
        },
      };
    }
  }

  /**
   * @param {object} params
   * @param {string} params.type Modal types
   * @param {Element} params.container
   * @param {{
   *   title: string,
   *   [gameDescription]: string,
   *   [rule]: string,
   *   [score]: string,
   *   [time]: string,
   *   [achievement]: string,
   * }} params.text Values of text fields
   * @param {{
   *   [close]: function,
   *   [play]: function
   * }} [params.callback] Callback functions
   * @return void
   */
  showModal(params) {
    const node = this.getModalContainer(params);

    params.container.append(node);

    window.requestAnimationFrame(() => this.show());
  }

  /**
   * @return void
   */
  show() {
    this.elements.node.classList.add('show');
  }

  /**
   * @return void
   */
  destroyModal() {
    if (this.elements.node) this.elements.node.remove();
    this.elements = {};
  }
}