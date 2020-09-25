import $ from 'jquery';
import 'bootstrap';
import Vue from 'vue';
import svg4everybody from 'svg4everybody';
import store from '../../store';
import MeasureList from '../../views/Measure-list.vue';


// Svg for ie
svg4everybody();
console.log($('body'));

Vue.config.productionTip = false;

window.eventBus = new Vue();

window.onload = () => {
  document.body.classList.remove('load');
};

setInterval(() => {
  window.initVue();
}, 500);

/* eslint-disable */
window.initVue = () => {
  const appElements = Array.from(document.querySelectorAll('.vue-app:not(.vue-app-mounted)'));

  for (const appElement of appElements) {
    appElement.classList.add('vue-app-mounted');

    new Vue({
      el: appElement,
      store,
      components: {
        'measure-component': MeasureList,
      }
    });
  }
};
/* eslint-enable */
