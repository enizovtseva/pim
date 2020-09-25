<template lang="pug">
  .Measure
    .row.heading-bg
      .col-lg-3.col-md-4.col-sm-4.col-xs-12
        h5.txt-dark Списки значений
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
                  span.mr-20(v-if="valuelist") Всего {{ valuelist.length }}
                  span.mr-20(v-else) Всего 0
                  pagination(v-if="valuelist" :pagination-data="paginationData" :data="valuelistFiltered")
                .col-lg-2.col-md-3.col-sm-3
                  search(v-if="valuelist" :search-data="searchData" :data="valuelist")
                .col-lg-4.col-md-3.col-sm-3.text-right
                  button.btn.btn-success.input-sm.mt-5.mb-5(@click="addValue()") Создать
              hr.light-grey-hr.mt-15
              .row
                .col-sm-12
                  table.table.mb-0(v-if="valuelist")
                    thead
                      tr
                        th Название
                        th.text-center Тип списка
                        th.text-center Количество значений
                        th.text-center Единица измерения
                        th.text-center Редактировать
                        th.text-center Связки
                        th.text-center Удалить
                    tbody
                      tr(v-for="value in paginationData.result" v-bind:key="value.id")
                        td
                          a(:href="`/values-details.html?id=${value.id}`") {{value.name}}
                        td.text-center {{ types.filter(item => item.id == value.type)[0].name }}
                        td.text-center {{ value.value.length }}
                        td.text-center
                          span(v-if="measurements && value.type == 'NUM'") {{ getMeasureListName(value.measurement_unit) }}
                        td.text-center
                          a(@click="editValue(value)")
                            i.fa.fa-pencil
                        td.text-center
                          i.fa.fa-share-alt
                        td.text-center
                          a(@click="deleteValue(value.id)")
                            i.fa.fa-trash-o.txt-danger
              hr.light-grey-hr
              .row.mt-30.align-items-center
                .col-lg-8.col-md-9.col-sm-9
                  span.mr-20(v-if="valuelist") Всего {{ valuelist.length }}
                  span.mr-20(v-else) Всего 0
                  pagination(v-if="valuelist" :pagination-data="paginationData" :data="valuelistFiltered")
                .col-lg-4.col-md-3.col-sm-3.text-right
                  button.btn.btn-success.input-sm.mt-5.mb-5(@click="addValue()") Создать
    .modal.modalValues(ref="modalValues")
      .modal-dialog
        .modal-content
          form(@submit.prevent="formValueSubmit")
            .modal-header
              h5.modal-title Создать Значение
              button.close(type="button" data-dismiss="modal") ×
            .modal-body
              .form-group
                label.control-label.mb-10 Название
                input.form-control(type="text" name="name" v-model="formValue.name")
              .form-group
                label.control-label.mb-10 Тип списка
                select.form-control(v-model="formValue.type")
                  option(value="null" selected disabled) Выберите тип списка
                  option(v-for="item in types" :value="item.id") {{ item.name }}
              .form-group
                label.control-label.mb-10 Единица измерения
                select.form-control(data-style="form-control btn-default btn-outline" v-if="measurements" v-model="formValue.measurement_unit")
                  option(value="null" selected disabled) Выберите единицу измерения
                  option(v-for="item in measurements" :value="item.id") {{ item.name }}
            .modal-footer
              button.btn.btn-danger(v-if="editValueId" type="submit") Сохранить
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
  name: 'ValuesList',
  components: {
    Pagination,
    Search,
  },
  data() {
    return {
      valuelist: null,
      measurements: null,
      valuelistFiltered: null,
      editValueId: null,
      formValue: {
        name: '',
        type: '',
        measurement_unit: null,
        value: [1, 2],
      },
      formValueSubmitted: false,
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
        },
      ],
    };
  },
  validations: {
    formValue: {
      name: {
        required,
      },
    },
  },
  mounted() {
    this.getValuesList();
    this.getMeasureList();
    this.$root.$on('afterSearch', () => {
      this.valuelistFiltered = this.searchData.result;
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
          this.valuelistFiltered = this.valuelist;
        },
        () => {},
      );
    },
    addValue() {
      this.formValueSubmitted = false;
      this.editValueId = null;
      this.formValue.name = null;
      this.formValue.type = null;
      this.formValue.measurement_unit = null;
      $(this.$refs.modalValues).modal('show');
    },
    editValue(measurement) {
      this.formValueSubmitted = false;
      this.editValueId = measurement.id;
      this.formValue.name = measurement.name;
      this.formValue.type = measurement.type;
      this.formValue.measurement_unit = measurement.measurement_unit;
      $(this.$refs.modalValues).modal('show');
    },
    deleteValue(id) {
      this.formValueSubmitted = false;
      this.editValueId = null;
      this.formValue.name = null;
      this.formValue.type = null;
      this.formValue.measurement_unit = null;
      api(
        'delete',
        process.env.VUE_APP_BASE_URL.concat('/pim/valuelist/').concat(id),
        null,
        () => this.getValuesList(),
        () => {},
      );
    },
    formValueSubmit() {
      this.formValueSubmitted = true;
      this.$v.$touch();
      if (!this.$v.$invalid) {
        let apiUrl = process.env.VUE_APP_BASE_URL.concat('/pim/valuelist/');
        let apiAction = 'post';
        if (this.editValueId) {
          apiUrl += this.editValueId;
          apiAction = 'put';
        }
        api(
          apiAction,
          apiUrl,
          this.formValue,
          () => {
            this.getValuesList();
            $(this.$refs.modalValues).modal('hide');
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
  },
};
</script>
