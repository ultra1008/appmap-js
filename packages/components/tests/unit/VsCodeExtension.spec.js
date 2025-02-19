import { mount, createWrapper } from '@vue/test-utils';
import VsCodeExtension from '@/pages/VsCodeExtension.vue';
import { VIEW_FLOW } from '@/store/vsCode';
import data from './fixtures/user_page_scenario.appmap.json';
import Vue from 'vue';
import { RESET_FILTERS } from '../../src/store/vsCode';
import { AppMapFilter, serializeFilter, base64UrlEncode } from '@appland/models';

describe('VsCodeExtension.vue', () => {
  let wrapper; // Wrapper<Vue>
  let rootWrapper; // Wrapper<Vue>

  function stateObjectToBase64(stateObject) {
    return Buffer.from(JSON.stringify(stateObject), 'utf-8').toString('base64url');
  }

  beforeEach(() => {
    wrapper = mount(VsCodeExtension, {
      stubs: {
        'v-diagram-component': true,
        'v-diagram-trace': true,
      },
    });
    rootWrapper = createWrapper(wrapper.vm.$root);
    wrapper.vm.loadData(data);
    wrapper.vm.$store.commit(RESET_FILTERS);
  });

  it('sets the selected object by FQID', () => {
    wrapper.vm.setState('{"selectedObject":"label:json"}');
    expect(wrapper.vm.selectedLabel).toMatch('json');

    wrapper.vm.setState('{"selectedObject":"event:44"}');
    expect(wrapper.vm.selectedObject.toString()).toMatch('User.find_by_id!');

    wrapper.vm.setState('{"selectedObject":"class:app/models/User"}');
    expect(wrapper.vm.selectedObject.id).toMatch('app/models/User');

    wrapper.vm.setState('{"selectedObject":"analysis-finding:fakeHash"}');
    expect(wrapper.vm.selectedObject.id).toMatch('fakeHash');

    wrapper.vm.clearSelection();

    const appState =
      '{"currentView":"viewComponent","filters":{"rootObjects":["package:app/controllers"],"limitRootEvents":false,"hideMediaRequests":false,"hideUnlabeled":true,"hideElapsedTimeUnder":100,"hideName":["package:json"]}}';

    wrapper.vm.setState(appState);

    expect(wrapper.vm.filters.rootObjects).toContain('package:app/controllers');
    expect(wrapper.vm.filters.declutter.limitRootEvents.on).toBe(false);
    expect(wrapper.vm.filters.declutter.hideMediaRequests.on).toBe(false);
    expect(wrapper.vm.filters.declutter.hideUnlabeled.on).toBe(true);
    expect(wrapper.vm.filters.declutter.hideElapsedTimeUnder.on).toBe(true);
    expect(wrapper.vm.filters.declutter.hideElapsedTimeUnder.time).toBe(100);
    expect(wrapper.vm.filters.declutter.hideName.on).toBe(true);
    expect(wrapper.vm.filters.declutter.hideName.names).toContain('package:json');

    expect(wrapper.vm.getState()).toEqual(
      'eyJjdXJyZW50VmlldyI6InZpZXdDb21wb25lbnQiLCJmaWx0ZXJzIjp7InJvb3RPYmplY3RzIjpbInBhY2thZ2U6YXBwL2NvbnRyb2xsZXJzIl0sImxpbWl0Um9vdEV2ZW50cyI6ZmFsc2UsImhpZGVNZWRpYVJlcXVlc3RzIjpmYWxzZSwiaGlkZVVubGFiZWxlZCI6dHJ1ZSwiaGlkZUVsYXBzZWRUaW1lVW5kZXIiOjEwMCwiaGlkZU5hbWUiOlsicGFja2FnZTpqc29uIl19fQ'
    );
  });

  it('default state encodes the current view', () => {
    expect(wrapper.vm.getState()).toEqual(stateObjectToBase64({ currentView: 'viewComponent' }));
  });

  it('serializes selectedObject state', async () => {
    const state = { selectedObject: 'event:44' };
    await wrapper.vm.setState(JSON.stringify(state));
    expect(wrapper.vm.selectedObject.toString()).toMatch('User.find_by_id!');
    expect(wrapper.vm.getState()).toEqual(
      stateObjectToBase64({ ...{ currentView: 'viewComponent' }, ...state })
    );
  });

  it('serializes rootObjects state', async () => {
    const state = { filters: { rootObjects: ['package:app/controllers'] } };
    await wrapper.vm.setState(JSON.stringify(state));
    expect(wrapper.vm.filters.rootObjects).toContain('package:app/controllers');
    expect(wrapper.vm.getState()).toEqual(
      stateObjectToBase64({ ...{ currentView: 'viewComponent' }, ...state })
    );
  });

  it('serializes limitRootEvents state', async () => {
    const state = { filters: { limitRootEvents: false } };
    await wrapper.vm.setState(JSON.stringify(state));
    expect(wrapper.vm.getState()).toEqual(
      stateObjectToBase64({ ...{ currentView: 'viewComponent' }, ...state })
    );
  });

  it('serializes hideMediaRequests state', async () => {
    const state = { filters: { hideMediaRequests: false } };
    await wrapper.vm.setState(JSON.stringify(state));
    expect(wrapper.vm.getState()).toEqual(
      stateObjectToBase64({ ...{ currentView: 'viewComponent' }, ...state })
    );
  });

  it('serializes hideUnlabeled state', async () => {
    const state = { filters: { hideUnlabeled: true } };
    await wrapper.vm.setState(JSON.stringify(state));
    expect(wrapper.vm.getState()).toEqual(
      stateObjectToBase64({ ...{ currentView: 'viewComponent' }, ...state })
    );
  });

  it('serializes hideElapsedTimeUnder state', async () => {
    const state = { filters: { hideElapsedTimeUnder: 100 } };
    await wrapper.vm.setState(JSON.stringify(state));
    expect(wrapper.vm.getState()).toEqual(
      stateObjectToBase64({ ...{ currentView: 'viewComponent' }, ...state })
    );
  });

  it('serializes hideName state', async () => {
    const state = {
      filters: { hideName: ['package:json', 'class:User'] },
    };
    await wrapper.vm.setState(JSON.stringify(state));
    expect(wrapper.vm.getState()).toEqual(
      stateObjectToBase64({ ...{ currentView: 'viewComponent' }, ...state })
    );
  });

  it('accepts a base64 encoded JSON object as state', async () => {
    const state = { filters: { hideName: ['package:json', 'class:User'] } };
    await wrapper.vm.setState(stateObjectToBase64(state));
    expect(wrapper.vm.getState()).toEqual(
      stateObjectToBase64({ ...{ currentView: 'viewComponent' }, ...state })
    );
  });

  it('changes views and modifies the trace filter after setState', async () => {
    const appState = '{"currentView":"viewFlow","traceFilter":"id:44"}';
    wrapper.vm.setState(appState);

    await Vue.nextTick();

    expect(wrapper.vm.isViewingFlow).toBe(true);
    expect(wrapper.vm.$refs.traceFilter).toBeTruthy();
  });

  it('toggles filters off if selectedObject is outside of the filtered set', async () => {
    wrapper.vm.setState('{"selectedObject":"event:3"}');
    expect(wrapper.vm.selectedObject.toString()).toMatch('Net::HTTP#request');

    Object.values(wrapper.vm.filters.declutter).forEach((filter) => {
      expect(filter.on).toBe(false);
    });

    await Vue.nextTick();

    expect(wrapper.text()).toMatch('Net::HTTP#request');
  });

  it('emits user events', () => {
    // Sanity checks
    expect(rootWrapper.emitted().showInstructions).toBeUndefined();
    expect(rootWrapper.emitted().changeTab).toBeArrayOfSize(1);
    expect(rootWrapper.emitted().selectedObject).toBeUndefined();

    wrapper.vm.showInstructions();
    expect(rootWrapper.emitted().showInstructions).toBeArrayOfSize(1);

    wrapper.vm.onChangeTab(wrapper.vm.$refs[VIEW_FLOW]);
    expect(rootWrapper.emitted().changeTab[1]).toContain(VIEW_FLOW);
  });

  it('creates a default filter', () => {
    const defaultFilter = new AppMapFilter();
    const serialized = serializeFilter(defaultFilter);
    const base64encoded = base64UrlEncode(JSON.stringify({ filters: serialized }));

    const expectedFilterObject = {
      filterName: 'AppMap default',
      state: base64encoded,
      default: true,
    };

    const actual = rootWrapper.emitted().saveFilter;
    expect(actual).toBeArrayOfSize(1);
    expect(actual[0][0]).toEqual(expectedFilterObject);
  });
});
