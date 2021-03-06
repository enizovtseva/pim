<template lang="pug">
  .Measure
    .row.heading-bg
      .col-lg-3.col-md-4.col-sm-4.col-xs-12
        h5.txt-dark Характеристики
      .col-lg-9.col-sm-8.col-md-8.col-xs-12
        ol.breadcrumb
          li
            a(href="/") PIM
          li.active
            span Характеристики
    .row
      .col-md-12
        .panel.panel-default.card-view
          .panel-wrapper
            .panel-body.pt-0
              .row.align-items-center
                .col-lg-6.col-md-6.col-sm-6
                  span.mr-20(v-if="characters") Всего {{ characters.length }}
                  span.mr-20(v-else) Всего 0
                  pagination(v-if="characters" :pagination-data="paginationData" :data="charactersFiltered")
                .col-lg-2.col-md-3.col-sm-3
                  search(v-if="characters" :search-data="searchData" :data="characters")
                .col-lg-4.col-md-3.col-sm-3.text-right
                  button.btn.btn-success.input-sm.mt-5.mb-5(@click="addCharacteristic()") Создать
              hr.light-grey-hr.mt-15
              .row
                .col-sm-12
                  table.table.mb-0(v-if="characters")
                    thead
                      tr
                        th Название
                        th.text-center Тип характеристики
                        th.text-center Список значений #[br]Единицы измерения
                        th.text-center Редактировать
                        th.text-center Связки
                        th.text-center Удалить
                    tbody
                      tr(v-for="item in paginationData.result" v-bind:key="item.id")
                        td
                          a(:href="`/characteristics-details.html?id=${item.id}`") {{item.name}}
                        td.text-center {{ types.filter(el => el.id == item.type)[0].name }}
                        td.text-center
                          template(v-if="measurements && valuelist") {{ getMeasureListName(item.value_list) }} #[br]{{ getValueListName(item.measure_unit) }}
                        td.text-center
                          a(@click="editCharacteristic(item)")
                            i.fa.fa-pencil
                        td.text-center
                          i.fa.fa-share-alt
                        td.text-center
                          a(@click="deleteCharacteristic(item.id)")
                            i.fa.fa-trash-o.txt-danger
              hr.light-grey-hr
              .row.mt-30.align-items-center
                .col-lg-8.col-md-9.col-sm-9
                  span.mr-20(v-if="characters") Всего {{ characters.length }}
                  span.mr-20(v-else) Всего 0
                  pagination(v-if="characters" :pagination-data="paginationData" :data="charactersFiltered")
                .col-lg-4.col-md-3.col-sm-3.text-right
                  button.btn.btn-success.input-sm.mt-5.mb-5(@click="addCharacteristic()") Создать
    .modal.modalCharacteristics(ref="modalCharacteristics")
      .modal-dialog
        .modal-content
          form(@submit.prevent="formCharacteristicsSubmit")
            .modal-header
              h5.modal-title Создать Характеристику
              button.close(type="button" data-dismiss="modal") ×
            .modal-body
              .form-group
                label.control-label.mb-10 Название
                input.form-control(type="text" name="name" v-model="formCharacteristics.name")
              .form-group
                label.control-label.mb-10 Описание
                input.form-control(type="text" name="description" v-model="formCharacteristics.description")
              .form-group
                label.control-label.mb-10 Тип характеристики
                select.form-control(v-model="formCharacteristics.type")
                  option(value="null" selected disabled) Выберите тип характеристики
                  option(v-for="item in types" :value="item.id") {{ item.name }}
              .form-group
                label.control-label.mb-10 Единица измерения
                select.form-control(data-style="form-control btn-default btn-outline" v-if="measurements" v-model="formCharacteristics.measure_unit")
                  option(value="null" selected disabled) Выберите единицу измерения
                  option(v-for="item in measurements" :value="item.id") {{ item.name }}
              .form-group
                label.control-label.mb-10 Список значений
                select.form-control(data-style="form-control btn-default btn-outline" v-if="valuelist" v-model="formCharacteristics.value_list")
                  option(value="null" selected disabled) Выберите список значений
                  option(v-for="item in valuelist" :value="item.id") {{ item.name }}
            .modal-footer
              button.btn.btn-danger(v-if="editCharacteristicsId" type="submit") Сохранить
              button.btn.btn-danger(v-else type="submit") Создать
              button.btn.btn-default(type="button" data-dismiss="modal") Отменить
</template>

<script>
import $ from 'jquery';
import Vue from 'vue';
import Vuelidate from 'vuelidate';
import { required } from 'vuelidate/lib/validators';
import Pagination from '../components/Pagination/Pagination.vue';
import Search from '../components/Search/Search.vue';
import api from '../helpers/api';

