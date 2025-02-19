<template>
  <v-quickstart-layout>
    <section>
      <header>
        <h1 data-cy="title">Explore AppMaps</h1>
      </header>
      <main>
        <v-status
          :status-states="statusStates"
          :current-status="statusStates[2]"
          :project-name="projectName"
          :num-app-maps="numAppMaps"
          :current-step="0"
          :viewing-step="2"
          class="mb20"
        >
          <template #header> {{ projectName }} has {{ appMaps.length }} AppMaps </template>
          <template #subheader>
            <template v-if="complete">
              Next step: View runtime analysis report for {{ projectName }}
            </template>
            <template v-else>Open an AppMap</template>
          </template>
        </v-status>
        <article v-if="appMaps.length">
          <p>
            AppMaps have been recorded for this project! <br />
            We've identified some interesting AppMaps and Code Objects that you may want to check
            out.
          </p>
          <div class="table-wrap">
            <table class="qs-appmaps-table" data-cy="appmaps">
              <colgroup>
                <col width="70%" />
                <col width="10%" />
                <col width="10%" />
                <col width="10%" />
              </colgroup>
              <thead>
                <tr>
                  <th><h2 class="subhead">AppMaps</h2></th>
                  <th>Requests</th>
                  <th>SQL</th>
                  <th>Functions</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="appMap in appMaps"
                  :key="appMap.path"
                  @click="openAppmap(appMap.path)"
                  data-cy="appmap"
                >
                  <td>{{ appMap.name }}</td>
                  <td>{{ appMap.requests }}</td>
                  <td>{{ appMap.sqlQueries }}</td>
                  <td>{{ appMap.functions }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="qs-explore-code-objects" data-cy="code-objects">
            <h2 class="subhead">Code objects</h2>
            <ul class="code-object-list">
              <div class="collapse-expand">
                <div class="accordion-toggle">
                  <p>HTTP Server requests</p>
                </div>
              </div>
              <li
                v-for="httpRequest in httpRequests"
                :key="httpRequest.path"
                @click="openAppmap(httpRequest.path)"
                data-cy="httpRequest"
              >
                <a href="#">{{ httpRequest.name }}</a>
              </li>
            </ul>
            <ul class="code-object-list">
              <div class="collapse-expand">
                <div class="accordion-toggle">
                  <p>Queries</p>
                </div>
              </div>
              <li
                v-for="query in queries"
                :key="query.path"
                @click="openAppmap(query.path)"
                data-cy="query"
              >
                <a href="#">{{ query.name }}</a>
              </li>
            </ul>
          </div>
        </article>
        <article v-else data-cy="no-appmaps">
          No AppMaps have been found in your project. Try
          <a href="#" @click.prevent="$root.$emit('open-instruction', 'record-appmaps')">
            recording AppMaps
          </a>
          first.
        </article>
      </main>
      <v-navigation-buttons :first="first" :last="last" :complete="complete" />
    </section>
  </v-quickstart-layout>
</template>

<script>
import VNavigationButtons from '@/components/install-guide/NavigationButtons.vue';
import VQuickstartLayout from '@/components/quickstart/QuickstartLayout.vue';
import VStatus from '@/components/install-guide/Status.vue';
import Navigation from '@/components/mixins/navigation';
import StatusState from '@/components/mixins/statusState.js';

export default {
  name: 'OpenAppMaps',

  components: {
    VQuickstartLayout,
    VNavigationButtons,
    VStatus,
  },

  mixins: [Navigation, StatusState],

  props: {
    appMaps: {
      type: Array,
      default: () => [],
    },
    sampleCodeObjects: {
      type: Object,
      default: () => ({}),
    },
    projectName: {
      type: String,
      default: '',
    },
    complete: {
      type: Boolean,
      default: false,
    },
    numAppMaps: {
      type: Number,
      required: true,
    },
  },

  computed: {
    httpRequests() {
      return this.sampleCodeObjects && this.sampleCodeObjects.httpRequests;
    },
    queries() {
      return this.sampleCodeObjects && this.sampleCodeObjects.queries;
    },
  },

  methods: {
    openAppmap(path) {
      this.$root.$emit('openAppmap', path);
    },
  },
};
</script>

<style lang="scss" scoped>
.table-wrap {
  margin-bottom: 1.5rem;
  border-radius: $border-radius;
  &::-webkit-scrollbar-thumb {
    background: $gray-secondary;
  }
}
.qs-explore-code-objects {
  margin: 2rem 0;
  .code-object-list {
    .collapse-expand {
      border-bottom: 1px solid lighten($gray2, 08);
      padding: 0.4rem 0;
      .accordion-toggle {
        display: flex;
        gap: 0.5rem;
        .counter-badge {
          display: flex;
          align-items: center;
          align-content: center;
          background-color: $gray1;
          border-radius: 1rem;
          padding: 0 0.3rem;
          font-size: 0.7rem;
          font-weight: 800;
          letter-spacing: 1px;
        }
      }
    }
  }
  ul {
    list-style-type: none;
    padding: 0;
    li {
      padding: 0.2rem 0.5rem;
      border-bottom: 1px solid lighten($gray2, 08);
      &:hover {
        background-color: lighten($gray2, 08);
        cursor: pointer;
      }
    }
  }
  .subhead {
    border-bottom: 1px solid $gray-secondary;
    font-size: 1.25rem;
    padding-bottom: 0.25rem;
    font-weight: 600;
  }
}
.qs-appmaps-table {
  margin: 1.5rem 0;
  border-collapse: collapse;
  width: 100%;
  th,
  td {
    border: none;
    padding: 0 1rem;
    font-weight: normal;
    color: $base07;
    text-align: left;
    white-space: nowrap;
    &:first-child {
      padding-left: 0;
    }
  }
  tr {
    border-bottom: 1px solid lighten($gray2, 08);
    a {
      color: $white;
    }
    &:hover {
      background-color: lighten($gray2, 08);
    }
  }
  tbody {
    tr {
      cursor: pointer;
    }
    td {
      padding: 0.2rem 0.5rem;
      color: $powderblue;
      white-space: normal;
      &:hover {
        color: $white;
      }
    }
  }
  th {
    border-bottom: 1px solid $gray-secondary;
  }
}
.collapse-expand {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  svg {
    margin-left: 0.5rem;
  }
}
</style>
