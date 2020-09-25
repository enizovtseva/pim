<template lang="pug">
  .Measure
    .row.heading-bg
      .col-lg-3.col-md-4.col-sm-4.col-xs-12
        h5.txt-dark Единицы измерения
      .col-lg-9.col-sm-8.col-md-8.col-xs-12
        ol.breadcrumb
          li
            a(href="/") PIM
          li.active
            span Структура данных
    .row
      .col-md-12
        .panel.panel-default.card-view
          .panel-wrapper
            .panel-body.pt-0
              .row.align-items-center
                .col-lg-6.col-md-6.col-sm-6
                  span.mr-20(v-if="measurements") Всего {{ measurements.length }}
                  span.mr-20(v-else) Всего 0
                  pagination(v-if="measurements" :pagination-data="paginationData" :data="measurementsFiltered")
                .col-lg-2.col-md-3.col-sm-3
                  search(v-if="measurements" :search-data="searchData" :data="measurements")
                .col-lg-4.col-md-3.col-sm-3.text-right
                  button.btn.btn-success.input-sm.mt-5.mb-5(@click="addMeasure()") Создать
              hr.light-grey-hr.mt-15
              .row
                .col-sm-12
                  //- Table(v-if="measurements" :table-data="tableData" :data="paginationData.result" v-on:editMeasure="change")
                  table.table.mb-0(v-if="measurements")
                    thead
                      tr
                        th Название
                        th.text-center Главная
                        th.text-center Редактировать
                        th.text-center Удалить
                    tbody
                      tr(v-for="measurement in paginationData.result" v-bind:key="measurement.id")
                        td
                          a(:href="`/measure-details.html?id=${measurement.id}`") {{measurement.name}}
                        td.text-center {{measurement.is_main}}
                        td.text-center
                          a(@click="editMeasure(measurement)")
                            i.fa.fa-pencil
                        td.text-center
                          a(@click="deleteMeasure(measurement.id)")
                            i.fa.fa-trash-o.txt-danger
              hr.light-grey-hr
              .row.mt-30.align-items-center
                .col-lg-8.col-md-9.col-sm-9
                  span.mr-20(v-if="measurements") Всего {{ measurements.length }}
                  span.mr-20(v-else) Всего 0
                  pagination(v-if="measurements" :pagination-data="paginationData" :data="measurementsFiltered")
                .col-lg-4.col-md-3.col-sm-3.text-right
                  button.btn.btn-success.input-sm.mt-5.mb-5(@click="addMeasure()") Создать
    .modal.modalMeasure(ref="modalMeasure")
      .modal-dialog
        .modal-content
          form(@submit.prevent="formMeasureSubmit")
            .modal-header
              h5.modal-title Создать Измерение
              button.close(type="button" data-dismiss="modal") ×
            .modal-body
              .form-group
                label.control-label.mb-10 Название
                input.form-control(type="text" name="name" v-model="formMeasure.name" :class="{ 'is-invalid': formMeasureSubmitted && $v.formMeasure.name.$error }")
                .invalid-feedback(v-if="formMeasureSubmitted && !$v.formMeasure.name.required") Поле обязательно для заполнения
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
import Table from '../components/Table/Table.vue';
import api from '../helpers/api';

Vue.use(Vuelidate);

export default {
  name: 'MeasureList',
  components: {
    Pagination,
    Search,
    Table,
  },
  data() {
    return {
      measurements: null,
      measurementsFiltered: null,
      editMeasurementId: null,
      formMeasure: {
        name: '',
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
        fields: ['name', 'is_main'],
      },
      tableData: {
        columns: [
          {
            id: 'name',
            title: 'Название',
            url: '/measure-details.html',
          },
          {
            id: 'is_main',
            title: 'Главная',
          },
          {
            id: 'edit',
            title: 'Редактировать',
          },
          {
            id: 'delete',
            title: 'Удалить',
          },
        ],
      },
    };
  },
  validations: {
    formMeasure: {
      name: {
        required,
      },
    },
  },
  mounted() {
    this.getMeasureList();
    this.$root.$on('afterSearch', () => {
      this.measurementsFiltered = this.searchData.result;
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
          this.measurementsFiltered = this.measurements;
        },
        () => {},
      );
    },
    addMeasure() {
      this.formMeasureSubmitted = false;
      this.editMeasurementId = null;
      this.formMeasure.name = null;
      $(this.$refs.modalMeasure).modal('show');
    },
    editMeasure(measurement) {
      this.formMeasureSubmitted = false;
      this.editMeasurementId = measurement.id;
      this.formMeasure.name = measurement.name;
      $(this.$refs.modalMeasure).modal('show');
    },
    deleteMeasure(id) {
      this.formMeasureSubmitted = false;
      this.editMeasurementId = null;
      this.formMeasure.name = null;
      api(
        'delete',
        process.env.VUE_APP_BASE_URL.concat('/pim/measurement/').concat(id),
        null,
        () => this.getMeasureList(),
        () => {},
      );
    },
    formMeasureSubmit() {
      this.formMeasureSubmitted = true;
      this.$v.$touch();
      if (!this.$v.$invalid) {
        let apiUrl = process.env.VUE_APP_BASE_URL.concat('/pim/measurement/');
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
            $(this.$refs.modalMeasure).modal('hide');
          },
          () => {},
        );
      }
    },
  },
};
</script>