Vue.use(Vuelidate);

export default {
  name: 'CharacteristicsList',
  components: {
    Pagination,
    Search,
  },
  data() {
    return {
      characters: null,
      measurements: null,
      valuelist: null,
      charactersFiltered: null,
      editCharacteristicsId: null,
      formCharacteristics: {
        name: '',
        description: '',
        type: '',
        value_list: null,
        measure_unit: null,
      },
      formCharacteristicsSubmitted: false,
      paginationData: {
        pageNumber: 0,
        pageSize: 10,
        pageCount: 0,
        result: null,
      },
      searchData: {
        value: '',
        result: null,
        fields: ['title', 'type', 'count', 'measurement'],
      },
      types: [
        {
          id: 'TXT',
          name: 'Текст',
        }, {
          id: 'NUM',
          name: 'Число',
        }, {
          id: 'FILE',
          name: 'Файл',
        },
      ],
    };
  },
  validations: {
    formCharacteristics: {
      name: {
        required,
      },
    },
  },
  mounted() {
    this.getCharacters();
    this.getValuesList();
    this.getMeasureList();
    this.$root.$on('afterSearch', () => {
      this.charactersFiltered = this.searchData.result;
    });
  },
  methods: {
    getMeasureList() {
      api(
        'get',
        process.env.VUE_APP_BASE_URL.concat('/pim/measurement/'),
        null,
        (res) => {
          this.measurements = res.data.sort((a, b) => a.id - b.id);
        },
        () => {},
      );
    },
    getValuesList() {
      api(
        'get',
        process.env.VUE_APP_BASE_URL.concat('/pim/valuelist/'),
        null,
        (res) => {
          this.valuelist = res.data.sort((a, b) => a.id - b.id);
        },
        () => {},
      );
    },
    getCharacters() {
      api(
        'get',
        process.env.VUE_APP_BASE_URL.concat('/pim/character/'),
        null,
        (res) => {
          this.characters = res.data.sort((a, b) => a.id - b.id);
          this.charactersFiltered = this.characters;
        },
        () => {},
      );
    },
    addCharacteristic() {
      this.formCharacteristicsSubmitted = false;
      this.editCharacteristicsId = null;
      this.formCharacteristics.name = null;
      this.formCharacteristics.description = null;
      this.formCharacteristics.type = null;
      this.formCharacteristics.value_list = null;
      this.formCharacteristics.measure_unit = null;
      $(this.$refs.modalCharacteristics).modal('show');
    },
    editCharacteristic(Characteristic) {
      this.formCharacteristicsSubmitted = false;
      this.editCharacteristicsId = Characteristic.id;
      this.formCharacteristics.name = Characteristic.name;
      this.formCharacteristics.description = Characteristic.description;
      this.formCharacteristics.type = Characteristic.type;
      this.formCharacteristics.value_list = Characteristic.value_list;
      this.formCharacteristics.measure_unit = Characteristic.measure_unit;
      $(this.$refs.modalCharacteristics).modal('show');
    },
    deleteCharacteristic(id) {
      this.formCharacteristicsSubmitted = false;
      this.editCharacteristicsId = null;
      this.editCharacteristicsId = null;
      this.formCharacteristics.name = null;
      this.formCharacteristics.description = null;
      this.formCharacteristics.type = null;
      this.formCharacteristics.value_list = null;
      this.formCharacteristics.measure_unit = null;
      api(
        'delete',
        process.env.VUE_APP_BASE_URL.concat('/pim/character/').concat(id),
        null,
        () => this.getCharacters(),
        () => {},
      );
    },
    formCharacteristicsSubmit() {
      this.formCharacteristicsSubmitted = true;
      this.$v.$touch();
      if (!this.$v.$invalid) {
        let apiUrl = process.env.VUE_APP_BASE_URL.concat('/pim/character/');
        let apiAction = 'post';
        if (this.editCharacteristicsId) {
          apiUrl += this.editCharacteristicsId;
          apiAction = 'put';
        }
        api(
          apiAction,
          apiUrl,
          this.formCharacteristics,
          () => {
            this.getCharacters();
            $(this.$refs.modalCharacteristics).modal('hide');
          },
          () => {},
        );
      }
    },
    getMeasureListName(id) {
      const measurement = this.measurements.filter(item => item.id === Number(id));
      if (measurement && measurement.length > 0) {
        return measurement[0].name;
      }
      return '';
    },
    getValueListName(id) {
      const value = this.valuelist.filter(item => item.id === Number(id));
      if (value && value.length > 0) {
        return value[0].name;
      }
      return '';
    },
  },
};
</script>
