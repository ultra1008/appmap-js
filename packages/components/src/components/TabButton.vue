<template>
  <button :class="classes" @click="clickTab">
    {{ label }}
  </button>
</template>

<script>
export default {
  name: 'v-tab-button',

  computed: {
    classes() {
      return {
        'tab-btn': true,
        'tab-btn--active': this.isActive,
      };
    },
  },

  props: {
    label: {
      type: String,
      required: true,
    },
    isActive: Boolean,
    tabName: String,
  },

  methods: {
    clickTab() {
      this.$root.$emit('clickTab', this.tabName);
    },
  },
};
</script>

<style scoped lang="scss">
.tab-btn {
  align-self: flex-end;
  position: relative;
  bottom: -1px;
  appearance: none;
  border: 1px solid $gray2;
  border-radius: 0.25rem 0.25rem 0 0;
  background-color: transparent;
  cursor: pointer;
  color: $lightgray2;
  font-size: 0.75rem;
  font-family: $appland-text-font-family;
  padding: 0.5rem 0.5rem;
  margin: 0;
  transition: $transition;
  white-space: nowrap;

  &:hover,
  &:active {
    color: $base03;
  }

  &:focus {
    outline: none;
  }

  &--active {
    border-bottom-color: $black;
    cursor: default;
    color: $base03;

    &:hover,
    &:active {
      color: $base03;
    }
  }

  .tab-badge {
    background-color: $hotpink;
    font-size: 11px;
    border-radius: 3px;
    margin-left: 0.4rem;
    padding: 2px 4px;
    color: white;
  }
}
</style>
