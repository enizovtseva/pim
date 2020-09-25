<template lang="pug">
  .Measure
    .row.heading-bg
      .col-lg-3.col-md-4.col-sm-4.col-xs-12
        h5.txt-dark(v-if="measurement.name") {{ measurement.name }}
      .col-lg-9.col-sm-8.col-md-8.col-xs-12
        ol.breadcrumb
          li
            a(href="/") PIM
          li
            a(href="/measure-list.html") Структура данных
          li.active
            span Единицы измерения
    .row
      .col-md-12
        .panel.panel-default.card-view
          .panel-wrapper
            .panel-body.pt-0
              .row.align-items-center
                .col-lg-6.col-md-6.col-sm-6
                  span.mr-20(v-if="measurementList") Всего {{ measurementList.length }}
                  span.mr-20(v-else) Всего 0
                  pagination(v-if="measurementList" :pagination-data="paginationData" :data="measurementsFiltered")
                .col-lg-2.col-md-3.col-sm-3
                  search(v-if="measurementList" :search-data="searchData" :data="measurementList")
                .col-lg-4.col-md-3.col-sm-3.text-right
                  button.btn.btn-success.input-sm.mt-5.mb-5(@click="addMeasurement()") Создать
              hr.light-grey-hr.mt-15
              .row
                .col-sm-12
                  table.table.mb-0(v-if="measurementList")
                    thead
                      tr
                        th Название
                        th.text-center Русское
                        th.text-center Международное
                        th.text-center Главная
                        th.text-center Коэффициент
                        th.text-center Редактировать
                        th.text-center Удалить
                    tbody
                      tr(v-for="item in measurementsFiltered" v-bind:key="item.id")
                        td {{ item.name }}
                        td.text-center {{ item.name_short_ru }}
                        td.text-center {{ item.name_short_en }}
                        td.text-center
                          i.fa.fa-star(v-if="item.is_main")
                          i.fa.fa-star-o(v-else)
                        td.text-center {{ item.scale }}
                        td.text-center
                          a(@click="editMeasurement(item)")
                            i.fa.fa-pencil
                        td.text-center
                          a(@click="deleteMeasurement(item.id)")
                            i.fa.fa-trash-o.txt-danger
              hr.light-grey-hr
              .row.mt-30.align-items-center
                .col-lg-8.col-md-9.col-sm-9
                  span.mr-20(v-if="measurementList") Всего {{ measurementList.length }}
                  span.mr-20(v-else) Всего 0
                  pagination(v-if="measurementList" :pagination-data="paginationData" :data="measurementsFiltered")
                .col-lg-4.col-md-3.col-sm-3.text-right
                  button.btn.btn-success.input-sm.mt-5.mb-5(@click="addMeasurement()") Создать
    .modal.modalMeasurement(ref="modalMeasurement")
      .modal-dialog
        .modal-content
          form(@submit.prevent="formMeasurementSubmit")
            .modal-header
              h5.modal-title Редактирование единицы измерения
              button.close(type="button" data-dismiss="modal" aria-hidden="true") ×
            .modal-body
              .form-group
                label.control-label.mb-10 Название единицы измерения
                input.form-control(type="text" name="name" v-model="formMeasure.name" :class="{ 'is-invalid': formMeasureSubmitted && $v.formMeasure.name.$error }")
                .invalid-feedback(v-if="formMeasureSubmitted && !$v.formMeasure.name.required") Поле обязательно для заполнения
              .form-group
                label.control-label.mb-10 Обозначение на русском языке
                input.form-control(type="text" name="name_short_ru" v-model="formMeasure.name_short_ru" :class="{ 'is-invalid': formMeasureSubmitted && $v.formMeasure.name_short_ru.$error }")
                .invalid-feedback(v-if="formMeasureSubmitted && !$v.formMeasure.name.required") Поле обязательно для заполнения
              .form-group
                label.control-label.mb-10 Обозначение на английском языке
                input.form-control(type="text" name="name_short_en" v-model="formMeasure.name_short_en")
              .form-group
                label.control-label.mb-10 Коэффициент
                input.form-control(type="text" name="scale" v-model="formMeasure.scale" :class="{ 'is-invalid': formMeasureSubmitted && $v.formMeasure.scale.$error }")
                .invalid-feedback(v-if="formMeasureSubmitted && !$v.formMeasure.name.required") Поле обязательно для заполнения
              .form-group
                .checkbox.checkbox-default.ml-20
                  input#is_main(type="checkbox" v-model="formMeasure.is_main")
                  label.control-label(for="is_main") Главная единица измерения
            .modal-footer
              button.btn.btn-danger(v-if="editMeasurementId" type="submit") Сохранить
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
  name: 'MeasureDetails',
  components: {
    Pagination,
    Search,
  },
  data() {
    return {
      measurement: {
        id: null,
        name: '',
      },
      measurementList: null,
      measurementsFiltered: null,
      editMeasurementId: null,
      formMeasure: {
        name: '',
        name_short_ru: '',
        name_short_en: '',
        is_main: false,
        scale: '',
        measure: null,
      },
      formMeasureSubmitted: false,
      paginationData: {
        pageNumber: 0,
        pageSize: 10,
        pageCount: 0,
        result: null,
      },
      searchData: {
        value: '',
        result: null,
        fields: ['name', 'name_short_ru', 'name_short_en', 'scale'],
      },
    };
  },
  validations: {
    formMeasure: {
      name: {
        required,
      },
      name_short_ru: {
        required,
      },
      scale: {
        required,
      },
    },
  },
  mounted() {
    const params = window
      .location
      .search
      .replace('?', '')
      .split('&')
      .reduce((p, e) => {
        const a = e.split('=');
        const b = p;
        b[decodeURIComponent(a[0])] = decodeURIComponent(a[1]);
        return b;
      }, {});
    this.formMeasure.measure = params.id;
    this.getMeasure();
    this.$root.$on('afterSearch', () => {
      this.measurementsFiltered = this.searchData.result;
    });
  },
  methods: {
    getMeasure() {
      api(
        'get',
        process.env.VUE_APP_BASE_URL.concat('/pim/measurement/').concat(this.formMeasure.measure),
        null,
        (res) => {
          this.measurement = res.data;
          this.getMeasureList();
        },
        () => {},
      );
    },
    getMeasureList() {
      api(
        'get',
        process.env.VUE_APP_BASE_URL.concat('/pim/measurement/units/').concat(this.measurement.name),
        null,
        (res) => {
          this.measurementList = res.data.sort((a, b) => a.id - b.id);
          this.measurementsFiltered = this.measurementList;
        },
        () => {},
      );
    },
    addMeasurement() {
      this.formMeasureSubmitted = false;
      this.editMeasurementId = null;
      this.formMeasure.name = null;
      this.formMeasure.name_short_ru = null;
      this.formMeasure.name_short_en = null;
      this.formMeasure.is_main = false;
      this.formMeasure.scale = null;
      $(this.$refs.modalMeasurement).modal('show');
    },
    editMeasurement(measurement) {
      this.formMeasureSubmitted = false;
      this.editMeasurementId = measurement.id;
      this.formMeasure.name = measurement.name;
      this.formMeasure.name_short_ru = measurement.name_short_ru;
      this.formMeasure.name_short_en = measurement.name_short_en;
      this.formMeasure.is_main = measurement.is_main;
      this.formMeasure.scale = measurement.scale;
      $(this.$refs.modalMeasurement).modal('show');
    },
    deleteMeasurement(id) {
      this.formMeasureSubmitted = false;
      this.editMeasurementId = null;
      this.formMeasure.name = null;
      this.formMeasure.name_short_ru = null;
      this.formMeasure.name_short_en = null;
      this.formMeasure.is_main = false;
      this.formMeasure.scale = null;
      api(
        'delete',
        process.env.VUE_APP_BASE_URL.concat('/pim/measurement/unit/').concat(id),
        null,
        () => this.getMeasureList(),
        () => {},
      );
    },
    formMeasurementSubmit() {
      this.formMeasureSubmitted = true;
      this.$v.$touch();
      if (!this.$v.$invalid) {
        let apiUrl = process.env.VUE_APP_BASE_URL.concat('/pim/measurement/unit/');
        let apiAction = 'post';
        if (this.editMeasurementId) {
          apiUrl += this.editMeasurementId;
          apiAction = 'put';
        }
        api(
          apiAction,
          apiUrl,
          this.formMeasure,
          () => {
            this.getMeasureList();
            $(this.$refs.modalMeasurement).modal('hide');
          },
          () => {},
        );
      }
    },
  },
};
</script>
