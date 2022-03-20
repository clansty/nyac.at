import { RouterView } from 'vue-router';
import { Transition } from 'vue';

export default defineComponent({
  render() {
    return (
      <div>
        <RouterView>
          {{
            default: ({ Component }: any) => (
              <Transition name="fade">
                <Component/>
              </Transition>
            ),
          }}
        </RouterView>
      </div>
    );
  },
});
