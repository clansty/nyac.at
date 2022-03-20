import { RouterView } from 'vue-router';
import { Transition } from 'vue';

export default defineComponent({
  render() {
    return (
      <div>
        <RouterView>
          {{
            default: ({ Component }: any) => (
              <Transition name="fade" duration={600} mode="out-in">
                <Component/>
              </Transition>
            ),
          }}
        </RouterView>
      </div>
    );
  },
});
