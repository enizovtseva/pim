<template lang="pug">
  .Measure
    .row.heading-bg
      .col-lg-3.col-md-4.col-sm-4.col-xs-12
        h5.txt-dark(v-if="valueslist.name") {{ valueslist.name }}
      .col-lg-9.col-sm-8.col-md-8.col-xs-12
        ol.breadcrumb
          li
            a(href="/") PIM
          li
            a(href="/values-list.html") Структура данных
          li.active
            span Списки значений
    .row
      .col-md-12
        .panel.panel-default.card-view
          .panel-wrapper
            .panel-body.pt-0
              .row.align-items-center
                .col-lg-6.col-md-6.col-sm-6
                  span.mr-20(v-if="values") Всего {{ values.length }}
                  span.mr-20(v-else) Всего 0
                  pagination(v-if="values" :pagination-data="paginationData" :data="valuesFiltered")
                .col-lg-2.col-md-3.col-sm-3
                  search(v-if="values" :search-data="searchData" :data="values")
                .col-lg-4.col-md-3.col-sm-3.text-right
                  button.btn.btn-success.input-sm.mt-5.mb-5(@click="addValue()") Создать
              hr.light-grey-hr.mt-15
              .row
                .col-sm-12
                  table.table.mb-0
                    thead
                      tr
                        th Название
                        th.text-center Единица измерения
                        th.text-center Редактировать
                        th.text-center Перевязать
                        th.text-center Удалить
                    tbody
                      tr(v-for="value in valuesFiltered" v-bind:key="value.id")
                        td {{ value.name }}
                        td.text-center {{ measurements.filter(item => item.id == value.measurement_unit)[0].name }}
                        td.text-center
                          a(@click="editValue(value)")
                            i.fa.fa-pencil
                        td.text-center
                          i.fa.fa-refresh
                        td.text-center
                          a(@click="deleteValue(value.id)")
                            i.fa.fa-trash-o.txt-danger
              hr.light-grey-hr
              .row.mt-30.align-items-center
                .col-lg-8.col-md-9.col-sm-9
                  span.mr-20(v-if="values") Всего {{ values.length }}
                  span.mr-20(v-else) Всего 0
                  pagination(v-if="values" :pagination-data="paginationData" :data="valuesFiltered")
                .col-lg-4.col-md-3.col-sm-3.text-right
                  button.btn.btn-success.input-sm.mt-5.mb-5(@click="addValue()") Создать
    .modal.add(ref="modalValue")
      .modal-dialog
        .modal-content
          form(@submit.prevent="formValueSubmit")
            .modal-header
              h5.modal-title Создание значений
              button.close(type="button" data-dismiss="modal" aria-hidden="true") ×
            .modal-body
              form
                div.form-group
                  .row
                    .col-md-6.text-center
                      label.control-label Значение
                    .col-md-6.text-center
                      label.control-label Единица измерения
                .form-group
                  .row
                    .col-md-6
                      input.form-control(type="text" name="name" placeholder="Введите значение" v-model="formValue.name" :class="{ 'is-invalid': formValueSubmitted && $v.formValue.name.$error }")
                      .invalid-feedback(v-if="formValueSubmitted && !$v.formValue.name.required") Поле обязательно для заполнения
                    .col-md-6
                      select.form-control(data-style="form-control btn-default btn-outline" v-if="measurements" v-model="formValue.measurement_unit" :class="{ 'is-invalid': formValueSubmitted && $v.formValue.measurement_unit.$error }")
                        option(v-for="item in measurements" :value="item.id") {{ item.name }}
                      .invalid-feedback(v-if="formValueSubmitted && !$v.formValue.measurement_unit.required") Поле обязательно для заполнения
            .modal-footer.pl-0.pr-0
              .col-xs-4.text-left.m-0
                button.btn.btn-default(type="button" data-dismiss="modal") Отменить
              .col-xs-4.text-center.m-0
                //- button.btn.btn-default(v-if="!editValueId" type="button" @click="addRow()") +
              .col-xs-4.text-right.m-0
                button.btn.btn-danger(type="submit") Сохранить
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
  name: 'ValuesDetails',
  components: {
    Pagination,
    Search,
  },
  data() {
    return {
      valueslist: {
        id: null,
        name: '',
        type: '',
        num_values: 0,
        value: [],
      },
      values: null,
      measurements: null,
      valuesFiltered: null,
      editValueId: null,
      formValue: {
        name: '',
        measurement_unit: 0,
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
        fields: ['name', 'name_short_ru', 'name_short_en', 'scale'],
      },
    };
  },
  validations: {
    formValue: {
      name: {
        required,
      },
      measurement_unit: {
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
    this.formValue.valueslist = params.id;
    this.getValuesList();
    this.getMeasureList();
    this.$root.$on('afterSearch', () => {
      this.valuesFiltered = this.searchData.result;
      console.log('this.valuesFiltered', this.valuesFiltered);
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
        process.env.VUE_APP_BASE_URL.concat('/pim/valuelist/').concat(this.formValue.valueslist),
        null,
        (res) => {
          this.valueslist = res.data;
          this.getValues();
        },
        () => {},
      );
    },
    getValues() {
      api(
        'get',
        process.env.VUE_APP_BASE_URL.concat('/pim/valuelist/value/').concat(this.valueslist.name),
        null,
        (res) => {
          this.values = res.data.sort((a, b) => a.id - b.id);
          this.valuesFiltered = this.values;
        },
        () => {},
      );
    },
    addValue() {
      this.formValueSubmitted = false;
      this.editValueId = null;
      this.formValue.name = null;
      this.formValue.measurement_unit = null;
      $(this.$refs.modalValue).modal('show');
    },
    editValue(value) {
      this.formValueSubmitted = false;
      this.editValueId = value.id;
      this.formValue.name = value.name;
      this.formValue.measurement_unit = value.measurement_unit;
      $(this.$refs.modalValue).modal('show');
    },
    deleteValue(id) {
      this.formValueSubmitted = false;
      this.editValueId = null;
      this.formValue.name = null;
      this.formValue.measurement_unit = null;
      api(
        'delete',
        process.env.VUE_APP_BASE_URL.concat('/pim/value/').concat(id),
        null,
        () => this.getValues(),
        () => {},
      );
    },
    formValueSubmit() {
      this.formValueSubmitted = true;
      this.$v.$touch();
      if (!this.$v.$invalid) {
        let apiUrl = process.env.VUE_APP_BASE_URL;
        let apiAction = 'post';
        if (this.editValueId) {
          apiUrl = apiUrl.concat('/pim/value/').concat(this.editValueId);
          apiAction = 'put';
        } else apiUrl = apiUrl.concat('/pim/link/value/').concat(this.valueslist.name);
        api(
          apiAction,
          apiUrl,
          this.formValue,
          () => {
            this.getValues();
            $(this.$refs.modalValue).modal('hide');
          },
          () => {},
        );
      }
    },
    addRow() {},
  },
};
</script>
